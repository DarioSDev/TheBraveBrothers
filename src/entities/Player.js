import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, heroType) {
        let texture = 'matt_idle';
        if (heroType === 'Simon') texture = 'simon_idle';
        else if (heroType === 'Dave') texture = 'dave_idle';
        
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setCollideWorldBounds(true);
        this.heroType = heroType;
        this.lastDirection = 1; 
        this.isAttacking = false;
        this.isReloading = false;
        this.isHurt = false;
        
        // Simon Heat System
        this.heat = 0;
        this.maxHeat = 100;
        this.isOverheated = false;

        // Escalas base
        if (this.heroType === 'Matt') {
            this.baseScale = 2; 
        } else if (this.heroType === 'Dave') {
            this.baseScale = 1.5; 
        } else if (this.heroType === 'Simon') {
            this.baseScale = 1.2; 
        }
        this.setScale(this.baseScale);

        this.setupStats();
        this.createAnims();
        this.updateHitbox();
    }

    updateHitbox() {
        if (this.heroType === 'Matt') {
            // Hitbox muito baixa: 15px * escala 2x = 30px de altura total.
            this.body.setSize(14, 15);
            this.body.setOffset(9, 17);
        } else if (this.heroType === 'Dave') {
            // 26px * escala 1.5x = 39px de altura total.
            this.body.setSize(16, 26);
            this.body.setOffset(8, 6);
        } else if (this.heroType === 'Simon') {
            // 38px * escala 1.2x = 45.6px de altura total.
            this.body.setSize(18, 38);
            this.body.setOffset(7, 10);
        }
    }

    createAnims() {
        const anims = this.scene.anims;

        const heroes = ['matt', 'dave', 'simon'];
        heroes.forEach(h => {
            if (!anims.exists(`${h}_idle`)) {
                anims.create({
                    key: `${h}_idle`,
                    frames: anims.generateFrameNumbers(`${h}_idle`, { start: 0, end: 5 }),
                    frameRate: 10,
                    repeat: -1
                });
                anims.create({
                    key: `${h}_run`,
                    frames: anims.generateFrameNumbers(`${h}_run`, { start: 0, end: 5 }),
                    frameRate: 12,
                    repeat: -1
                });
                anims.create({
                    key: `${h}_hurt`,
                    frames: anims.generateFrameNumbers(`${h}_hurt`, { start: 0, end: 0 }),
                    frameRate: 10,
                    repeat: -1
                });
                
                const jumpKey = `${h}_jump`;
                anims.create({
                    key: `${h}_jump`,
                    frames: (h === 'matt') ? anims.generateFrameNumbers(jumpKey, { start: 0, end: 0 }) : [{ key: jumpKey, frame: 0 }],
                    frameRate: 10,
                    repeat: -1
                });
                anims.create({
                    key: `${h}_air`,
                    frames: (h === 'matt') ? anims.generateFrameNumbers(jumpKey, { start: 1, end: 1 }) : [{ key: jumpKey, frame: 0 }],
                    frameRate: 10,
                    repeat: -1
                });
            }
        });

        if (!anims.exists('dave_reload')) {
            anims.create({
                key: 'dave_reload',
                frames: anims.generateFrameNumbers('dave_reload', { start: 0, end: 5 }),
                frameRate: 15,
                repeat: 0
            });
        }
    }

    setupStats() {
        if (this.heroType === 'Simon') {
            this.speed = 220;
            this.damage = 12;
            this.attackRate = 120;
            this.jumpForce = -380;
        } else if (this.heroType === 'Dave') {
            this.speed = 240;
            this.damage = 40;
            this.attackRate = 800; 
            this.jumpForce = -420;
        } else { // Matt
            this.speed = 280;
            this.damage = 25;
            this.attackRate = 350;
            this.jumpForce = -320;
        }
    }

    takeDamage() {
        if (this.isHurt) return;
        this.isHurt = true;
        this.body.setVelocityY(-250);
        this.body.setVelocityX(this.lastDirection * -200);
        this.setScale(this.baseScale * 1.2);
        
        this.scene.time.delayedCall(500, () => {
            this.isHurt = false;
            this.setScale(this.baseScale);
            this.updateHitbox();
        });
    }

    attack() {
        if (this.isAttacking || this.isOverheated || this.isReloading || this.isHurt) return;
        this.isAttacking = true;

        if (this.heroType === 'Simon') {
            this.attackSimon();
        } else if (this.heroType === 'Dave') {
            this.attackDave();
        } else if (this.heroType === 'Matt') {
            this.attackMatt();
        }

        this.scene.time.delayedCall(this.attackRate, () => {
            this.isAttacking = false;
        });
    }

    attackSimon() {
        this.heat += 20; 
        if (this.heat >= this.maxHeat) {
            this.triggerOverheat();
        }

        const spawnX = this.x + (20 * this.lastDirection);
        const spawnY = this.y + 6; 
        const bullet = this.scene.physics.add.sprite(spawnX, spawnY, 'bullet');
        bullet.setScale(1.2);
        bullet.body.setAllowGravity(false);

        const range = 350; 
        const targetX = spawnX + (range * this.lastDirection);

        this.scene.tweens.add({
            targets: bullet,
            x: targetX,
            duration: 350, 
            onUpdate: () => {
                this.scene.physics.overlap(bullet, this.scene.enemies, (b, enemy) => {
                    enemy.takeDamage(this.damage);
                    b.destroy(); 
                });
            },
            onComplete: () => { if (bullet.active) bullet.destroy(); }
        });
    }

    triggerOverheat() {
        this.isOverheated = true;
        this.setTint(0xff0000);
        this.overheatTween = this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 10 
        });

        this.scene.time.delayedCall(2000, () => {
            this.isOverheated = false;
            this.heat = 0;
            this.clearTint();
            this.setAlpha(1);
        });
    }

    attackDave() {
        const spawnX = this.x + (20 * this.lastDirection);
        const spawnY = this.y; 

        const arrow = this.scene.physics.add.sprite(spawnX, spawnY, 'arrow');
        arrow.setScale(1.5);
        if (this.lastDirection === -1) arrow.setFlipX(true);
        arrow.body.setAllowGravity(false);

        const range = 500; 
        const targetX = spawnX + (range * this.lastDirection);

        this.scene.tweens.add({
            targets: arrow,
            x: targetX,
            duration: 500, 
            onUpdate: () => {
                this.scene.physics.overlap(arrow, this.scene.enemies, (a, enemy) => {
                    enemy.takeDamage(this.damage);
                    a.destroy(); 
                });
            },
            onComplete: () => { if (arrow.active) arrow.destroy(); }
        });

        this.isReloading = true;
        this.play('dave_reload', true);
        this.once('animationcomplete-dave_reload', () => {
            this.isReloading = false;
        });
    }

    attackMatt() {
        const spawnX = this.x + (20 * this.lastDirection);
        const spawnY = this.y + 12; 
        const bullet = this.scene.physics.add.sprite(spawnX, spawnY, 'bullet');
        bullet.setScale(1.5);
        bullet.body.setAllowGravity(false);

        let hitEnemies = new Set();
        const range = 450; 
        const targetX = spawnX + (range * this.lastDirection);

        this.scene.tweens.add({
            targets: bullet,
            x: targetX,
            duration: 400,
            yoyo: false,
            onUpdate: () => {
                this.scene.physics.overlap(bullet, this.scene.enemies, (b, enemy) => {
                    if (!hitEnemies.has(enemy)) {
                        enemy.takeDamage(this.damage);
                        hitEnemies.add(enemy);
                    }
                });
            },
            onComplete: () => { if (bullet.active) bullet.destroy(); }
        });
    }

    update(cursors, keys) {
        if (!this.body) return;

        if (this.heroType === 'Simon' && !this.isOverheated && this.heat > 0) {
            this.heat -= 0.5;
        }

        let moving = false;
        if (!this.isHurt && !this.isReloading) {
            if (cursors.left.isDown) {
                this.body.setVelocityX(-this.speed);
                this.lastDirection = -1;
                this.setFlipX(true);
                moving = true;
            } else if (cursors.right.isDown) {
                this.body.setVelocityX(this.speed);
                this.lastDirection = 1;
                this.setFlipX(false);
                moving = true;
            } else {
                this.body.setVelocityX(0);
            }

            if (cursors.up.isDown && this.body.blocked.down) {
                this.body.setVelocityY(this.jumpForce);
            }
        } else if (this.isHurt) {
            // Knockback effect
        } else {
            this.body.setVelocityX(0);
        }

        const prefix = this.heroType.toLowerCase();

        if (this.isHurt) {
            this.play(`${prefix}_hurt`, true);
        } else if (this.isReloading && this.heroType === 'Dave') {
            // Anim controlada no attackDave
        } else if (!this.body.blocked.down) {
            if (this.body.velocity.y < 0) {
                this.play(`${prefix}_air`, true);
            } else {
                this.play(`${prefix}_jump`, true);
            }
        } else if (moving) {
            this.play(`${prefix}_run`, true);
        } else {
            this.play(`${prefix}_idle`, true);
        }

        if (Phaser.Input.Keyboard.JustDown(keys.space) || (this.heroType === 'Simon' && keys.space.isDown)) {
            this.attack();
        }
    }
}
