import Phaser from 'phaser';

export default class SplashScene extends Phaser.Scene {
    constructor() {
        super('SplashScene');
    }

    preload() {
        this.load.image('menuBG', '/menu-background.png');
        
        // Simon (32x48)
        this.load.spritesheet('simon_idle', '/sprites/Simon/Simon-Idle (32 x 48).png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('simon_run', '/sprites/Simon/Simon-Running (32 x 48).png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('simon_jump', '/sprites/Simon/Simon-Jump (32 x 48).png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('simon_hurt', '/sprites/Simon/Simon-Hurt (32 x 48).png', { frameWidth: 32, frameHeight: 48 });

        // Dave (32x32)
        this.load.spritesheet('dave_idle', '/sprites/Dave/Dave-Idle_3 (32 x 32).png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('dave_run', '/sprites/Dave/Dave-Run (32 x 32).png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('dave_jump', '/sprites/Dave/Dave-Jump (32 x 32).png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('dave_hurt', '/sprites/Dave/Dave-Hurt (32 x 32).png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('dave_reload', '/sprites/Dave/Dave-Reloading_Crossbow (32 x 32).png', { frameWidth: 32, frameHeight: 32 });

        // Matt (32x32)
        this.load.spritesheet('matt_idle', '/sprites/Matt/Matt-Idle (32 x 32).png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('matt_run', '/sprites/Matt/Matt-Running (32 x 32).png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('matt_jump', '/sprites/Matt/Matt-Jump_&_Falling (32 x 32).png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('matt_hurt', '/sprites/Matt/Matt-Hurt (32 x 32).png', { frameWidth: 32, frameHeight: 32 });

        // Enemy: Barry Cherry (32x32)
        this.load.spritesheet('barry_cherry_idle', '/sprites/Barry Cherry/Idle (32 x 32).png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('barry_cherry_run', '/sprites/Barry Cherry/Running (32 x 32).png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('barry_cherry_hurt', '/sprites/Barry Cherry/Hurt (32 x 32).png', { frameWidth: 32, frameHeight: 32 });

        // Objects
        this.load.spritesheet('small_coin', '/sprites/objects/Common Pick-ups/Small_Coin (16 x 16).png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('big_coin', '/sprites/objects/Common Pick-ups/Coin (16 x 16).png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('heart_spin', '/sprites/objects/Common Pick-ups/Heart_Spin (16 x 16).png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('chest', '/sprites/objects/Common Pick-ups/Treasure_Chest (32 x 16).png', { frameWidth: 32, frameHeight: 16 });

        // UI - Spritesheet de 8x8 com 2 frames
        this.load.spritesheet('ui_heart', '/sprites/objects/Mini UI/Health_Indicator_White_Outline (8 x 8).png', { frameWidth: 8, frameHeight: 8 });

        // Common Assets
        this.load.image('bullet', '/sprites/common/bullet.png');
        this.load.image('arrow', '/sprites/common/arrow.png');
    }

    create() {
        this.add.image(400, 300, 'menuBG').setOrigin(0.5).setDisplaySize(800, 600);

        const startText = this.add.text(400, 500, 'CARREGA EM ENTER', {
            fontFamily: 'at01',
            fontSize: '48px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 800,
            ease: 'Linear',
            yoyo: true,
            loop: -1
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('MenuScene');
        });
    }
}
