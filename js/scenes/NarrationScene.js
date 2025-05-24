// js/scenes/NarrationScene.js
import { gameState, gameFont } from '../config/GameConfig.js';
import { playMusic } from '../utils/musicManager.js';

export default class NarrationScene extends Phaser.Scene {
    constructor() {
        super('NarrationScene');
    }

    init() { // Data is now primarily from gameState
        this.narrationLines = [
            `In the shadowed lands of Eldoria, a terror reigns...`,
            `The fearsome Dragon, Ignis, has seized the beloved Princess Aurelia!`,
            `Her desperate cries echo from the Dragon's Peak.`,
            `${gameState.playerName}, the kingdom's last hope, you must embark on this perilous quest.`,
            `Steel your heart, sharpen your blade...`,
            `For the fate of Aurelia and Eldoria rests upon your shoulders!`
        ];
        this.currentLineIndex = 0;
    }

    preload() {
        if (gameState.musicInitialized && (!gameState.currentMusicLoop || gameState.currentMusicLoop.name !== "menu_music_identifier")) {
            playMusic("menu");
        }
    }

    create() {
        document.getElementById('instructions').textContent = "The Tale Unfolds...";
        this.cameras.main.setBackgroundColor('#111111');

        this.narrationTextObject = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            this.narrationLines[this.currentLineIndex],
            {
                fontSize: '14px',
                fill: '#e0e0e0',
                fontFamily: gameFont,
                align: 'center',
                wordWrap: { width: this.cameras.main.width - 100 }
            }
        ).setOrigin(0.5);

        const promptText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 80,
            '[Press SPACE or TAP to Continue]',
            {
                fontSize: '12px',
                fill: '#888',
                fontFamily: gameFont,
                align: 'center'
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: promptText,
            alpha: 0.3,
            duration: 700,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.input.keyboard.on('keydown-SPACE', this.advanceNarration, this);
        this.input.on('pointerdown', this.advanceNarration, this);
    }

    advanceNarration() {
        this.currentLineIndex++;
        if (this.currentLineIndex < this.narrationLines.length) {
            if (this.narrationTextObject) {
                this.narrationTextObject.setText(this.narrationLines[this.currentLineIndex]);
            }
        } else {
            this.shutdownListeners(); // Call cleanup before starting next scene
            this.scene.start('GameScene');
        }
    }

    shutdownListeners() {
        if (this.input && this.input.keyboard) {
            this.input.keyboard.off('keydown-SPACE', this.advanceNarration, this);
        }
        if (this.input) {
            this.input.off('pointerdown', this.advanceNarration, this);
        }
    }

    shutdown() {
        this.shutdownListeners(); // Ensure listeners are off if scene is stopped externally
    }
}
