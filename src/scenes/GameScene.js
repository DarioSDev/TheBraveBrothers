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
        this.collectibles = 0;
        this.maxCollectibles = 5;
        this.isInvulnerable = false;
    }

    create() {
        const worldWidth = 2400;
        this.physics.world.setBounds(0, 0, worldWidth, 600);
        this.cameras.main.setBounds(0, 0, worldWidth, 600);

        // --- 1. AMBIENTE ---
        this.platforms = this.physics.add.staticGroup();
        
        // Retornar aos retângulos limpos (cinza escuro)
        const ground = this.add.rectangle(worldWidth / 2, 580, worldWidth, 40, 0x222222);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        // Passagens exclusivas para o Matt (Vão de 34px)
        const platformData = [
            { x: 300, y: 513, w: 120 }, 
            { x: 600, y: 460, w: 150 },
            { x: 900, y: 513, w: 150 }, 
            { x: 1200, y: 440, w: 200 },
            { x: 1500, y: 480, w: 150 },
            { x: 1900, y: 420, w: 200 },
            { x: 2200, y: 513, w: 150 } 
        ];

        platformData.forEach(p => this.addPlatform(p.x, p.y, p.w));

        // --- 2. GRUPOS ---
        this.enemies = this.add.group();
        this.spawnEnemies();
        this.physics.add.collider(this.enemies, this.platforms);

        this.items = this.physics.add.group({ allowGravity: false });
        
        this.createAnims();
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
        this.uiStatsText = this.add.text(20, 50, '', { 
            fontFamily: 'at01', fontSize: '22px', fill: '#ffd700', stroke: '#000', strokeThickness: 4
        });
        
        this.uiHearts = [];
        this.createHeartsUI();
        
        this.uiContainer.add([this.uiHeroText, this.uiStatsText]);
        this.updateUI();

        this.input.keyboard.on('keydown-P', () => this.switchHero());
        this.input.keyboard.on('keydown-R', () => this.scene.start('SplashScene'));
    }

    createHeartsUI() {
        this.uiHearts.forEach(h => h.destroy());
        this.uiHearts = [];
        const startX = 25;
        const startY = 90;
        const spacing = 15; // Mais apertado
        for (let i = 0; i < this.maxHearts; i++) {
            const heart = this.add.sprite(startX + (i * spacing), startY, 'ui_heart', 0);
            heart.setScale(1.5); // Reduzido (estava a 2.5)
            heart.setScrollFactor(0);
            this.uiHearts.push(heart);
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

    addPlatform(x, y, width, height = 25) {
        const rect = this.add.rectangle(x, y, width, height, 0x444444);
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
        // Moedas comuns
        for (let x = 200; x < worldWidth; x += 450) {
            this.createItem(x, 540, 'small_coin');
        }

        // CORREÇÃO: Itens nas passagens do Matt
        this.createItem(300, 545, 'small_coin'); // Era big_coin, mudei para small
        this.createItem(900, 545, 'small_coin'); // AQUI ESTAVA O CORAÇÃO, mudei para small_coin
        this.createItem(2200, 545, 'small_coin');

        platforms.forEach(p => {
            if (p.y < 500) this.createItem(p.x, p.y - 40, 'small_coin');
            if (p.x === 1200 || p.x === 1900) {
                this.createItem(p.x + 40, p.y - 40, 'chest');
            }
        });

        // Colecionáveis da missão (Cristais)
        [400, 800, 1300, 1700, 2100].forEach(x => {
            this.createItem(x, 400, 'collectible');
        });
    }

    createItem(x, y, type) {
        const item = this.physics.add.sprite(x, y, type);
        item.setData('type', type);
        this.items.add(item);

        if (type === 'small_coin') {
            item.play('small_coin_anim');
        } else if (type === 'heart_spin') {
            item.play('heart_anim');
            item.setScale(1.0);
        } else if (type === 'big_coin') {
            item.play('big_coin_anim');
            item.setScale(1.3);
        } else if (type === 'chest') {
            item.setFrame(0);
            item.setScale(1.5);
        } else if (type === 'collectible') {
            item.setScale(1.2);
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
        if (item.getData('isBeingCollected')) return;
        const type = item.getData('type');

        switch (type) {
            case 'small_coin':
                this.coins++;
                item.destroy();
                break;
            case 'big_coin':
                this.coins += 10;
                item.destroy();
                break;
            case 'heart_spin':
                if (this.hearts < this.maxHearts) {
                    this.hearts++;
                    this.updateHeartsUI();
                }
                item.destroy();
                break;
            case 'collectible':
                this.collectibles++;
                item.destroy();
                const popup = this.add.text(item.x, item.y - 20, 'CRISTAL!', { 
                    fontFamily: 'at01', fontSize: '20px', fill: '#00ff00', stroke: '#000', strokeThickness: 4
                }).setOrigin(0.5);
                this.tweens.add({ targets: popup, y: popup.y - 30, alpha: 0, duration: 1000, onComplete: () => popup.destroy() });
                
                if (this.collectibles >= this.maxCollectibles) {
                    const winText = this.add.text(400, 300, 'MISSÃO CUMPRIDA!', { 
                        fontFamily: 'at01', fontSize: '64px', fill: '#fff', stroke: '#000', strokeThickness: 8 
                    }).setOrigin(0.5).setScrollFactor(0);
                    this.time.delayedCall(3000, () => this.scene.start('MenuScene'));
                }
                break;
            case 'chest':
                item.setData('isBeingCollected', true);
                item.play('chest_open');
                this.time.delayedCall(300, () => {
                    const bigCoin = this.physics.add.sprite(item.x, item.y - 10, 'big_coin');
                    bigCoin.setData('type', 'big_coin');
                    this.items.add(bigCoin);
                    bigCoin.play('big_coin_anim');
                    bigCoin.setScale(1.5);
                    this.tweens.add({ targets: bigCoin, y: item.y - 40, duration: 400, ease: 'Back.easeOut' });
                    const valPopup = this.add.text(item.x, item.y - 40, '+10', { 
                        fontFamily: 'at01', fontSize: '24px', fill: '#ffd700', stroke: '#000', strokeThickness: 4
                    }).setOrigin(0.5);
                    this.tweens.add({ targets: valPopup, y: valPopup.y - 30, alpha: 0, duration: 1000, onComplete: () => valPopup.destroy() });
                });
                this.time.delayedCall(1500, () => item.destroy());
                break;
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
        const heartToAnimate = this.uiHearts[this.hearts - 1];
        if (heartToAnimate) {
            heartToAnimate.setFrame(1);
            this.time.delayedCall(300, () => heartToAnimate.setVisible(false));
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
        this.uiStatsText.setText(`Moedas: ${this.coins} | Cristais: ${this.collectibles}/${this.maxCollectibles}`);
    }

    updateHeartsUI() {
        for (let i = 0; i < this.maxHearts; i++) {
            if (i < this.hearts) {
                this.uiHearts[i].setVisible(true).setFrame(0);
            } else if (this.uiHearts[i].frame.name === 0) {
                this.uiHearts[i].setVisible(false);
            }
        }
    }

    update() {
        if (this.player) this.player.update(this.cursors, this.keys);
        this.enemies.getChildren().forEach(enemy => enemy.update());
    }
}
