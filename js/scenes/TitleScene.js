// js/scenes/TitleScene.js
import { createButton } from '../utils/uiComponents.js';
import { initTone, playMusic, stopMusic } from '../utils/musicManager.js';
// Import gameFont directly, and gameState if other properties are needed from it.
import { gameState, gameFont } from '../config/GameConfig.js';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        document.getElementById('instructions').textContent = "Welcome, Brave Warrior!";

        this.add.text(this.cameras.main.width / 2, 150, 'Dragon Slayer', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: gameFont // Correctly use the imported gameFont
        }).setOrigin(0.5);

        createButton(this, this.cameras.main.width / 2, 300, 'Start Game', () => {
            if (!gameState.musicInitialized) {
                initTone();
            }
            playMusic("menu");
            this.scene.start('NameInputScene');
        });

        createButton(this, this.cameras.main.width / 2, 400, 'Exit', () => {
            stopMusic();
            document.getElementById('instructions').textContent = "Thanks for playing! Refresh to start over.";
            // Actual exit functionality is limited in web browsers
        });
    }

    shutdown() {
        // Clean up any scene-specific resources or listeners if necessary
    }
}
