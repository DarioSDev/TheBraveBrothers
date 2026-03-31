import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.add.text(400, 80, 'ESCOLHE O TEU HERÓI', { 
            fontFamily: 'at01',
            fontSize: '64px', fill: '#fff', stroke: '#000', strokeThickness: 8 
        }).setOrigin(0.5);

        const characters = [
            { name: 'Simon', key: 'simon_idle', x: 200 },
            { name: 'Dave', key: 'dave_idle', x: 400 },
            { name: 'Matt', key: 'matt_idle', x: 600 }
        ];

        characters.forEach(char => {
            const sprite = this.add.sprite(char.x, 300, char.key, 0)
                .setScale(2.5)
                .setInteractive({ useHandCursor: true });

            this.add.text(char.x, 420, char.name, { 
                fontFamily: 'at01',
                fontSize: '32px', fill: '#fff', stroke: '#000', strokeThickness: 4
            }).setOrigin(0.5);

            sprite.on('pointerdown', () => {
                this.scene.start('GameScene', { selectedHero: char.name });
            });

            sprite.on('pointerover', () => {
                sprite.setScale(2.8);
                sprite.setTint(0xffff00);
            });
            
            sprite.on('pointerout', () => {
                sprite.setScale(2.5);
                sprite.clearTint();
            });
        });
    }
}
