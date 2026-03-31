import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.selectedHero = data.selectedHero || 'Simon';
        this.heroList = ['Simon', 'Dave', 'Matt'];
        this.heroIndex = this.heroList.indexOf(this.selectedHero);
        
        this.hearts = 5;
        this.maxHearts = 5;
        this.coins = 0;
        this.isInvulnerable = false;
    }

    create() {
        const worldWidth = 2400;
        this.physics.world.setBounds(0, 0, worldWidth, 600);
        this.cameras.main.setBounds(0, 0, worldWidth, 600);

        // --- 1. AMBIENTE ---
        this.platforms = this.physics.add.staticGroup();
        const ground = this.add.rectangle(worldWidth / 2, 580, worldWidth, 40, 0x333333);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        const platformData = [
            { x: 300, y: 520, w: 120 },
            { x: 600, y: 460, w: 150 },
            { x: 900, y: 500, w: 150 },
            { x: 1200, y: 440, w: 200 },
            { x: 1500, y: 480, w: 150 },
            { x: 1900, y: 420, w: 200 },
            { x: 2200, y: 500, w: 150 }
        ];

        platformData.forEach(p => this.addPlatform(p.x, p.y, p.w));

        // --- 2. GRUPOS ---
        this.enemies = this.add.group();
        this.spawnEnemies();
        this.physics.add.collider(this.enemies, this.platforms);

        this.items = this.physics.add.group({ allowGravity: false });
        this.spawnItems(platformData, worldWidth);

        // --- 3. JOGADOR ---
        this.player = new Player(this, 100, 400, this.selectedHero);
        this.setupPlayerInteractions();
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // --- 4. CONTROLOS ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            p: Phaser.Input.Keyboard.KeyCodes.P,
            r: Phaser.Input.Keyboard.KeyCodes.R
        });

        // --- 5. UI ---
        this.uiContainer = this.add.container(0, 0).setScrollFactor(0);
        
        this.uiHeroText = this.add.text(20, 20, '', { 
            fontFamily: 'at01', fontSize: '28px', fill: '#fff', stroke: '#000', strokeThickness: 4
        });
        this.uiCoinsText = this.add.text(20, 50, '', { 
            fontFamily: 'at01', fontSize: '24px', fill: '#ffd700', stroke: '#000', strokeThickness: 4
        });
        
        // Armazenar os ícones de vida num array para animação individual
        this.uiHearts = [];
        this.createHeartsUI();
        
        this.uiContainer.add([this.uiHeroText, this.uiCoinsText]);
        this.updateUI();

        this.createAnims();

        this.input.keyboard.on('keydown-P', () => this.switchHero());
        this.input.keyboard.on('keydown-R', () => this.scene.start('SplashScene'));
    }

    createHeartsUI() {
        // Limpar corações antigos se existirem
        this.uiHearts.forEach(h => h.destroy());
        this.uiHearts = [];

        const startX = 25;
        const startY = 90;
        const spacing = 20;

        for (let i = 0; i < this.maxHearts; i++) {
            const heart = this.add.sprite(startX + (i * spacing), startY, 'ui_heart', 0);
            heart.setScale(2.5);
            heart.setScrollFactor(0);
            this.uiHearts.push(heart);
            // Se o jogador tiver menos vida que o máximo no início (ex: troca de herói), esconder
            if (i >= this.hearts) heart.setVisible(false);
        }
    }

    createAnims() {
        if (!this.anims.exists('heart_anim')) {
            this.anims.create({
                key: 'heart_anim',
                frames: this.anims.generateFrameNumbers('heart_spin', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists('small_coin_anim')) {
            this.anims.create({
                key: 'small_coin_anim',
                frames: this.anims.generateFrameNumbers('small_coin', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists('big_coin_anim')) {
            this.anims.create({
                key: 'big_coin_anim',
                frames: this.anims.generateFrameNumbers('big_coin', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists('chest_open')) {
            this.anims.create({
                key: 'chest_open',
                frames: this.anims.generateFrameNumbers('chest', { start: 0, end: 4 }),
                frameRate: 12,
                repeat: 0
            });
        }
    }

    setupPlayerInteractions() {
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.overlap(this.player, this.enemies, () => this.handlePlayerDamage());
        this.physics.add.overlap(this.player, this.items, (p, item) => this.collectItem(item));
    }

    addPlatform(x, y, width) {
        const rect = this.add.rectangle(x, y, width, 25, 0x666666);
        this.physics.add.existing(rect, true);
        this.platforms.add(rect);
    }

    spawnEnemies() {
        [600, 1000, 1500, 2000].forEach(x => {
            const enemy = new Enemy(this, x, 400, 'barry_cherry');
            this.enemies.add(enemy);
        });
    }

    spawnItems(platforms, worldWidth) {
        for (let x = 200; x < worldWidth; x += 400) {
            this.createItem(x, 540, 'small_coin');
        }

        platforms.forEach(p => {
            this.createItem(p.x, p.y - 40, 'small_coin');
            if (p.x === 1200 || p.x === 1900) {
                this.createItem(p.x + 40, p.y - 40, 'chest');
            }
        });

        this.createItem(900, 460, 'heart_spin');
    }

    createItem(x, y, type) {
        const item = this.physics.add.sprite(x, y, type);
        item.type = type;
        this.items.add(item);

        if (type === 'small_coin') {
            item.play('small_coin_anim');
        } else if (type === 'heart_spin') {
            item.play('heart_anim');
            item.setScale(1.2);
        } else if (type === 'chest') {
            item.setFrame(0);
            item.setScale(1.5);
        }

        this.tweens.add({
            targets: item,
            y: y - 5,
            duration: 800,
            yoyo: true,
            loop: -1,
            ease: 'Sine.easeInOut'
        });
    }

    collectItem(item) {
        if (item.isBeingCollected) return;

        if (item.type === 'small_coin') {
            this.coins++;
            item.destroy();
        } else if (item.type === 'big_coin') {
            this.coins += 10;
            item.destroy();
        } else if (item.type === 'heart_spin') {
            if (this.hearts < this.maxHearts) {
                this.hearts++;
                this.updateHeartsUI();
            }
            item.destroy();
        } else if (item.type === 'chest') {
            item.isBeingCollected = true;
            item.play('chest_open');
            
            this.time.delayedCall(300, () => {
                const bigCoin = this.physics.add.sprite(item.x, item.y - 10, 'big_coin');
                bigCoin.type = 'big_coin';
                this.items.add(bigCoin);
                bigCoin.play('big_coin_anim');
                bigCoin.setScale(1.5);
                
                // Impulso controlado
                bigCoin.body.setVelocityY(-120);
                this.time.delayedCall(350, () => {
                    if (bigCoin.body) bigCoin.body.setVelocityY(0);
                });

                const popup = this.add.text(item.x, item.y - 40, '+10', { 
                    fontFamily: 'at01', fontSize: '24px', fill: '#ffd700', stroke: '#000', strokeThickness: 4
                }).setOrigin(0.5);
                
                this.tweens.add({
                    targets: popup,
                    y: popup.y - 30,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => popup.destroy()
                });
            });

            this.time.delayedCall(1000, () => {
                this.tweens.add({
                    targets: item,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => item.destroy()
                });
            });
        }

        if (this.coins >= 100) {
            this.coins = 0;
            if (this.hearts < this.maxHearts) {
                this.hearts++;
                this.updateHeartsUI();
            }
        }

        this.updateUI();
    }

    handlePlayerDamage() {
        if (this.isInvulnerable) return;
        
        // Animação do coração a desaparecer
        const heartToAnimate = this.uiHearts[this.hearts - 1];
        if (heartToAnimate) {
            heartToAnimate.setFrame(1); // Muda para o ponto branco
            this.time.delayedCall(300, () => {
                heartToAnimate.setVisible(false);
            });
        }

        this.hearts--;
        this.updateUI();
        if (this.hearts <= 0) {
            this.scene.start('SplashScene');
            return;
        }
        
        this.player.takeDamage();
        this.isInvulnerable = true;
        this.player.setAlpha(0.5);
        this.time.delayedCall(1500, () => {
            this.isInvulnerable = false;
            this.player.setAlpha(1);
        });
    }

    switchHero() {
        this.heroIndex = (this.heroIndex + 1) % this.heroList.length;
        this.selectedHero = this.heroList[this.heroIndex];
        const { x, y } = this.player;
        this.player.destroy();
        this.player = new Player(this, x, y - 50, this.selectedHero);
        this.setupPlayerInteractions();
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.updateUI();
        this.updateHeartsUI();
    }

    updateUI() {
        this.uiHeroText.setText(`${this.selectedHero}`);
        this.uiCoinsText.setText(`Moedas: ${this.coins}`);
    }

    updateHeartsUI() {
        for (let i = 0; i < this.maxHearts; i++) {
            if (i < this.hearts) {
                this.uiHearts[i].setVisible(true).setFrame(0);
            } else {
                // Manter invisível se o dano já foi processado
                if (this.uiHearts[i].frame.name === 0) {
                    this.uiHearts[i].setVisible(false);
                }
            }
        }
    }

    update() {
        if (this.player) this.player.update(this.cursors, this.keys);
        this.enemies.getChildren().forEach(enemy => enemy.update());
    }
}
