// js/scenes/EpilogueScene.js
import { createButton } from '../utils/uiComponents.js';
import { gameState, gameFont } from '../config/GameConfig.js';
import { playMusic, stopMusic } from '../utils/musicManager.js';

export default class EpilogueScene extends Phaser.Scene {
    constructor() {
        super('EpilogueScene');
    }

    init(data) {
        // gameState.playerName should be set from GameScene or earlier
        this.epilogueLines = [
            `With Ignis vanquished, ${gameState.playerName} reached the Dragon's spire.`,
            `There, amidst riches and ruin, stood Princess Aurelia, safe at last.`,
            `Her eyes, filled with gratitude, met the hero's gaze.`,
            `Peace returned to Eldoria, songs of ${gameState.playerName}'s valor echoing through the land.`,
            `And the brave warrior and the fair princess...?`,
            `Well, that, perhaps, is a tale for another day... THE END.`
        ];
        this.currentLineIndex = 0;
    }

    preload() {
        if (gameState.musicInitialized) {
            playMusic("epilogue");
        }
    }

    create() {
        document.getElementById('instructions').textContent = "A Hero's Welcome!";
        this.cameras.main.setBackgroundColor('#2d2d2d'); 

        const warriorEp = this.add.sprite(this.cameras.main.width / 2 - 60, this.cameras.main.height / 2 + 50, 'warrior');
        if (!this.anims.exists('ep_warrior_idle')) {
            this.anims.create({ key: 'ep_warrior_idle', frames: this.anims.generateFrameNumbers('warrior', { start: 0, end: 1 }), frameRate: 3, repeat: -1 });
        }
        warriorEp.play('ep_warrior_idle').setScale(2);

        const princessEp = this.add.sprite(this.cameras.main.width / 2 + 60, this.cameras.main.height / 2 + 50, 'princess');
        if (!this.anims.exists('ep_princess_idle')) {
            this.anims.create({ key: 'ep_princess_idle', frames: this.anims.generateFrameNumbers('princess', { start: 0, end: 1 }), frameRate: 2, repeat: -1 });
        }
        princessEp.play('ep_princess_idle').setScale(1.8).setFlipX(true);

        this.epilogueTextObject = this.add.text(
            this.cameras.main.width / 2, 
            150, 
            this.epilogueLines[this.currentLineIndex], 
            { 
                fontSize: '14px', 
                fill: '#e0e0e0', 
                fontFamily: gameFont, 
                align: 'center', 
                wordWrap: { width: this.cameras.main.width - 100 } 
            }
        ).setOrigin(0.5);

        this.promptText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height - 150, 
            '[Press SPACE or TAP to Continue]', 
            { 
                fontSize: '12px', 
                fill: '#888', 
                fontFamily: gameFont, 
                align: 'center' 
            }
        ).setOrigin(0.5);
        
        this.tweens.add({
            targets: this.promptText,
            alpha: 0.3,
            duration: 700,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.input.keyboard.on('keydown-SPACE', this.advanceEpilogue, this);
        this.input.on('pointerdown', this.advanceEpilogue, this);
    }

    advanceEpilogue() {
        this.currentLineIndex++;
        if (this.currentLineIndex < this.epilogueLines.length) {
            if (this.epilogueTextObject) {
                this.epilogueTextObject.setText(this.epilogueLines[this.currentLineIndex]);
            }
        } else {
            this.shutdownListeners();
            if (this.promptText) {this.promptText.destroy(); this.promptText = null;}
            createButton(this, this.cameras.main.width / 2, this.cameras.main.height - 80, 'Play Again?', 
                () => { 
                    stopMusic(); 
                    this.scene.start('TitleScene'); 
                }
            );
        }
    }

    shutdownListeners() {
        if (this.input && this.input.keyboard) {
            this.input.keyboard.off('keydown-SPACE', this.advanceEpilogue, this);
        }
        if (this.input) {
            this.input.off('pointerdown', this.advanceEpilogue, this);
        }
    }

    shutdown() {
        this.shutdownListeners();
    }
}
