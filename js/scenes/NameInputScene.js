// js/scenes/NameInputScene.js
import { gameState } from '../config/GameConfig.js';
import { playMusic } from '../utils/musicManager.js'; // Assuming music is already initialized

export default class NameInputScene extends Phaser.Scene {
    constructor() {
        super('NameInputScene');
    }

    preload() {
        // Ensure menu music continues if it was playing
        if (gameState.musicInitialized && (!gameState.currentMusicLoop || gameState.currentMusicLoop.name !== "menu_music_identifier")) { // Use a more specific identifier if needed
            playMusic("menu");
        }
    }

    create() {
        document.getElementById('instructions').textContent = "Forge Your Legend!";
        const nameInputContainer = document.getElementById('nameInputContainer');
        const nameInputField = document.getElementById('nameInputField');
        const nameSubmitButton = document.getElementById('nameSubmitButton');

        if (!nameInputContainer || !nameInputField || !nameSubmitButton) {
            console.error("Name input HTML elements not found in NameInputScene!");
            this.scene.start('TitleScene'); // Fallback if HTML elements are missing
            return;
        }

        nameInputContainer.style.display = 'block';
        nameInputField.value = gameState.playerName;
        nameInputField.focus();

        // Define handlers within create or as methods if they need `this` from the scene
        const submitNameHandler = () => {
            const enteredName = nameInputField.value.trim();
            gameState.playerName = enteredName || "Warrior"; // Update global state

            nameInputContainer.style.display = 'none';
            nameInputField.removeEventListener('keypress', enterKeyHandler);

            // Clean up button listener by replacing the button or specifically removing
            const oldButton = document.getElementById('nameSubmitButton');
            if (oldButton) {
                const newButton = oldButton.cloneNode(true);
                oldButton.parentNode.replaceChild(newButton, oldButton);
                // The new button won't have the old listener.
                // If you need to re-attach for some reason, do it here, but for one-time submit, this is fine.
            }

            this.scene.start('DifficultySelectScene'); // Pass playerName via gameState or init data
        };

        const enterKeyHandler = (event) => {
            if (event.key === 'Enter') {
                submitNameHandler();
            }
        };

        // Ensure we are working with the correct button element after potential DOM manipulation
        const currentSubmitButton = document.getElementById('nameSubmitButton');
        currentSubmitButton.addEventListener('click', submitNameHandler);
        nameInputField.addEventListener('keypress', enterKeyHandler);

        // Store handlers to remove them in shutdown, if they were added to elements that persist
        // or if the scene could be re-entered and listeners might stack.
        // For DOM elements outside Phaser's control, manual cleanup is good.
        this.submitNameHandler = submitNameHandler; // Store for potential removal
        this.enterKeyHandler = enterKeyHandler;     // Store for potential removal
    }

    shutdown() {
        const nameInputContainer = document.getElementById('nameInputContainer');
        const nameInputField = document.getElementById('nameInputField');
        const nameSubmitButton = document.getElementById('nameSubmitButton');

        if (nameInputContainer) nameInputContainer.style.display = 'none';

        // Clean up listeners to prevent multiple executions if scene is revisited
        if (nameInputField && this.enterKeyHandler) {
            nameInputField.removeEventListener('keypress', this.enterKeyHandler);
        }
        if (nameSubmitButton && this.submitNameHandler) {
            // If button was cloned, this specific listener instance might not be on the current button.
            // Cloning the button in submitNameHandler is a more robust way to clear listeners.
            // Or, ensure the listener is added to the *current* button reference in create.
        }
    }
}
