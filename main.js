import Phaser from 'phaser';
import SplashScene from './src/scenes/SplashScene.js';
import MenuScene from './src/scenes/MenuScene.js';
import GameScene from './src/scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: { 
        default: 'arcade', 
        arcade: { 
            gravity: { y: 1000 },
            debug: false // Podes mudar para true para ver as hitboxes
        } 
    },
    scene: [SplashScene, MenuScene, GameScene] 
};

new Phaser.Game(config);
