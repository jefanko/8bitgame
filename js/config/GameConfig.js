// js/config/gameConfig.js

export const gameFont = "'Press Start 2P', cursive";

export const warriorFrameWidth = 48;
export const warriorFrameHeight = 64;

export const dragonFrameWidth = 96;
export const dragonFrameHeight = 80;

export const fireballFrameWidth = 16;
export const fireballFrameHeight = 16;

export const princessFrameWidth = 48;
export const princessFrameHeight = 64;

export const playerAttackCooldown = 600;
export const playerAttackDuration = 350;

export const difficultySettings = {
    easy: { name: "Easy", playerHP: 150, dragonHP: 250, dragonFireballDamage: 8, dragonBodyDamage: 10, dragonAttackDelayMin: 3000, dragonAttackDelayMax: 4500, dragonSpeed: 70, dragonBodyDamageCooldown: 1500 },
    normal: { name: "Normal", playerHP: 100, dragonHP: 350, dragonFireballDamage: 12, dragonBodyDamage: 15, dragonAttackDelayMin: 2500, dragonAttackDelayMax: 4000, dragonSpeed: 90, dragonBodyDamageCooldown: 1000 },
    hard: { name: "Hard", playerHP: 80, dragonHP: 500, dragonFireballDamage: 18, dragonBodyDamage: 20, dragonAttackDelayMin: 1500, dragonAttackDelayMax: 3000, dragonSpeed: 110, dragonBodyDamageCooldown: 750 }
};

// Global game state (alternative to exporting many variables from main.js)
// This object can be imported and modified by scenes carefully.
export const gameState = {
    player: null,
    dragon: null,
    princess: null,
    cursors: null,
    swordHitbox: null,
    lastPlayerAttackTime: 0,
    playerHealth: 100,
    dragonHealth: 300,
    playerHealthText: null,
    dragonHealthText: null,
    gameOverText: null,
    narrationTextObject: null,
    fireballs: null,
    gameIsOver: false,
    debugText: null,
    currentDifficultySettings: difficultySettings.normal, // Default
    lastBodyCollisionTime: 0,
    playerName: "Warrior",
    // Touch control states
    touchControls: {
        up: null, down: null, left: null, right: null, attack: null,
        active: false,
        isLeftDown: false, isRightDown: false, isUpDown: false, isDownDown: false
    },
    // Music state
    menuMusicLoop: null,
    battleMusicLoop: null,
    epilogueMusicLoop: null,
    currentMusicLoop: null,
    musicInitialized: false,
    playableAreaTopY: 60,
    // Add other shared variables here if necessary
};
