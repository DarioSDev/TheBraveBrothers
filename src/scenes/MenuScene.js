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

        // Linha de base onde os pés de todos vão assentar
        const floorY = 400;

        characters.forEach(char => {
            // Definimos a origem em (0.5, 1) para que o ponto Y represente a base (pés) do sprite
            const sprite = this.add.sprite(char.x, floorY, char.key, 0)
                .setOrigin(0.5, 1)
                .setScale(3) // Escala aumentada para melhor visualização no menu
                .setInteractive({ useHandCursor: true });

            this.add.text(char.x, floorY + 20, char.name, { 
                fontFamily: 'at01',
                fontSize: '32px', fill: '#fff', stroke: '#000', strokeThickness: 4
            }).setOrigin(0.5, 0);

            sprite.on('pointerdown', () => {
                this.scene.start('GameScene', { selectedHero: char.name });
            });

            sprite.on('pointerover', () => {
                sprite.setScale(3.3);
                sprite.setTint(0xffff00);
            });
            
            sprite.on('pointerout', () => {
                sprite.setScale(3);
                sprite.clearTint();
            });
        });
    }
}
