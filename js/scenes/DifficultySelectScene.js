// js/scenes/DifficultySelectScene.js
import { createButton } from '../utils/uiComponents.js';
import { gameState, difficultySettings, gameFont } from '../config/GameConfig.js';
import { playMusic } from '../utils/musicManager.js';

export default class DifficultySelectScene extends Phaser.Scene {
    constructor() {
        super('DifficultySelectScene');
    }

    preload() {
        if (gameState.musicInitialized && (!gameState.currentMusicLoop || gameState.currentMusicLoop.name !== "menu_music_identifier")) {
            playMusic("menu");
        }
    }

    create() {
        document.getElementById('instructions').textContent = `Greetings, ${gameState.playerName}! Choose Your Fate.`;
        this.add.text(this.cameras.main.width / 2, 100, 'Select Difficulty', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: gameFont
        }).setOrigin(0.5);

        const buttonYStart = 220;
        const buttonSpacing = 70;

        Object.keys(difficultySettings).forEach((key, index) => {
            const setting = difficultySettings[key];
            createButton(this, this.cameras.main.width / 2, buttonYStart + (index * buttonSpacing), setting.name,
                () => {
                    gameState.currentDifficultySettings = difficultySettings[key]; // Set global difficulty
                    this.scene.start('NarrationScene');
                }
            );
        });
    }

    shutdown() {
        // Clean up scene-specific resources if necessary
    }
}
