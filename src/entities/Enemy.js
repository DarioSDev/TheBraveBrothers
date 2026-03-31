import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type = 'barry_cherry') {
        const texture = `${type}_idle`;
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.body.setCollideWorldBounds(true);
        this.type = type;
        this.hp = (type === 'barry_cherry') ? 100 : 50;
        this.speed = 80;
        this.direction = 1;
        this.isHurt = false;

        // Inimigos maiores (2x)
        this.setScale(2);

        this.setupAnims();
        this.updateHitbox();
        
        // Mudança de direção aleatória
        scene.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.active && Math.random() > 0.5) this.direction *= -1;
            },
            loop: true
        });
    }

    updateHitbox() {
        if (this.type === 'barry_cherry') {
            // Ajuste da hitbox para escala 2x (Sprite 32x32 -> 64x64)
            // Vamos focar no corpo real do Barry Cherry
            this.body.setSize(20, 24);
            this.body.setOffset(6, 8);
        }
    }

    setupAnims() {
        const anims = this.scene.anims;
        if (!anims.exists(`${this.type}_idle_anim`)) {
            anims.create({
                key: `${this.type}_idle_anim`,
                frames: anims.generateFrameNumbers(`${this.type}_idle`, { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
            
            anims.create({
                key: `${this.type}_run_anim`,
                frames: anims.generateFrameNumbers(`${this.type}_run`, { start: 0, end: 5 }),
                frameRate: 12,
                repeat: -1
            });

            anims.create({
                key: `${this.type}_hurt_anim`,
                frames: anims.generateFrameNumbers(`${this.type}_hurt`, { start: 0, end: 0 }),
                frameRate: 10,
                repeat: -1
            });
        }
        this.play(`${this.type}_idle_anim`);
    }

    takeDamage(amount) {
        if (this.isHurt) return;
        this.hp -= amount;
        this.isHurt = true;

        this.setTint(0xff0000); // Pisca vermelho ao sofrer dano
        this.play(`${this.type}_hurt_anim`);

        this.scene.time.delayedCall(300, () => {
            if (this.active) {
                this.isHurt = false;
                this.clearTint();
                this.play(`${this.type}_idle_anim`);
            }
        });

        if (this.hp <= 0) {
            this.destroy();
        }
    }

    update() {
        if (!this.body || this.isHurt) return;

        this.body.setVelocityX(this.speed * this.direction);
        this.play(`${this.type}_run_anim`, true);
        this.setFlipX(this.direction === -1);
    }
}
