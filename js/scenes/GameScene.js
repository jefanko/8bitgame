// js/scenes/GameScene.js
import { 
    gameState, 
    difficultySettings, 
    gameFont, 
    warriorFrameWidth, warriorFrameHeight, 
    dragonFrameWidth, dragonFrameHeight,
    fireballFrameWidth, fireballFrameHeight,
    playerAttackCooldown, playerAttackDuration
} from '../config/GameConfig.js';
import { playMusic, stopMusic, playSoundEffect } from '../utils/musicManager.js'; // Import playSoundEffect
import { createButton } from '../utils/uiComponents.js';
import { isMobileDevice } from '../main.js'; 

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        console.log("[GameScene] Init data received:", data); 

        let difficultyKeyToUse = 'normal'; 

        if (!difficultySettings || typeof difficultySettings !== 'object') {
            console.error("[GameScene] CRITICAL: difficultySettings is not loaded or not an object! Check import from gameConfig.js. Using ultimate fallback.");
            gameState.currentDifficultySettings = { name: "Ultimate Fallback Normal", playerHP: 100, dragonHP: 300, dragonFireballDamage: 10, dragonBodyDamage: 12, dragonAttackDelayMin: 2500, dragonAttackDelayMax: 4000, dragonSpeed: 80,  dragonBodyDamageCooldown: 1000 };
        } else {
            if (data && data.difficulty && difficultySettings.hasOwnProperty(data.difficulty)) {
                difficultyKeyToUse = data.difficulty;
            } else {
                console.warn(`[GameScene] Invalid or missing difficulty in init data. Received: ${data ? data.difficulty : 'no data'}. Defaulting to 'normal'.`);
                difficultyKeyToUse = 'normal'; 
            }

            if (difficultySettings[difficultyKeyToUse]) {
                gameState.currentDifficultySettings = difficultySettings[difficultyKeyToUse];
            } 
            else if (difficultySettings.normal) { 
                console.warn(`[GameScene] Settings for key "${difficultyKeyToUse}" not found. Using 'normal' settings as fallback.`);
                gameState.currentDifficultySettings = difficultySettings.normal;
            } 
            else {
                console.error("[GameScene] CRITICAL: difficultySettings.normal is also undefined! Using hardcoded ultimate fallback.");
                gameState.currentDifficultySettings = { name: "Ultimate Fallback Normal (config error)", playerHP: 100, dragonHP: 300, dragonFireballDamage: 10, dragonBodyDamage: 12, dragonAttackDelayMin: 2500, dragonAttackDelayMax: 4000, dragonSpeed: 80,  dragonBodyDamageCooldown: 1000 };
            }
        }
        
        console.log("[GameScene] Applied difficulty settings:", JSON.stringify(gameState.currentDifficultySettings));

        gameState.playerName = (data && data.playerName) ? data.playerName : (gameState.playerName || "Warrior"); 
        
        gameState.playerHealth = (gameState.currentDifficultySettings && typeof gameState.currentDifficultySettings.playerHP === 'number') 
                                 ? gameState.currentDifficultySettings.playerHP 
                                 : 100; 

        gameState.dragonHealth = (gameState.currentDifficultySettings && typeof gameState.currentDifficultySettings.dragonHP === 'number')
                                 ? gameState.currentDifficultySettings.dragonHP
                                 : 300; 
        
        if (typeof gameState.playerHealth !== 'number' || typeof gameState.dragonHealth !== 'number') {
            console.error("[GameScene] Health values are not numbers after init! PlayerHP:", gameState.playerHealth, "DragonHP:", gameState.dragonHealth);
        }
        
        gameState.gameIsOver = false;
        gameState.lastPlayerAttackTime = 0;
        gameState.lastBodyCollisionTime = 0;
        gameState.swordHitbox = null;
        
        document.getElementById('instructions').textContent = isMobileDevice() ? "Use On-Screen Controls!" : "Arrow Keys: Move | Spacebar: Attack";
    }

    preload() {
        if (gameState.musicInitialized) {
            playMusic("battle");
        }
    }

    create() {
        this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'grassBG').setOrigin(0, 0);
        gameState.playableAreaTopY = 60; 

        gameState.player = this.physics.add.sprite(100, this.cameras.main.height / 2, 'warrior');
        gameState.player.setCollideWorldBounds(true).setBounce(0.1);
        gameState.player.body.setSize(warriorFrameWidth * 0.45, warriorFrameHeight * 0.7).setOffset(warriorFrameWidth * 0.27, warriorFrameHeight * 0.2);

        if (!this.anims.exists('player_idle')) { 
            this.anims.create({ key: 'player_idle', frames: this.anims.generateFrameNumbers('warrior', { start: 0, end: 1 }), frameRate: 3, repeat: -1 });
            this.anims.create({ key: 'player_walk', frames: this.anims.generateFrameNumbers('warrior', { start: 2, end: 5 }), frameRate: 8, repeat: -1 });
            this.anims.create({ key: 'player_attack', frames: this.anims.generateFrameNumbers('warrior', { start: 6, end: 9 }), frameRate: 12, repeat: 0 });
            this.anims.create({ key: 'player_hurt', frames: this.anims.generateFrameNumbers('warrior', { start: 10, end: 10 }), frameRate: 1, repeat: 0 });
            this.anims.create({ key: 'player_death', frames: this.anims.generateFrameNumbers('warrior', { start: 11, end: 13 }), frameRate: 4, repeat: 0 });
        }
        gameState.player.play('player_idle');

        gameState.player.on('animationcomplete-player_attack', () => { if (gameState.player.active && !gameState.gameIsOver) this.determinePlayerNextAnimation(); });
        gameState.player.on('animationcomplete-player_hurt', () => { if (gameState.player.active && !gameState.gameIsOver) this.determinePlayerNextAnimation(); });

        gameState.dragon = this.physics.add.sprite(this.cameras.main.width - 150, this.cameras.main.height / 2, 'dragon');
        gameState.dragon.setCollideWorldBounds(true).setImmovable(true);
        gameState.dragon.body.setSize(dragonFrameWidth * 0.55, dragonFrameHeight * 0.6).setOffset(dragonFrameWidth * 0.22, dragonFrameHeight * 0.25); 

        if (!this.anims.exists('dragon_idle')) {
            this.anims.create({ key: 'dragon_idle', frames: this.anims.generateFrameNumbers('dragon', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
            this.anims.create({ key: 'dragon_move', frames: this.anims.generateFrameNumbers('dragon', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
            this.anims.create({ key: 'dragon_attack', frames: this.anims.generateFrameNumbers('dragon', { start: 4, end: 7 }), frameRate: 6, repeat: 0 });
            this.anims.create({ key: 'dragon_hurt', frames: this.anims.generateFrameNumbers('dragon', { start: 8, end: 8 }), frameRate: 1, repeat: 0 });
            this.anims.create({ key: 'dragon_death', frames: this.anims.generateFrameNumbers('dragon', { start: 9, end: 12 }), frameRate: 5, repeat: 0 });
            this.anims.create({ key: 'fireball_anim', frames: this.anims.generateFrameNumbers('fireball', { start: 0, end: 1 }), frameRate: 5, repeat: -1 });
        }
        gameState.dragon.play('dragon_idle');
        gameState.dragon.setFlipX(true);

        gameState.dragon.on('animationcomplete-dragon_attack', () => {
            if (gameState.dragon.active && !gameState.gameIsOver) {
                const fireball = gameState.fireballs.get();
                if (fireball) {
                    fireball.enableBody(true, gameState.dragon.x + (gameState.dragon.flipX ? -45 : 45), gameState.dragon.y - 10, true, true); 
                    fireball.play('fireball_anim', true);
                    if (gameState.player.active) this.physics.moveToObject(fireball, gameState.player, 280); 
                    else fireball.setVelocityX(gameState.dragon.flipX ? -280 : 280);
                    fireball.body.setSize(fireballFrameWidth * 0.8, fireballFrameHeight * 0.8);
                }
                this.determineDragonNextAnimation();
            }
        });
        gameState.dragon.on('animationcomplete-dragon_hurt', () => { if (gameState.dragon.active && !gameState.gameIsOver) this.determineDragonNextAnimation(); });

        gameState.fireballs = this.physics.add.group({ defaultKey: 'fireball', maxSize: 5, runChildUpdate: true });
        
        this.dragonAttackTimer = this.time.addEvent({ 
            delay: Phaser.Math.Between(gameState.currentDifficultySettings.dragonAttackDelayMin, gameState.currentDifficultySettings.dragonAttackDelayMax), 
            callback: this.triggerDragonAttack, 
            callbackScope: this, 
            loop: true 
        });
        this.dragonMoveTimer = this.time.addEvent({ 
            delay: Phaser.Math.Between(1500, 2500), 
            callback: this.changeDragonMovement, 
            callbackScope: this, 
            loop: true 
        });
        this.changeDragonMovement(); 

        gameState.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-SPACE', this.handlePlayerAttack, this);

        if (isMobileDevice()) this.createTouchControls();

        this.physics.add.overlap(gameState.player, gameState.fireballs, this.handlePlayerHitByFireball, null, this);
        this.physics.add.overlap(gameState.player, gameState.dragon, this.handlePlayerDragonCollision, null, this);

        gameState.playerHealthText = this.add.text(16, 16, `${gameState.playerName} HP: ${gameState.playerHealth}`, { fontSize: '10px', fill: '#fff', fontFamily: gameFont }); 
        gameState.dragonHealthText = this.add.text(this.cameras.main.width - 16, 16, `Dragon HP: ${gameState.dragonHealth}`, { fontSize: '10px', fill: '#fff', fontFamily: gameFont }).setOrigin(1, 0);
    }
    
    createTouchControls() { /* ... same as before ... */ 
        const buttonSize = 70; 
        const padding = 25;
        const alpha = 0.4;

        gameState.touchControls.left = this.add.text(padding + buttonSize * 0.75, this.cameras.main.height - padding - buttonSize * 1.5, '◀', { fontFamily: gameFont, fontSize: '36px', fill: '#fff', backgroundColor: '#555', padding: {x:10, y:5} }).setAlpha(alpha).setInteractive().setScrollFactor(0).setOrigin(0.5);
        gameState.touchControls.right = this.add.text(padding + buttonSize * 2.25, this.cameras.main.height - padding - buttonSize * 1.5, '▶', { fontFamily: gameFont, fontSize: '36px', fill: '#fff', backgroundColor: '#555', padding: {x:10, y:5} }).setAlpha(alpha).setInteractive().setScrollFactor(0).setOrigin(0.5);
        gameState.touchControls.up = this.add.text(padding + buttonSize * 1.5, this.cameras.main.height - padding - buttonSize * 2.25, '▲', { fontFamily: gameFont, fontSize: '36px', fill: '#fff', backgroundColor: '#555', padding: {x:10, y:5} }).setAlpha(alpha).setInteractive().setScrollFactor(0).setOrigin(0.5);
        gameState.touchControls.down = this.add.text(padding + buttonSize * 1.5, this.cameras.main.height - padding - buttonSize * 0.75, '▼', { fontFamily: gameFont, fontSize: '36px', fill: '#fff', backgroundColor: '#555', padding: {x:10, y:5} }).setAlpha(alpha).setInteractive().setScrollFactor(0).setOrigin(0.5);
        
        gameState.touchControls.attack = this.add.text(this.cameras.main.width - padding - buttonSize, this.cameras.main.height - padding - buttonSize * 1.25, 'ATK', { fontFamily: gameFont, fontSize: '24px', fill: '#fff', backgroundColor: '#900', padding: {x:15, y:10} }).setAlpha(alpha+0.2).setInteractive().setScrollFactor(0).setOrigin(0.5);

        gameState.touchControls.active = true;

        const setupButtonEvents = (buttonObj, flagName) => {
            buttonObj.on('pointerdown', () => { gameState.touchControls[flagName] = true; buttonObj.setAlpha(alpha + 0.3); });
            buttonObj.on('pointerup', () => { gameState.touchControls[flagName] = false; buttonObj.setAlpha(alpha);});
            buttonObj.on('pointerout', () => { gameState.touchControls[flagName] = false; buttonObj.setAlpha(alpha);}); 
        };

        setupButtonEvents(gameState.touchControls.left, 'isLeftDown');
        setupButtonEvents(gameState.touchControls.right, 'isRightDown');
        setupButtonEvents(gameState.touchControls.up, 'isUpDown');
        setupButtonEvents(gameState.touchControls.down, 'isDownDown');
        
        gameState.touchControls.attack.on('pointerdown', () => {
            this.handlePlayerAttack(); 
            gameState.touchControls.attack.setAlpha(alpha + 0.4); 
        });
        gameState.touchControls.attack.on('pointerup', () => {gameState.touchControls.attack.setAlpha(alpha+0.2); });
        gameState.touchControls.attack.on('pointerout', () => {gameState.touchControls.attack.setAlpha(alpha+0.2); });
    }

    determinePlayerNextAnimation() { /* ... same as before ... */ 
        if (!gameState.player.active || gameState.gameIsOver) return;
        if (gameState.player.body.velocity.x !== 0 || gameState.player.body.velocity.y !== 0) gameState.player.play('player_walk', true);
        else gameState.player.play('player_idle', true);
    }
    determineDragonNextAnimation() { /* ... same as before ... */ 
        if (!gameState.dragon.active || gameState.gameIsOver) return;
        if (gameState.dragon.body.velocity.x !== 0 || gameState.dragon.body.velocity.y !== 0) gameState.dragon.play('dragon_move', true);
        else gameState.dragon.play('dragon_idle', true);
    }

    update(time, delta) { 
        if (gameState.gameIsOver) return;
        if (this.background) this.background.tilePositionX += 0.2; 

        if (gameState.player && gameState.player.active) { this.handlePlayerMovement(); this.updatePlayerAnimation(); }
        if (gameState.dragon && gameState.dragon.active) {
            if (gameState.dragon.y - (gameState.dragon.displayHeight * gameState.dragon.originY) < gameState.playableAreaTopY) {
                gameState.dragon.y = gameState.playableAreaTopY + (gameState.dragon.displayHeight * gameState.dragon.originY);
                if (gameState.dragon.body.velocity.y < 0) gameState.dragon.setVelocityY(0);
            }
            this.updateDragonAnimation(); 
        }
        if (gameState.swordHitbox && gameState.swordHitbox.active && gameState.player && gameState.player.active) {
            const swordOffsetX = gameState.player.flipX ? -(warriorFrameWidth*0.35) : (warriorFrameWidth*0.35); 
            gameState.swordHitbox.setPosition(gameState.player.x + swordOffsetX, gameState.player.y);
        }
    }
    handlePlayerMovement() { 
        if (!gameState.player.active || ['player_attack', 'player_hurt', 'player_death'].includes(gameState.player.anims.currentAnim.key)) {
            gameState.player.setVelocity(0); return;
        }
        const speed = 180; gameState.player.setVelocity(0);

        const leftPressed = gameState.cursors.left.isDown || (gameState.touchControls.active && gameState.touchControls.isLeftDown);
        const rightPressed = gameState.cursors.right.isDown || (gameState.touchControls.active && gameState.touchControls.isRightDown);
        const upPressed = gameState.cursors.up.isDown || (gameState.touchControls.active && gameState.touchControls.isUpDown);
        const downPressed = gameState.cursors.down.isDown || (gameState.touchControls.active && gameState.touchControls.isDownDown);

        if (leftPressed) { gameState.player.setVelocityX(-speed); gameState.player.setFlipX(true); }
        else if (rightPressed) { gameState.player.setVelocityX(speed); gameState.player.setFlipX(false); }
        if (upPressed) { gameState.player.setVelocityY(-speed); }
        else if (downPressed) { gameState.player.setVelocityY(speed); }
    }
    updatePlayerAnimation() { 
        if (!gameState.player.active || ['player_attack', 'player_hurt', 'player_death'].includes(gameState.player.anims.currentAnim.key)) return;
        if (gameState.player.body.velocity.x !== 0 || gameState.player.body.velocity.y !== 0) {
            if(gameState.player.anims.currentAnim.key !== 'player_walk') gameState.player.play('player_walk', true);
        } else {
            if(gameState.player.anims.currentAnim.key !== 'player_idle') gameState.player.play('player_idle', true);
        }
    }
    handlePlayerAttack() { 
        if (!gameState.player.active || gameState.gameIsOver || this.time.now < gameState.lastPlayerAttackTime + playerAttackCooldown || gameState.player.anims.currentAnim.key === 'player_attack') return;
        gameState.lastPlayerAttackTime = this.time.now;
        gameState.player.play('player_attack', false); gameState.player.setVelocity(0);
        playSoundEffect('slash'); // Play slash sound
        const swordOffsetX = gameState.player.flipX ? -(warriorFrameWidth*0.4) : (warriorFrameWidth*0.4); 
        gameState.swordHitbox = this.add.rectangle(gameState.player.x + swordOffsetX, gameState.player.y, warriorFrameWidth*0.7, warriorFrameHeight*0.5); 
        this.physics.add.existing(gameState.swordHitbox, true); gameState.swordHitbox.body.enable = true;
        this.physics.add.overlap(gameState.swordHitbox, gameState.dragon, this.handleSwordHitDragon, null, this);
        this.time.delayedCall(playerAttackDuration, () => { if (gameState.swordHitbox) { gameState.swordHitbox.destroy(); gameState.swordHitbox = null; }});
    }
    handleSwordHitDragon(hb, drg) { 
        if (hb === gameState.swordHitbox && hb.active && drg.active && !gameState.gameIsOver) {
            gameState.dragonHealth -= 30; 
            if(gameState.dragonHealthText) gameState.dragonHealthText.setText(`Dragon HP: ${Math.max(0, gameState.dragonHealth)}`);
            drg.play('dragon_hurt', true); drg.setTint(0xff0000);
            playSoundEffect('dragonHurt'); // Play dragon hurt sound
            this.time.delayedCall(150, () => { if (drg.active) drg.clearTint(); });
            if(hb) {hb.destroy(); gameState.swordHitbox = null;}
            if (gameState.dragonHealth <= 0) {
                drg.play('dragon_death');
                playSoundEffect('dragonDefeat'); // Play dragon defeat sound
                drg.once('animationcomplete-dragon_death', () => { 
                    if (drg.active) { drg.setActive(false); drg.setVisible(false); drg.destroy(); }
                    this.endGame(true); 
                }, this);
            } 
        }
    }
    handlePlayerDragonCollision(plyr, drg) { 
        if (!plyr.active || !drg.active || gameState.gameIsOver || this.time.now < gameState.lastBodyCollisionTime + gameState.currentDifficultySettings.dragonBodyDamageCooldown || ['dragon_hurt', 'dragon_death', 'dragon_attack'].includes(drg.anims.currentAnim.key)) return; 
        gameState.lastBodyCollisionTime = this.time.now;
        gameState.playerHealth -= gameState.currentDifficultySettings.dragonBodyDamage;
        if(gameState.playerHealthText) gameState.playerHealthText.setText(`${gameState.playerName} HP: ${Math.max(0, gameState.playerHealth)}`);
        plyr.play('player_hurt', true); plyr.setTint(0xff0000);
        playSoundEffect('playerHurt'); // Play player hurt sound
        this.time.delayedCall(150, () => { if (plyr.active) plyr.clearTint(); });
        if (gameState.playerHealth <= 0) {
            plyr.play('player_death');
            plyr.on('animationcomplete-player_death', () => { if (plyr.active) { plyr.setActive(false); plyr.setVisible(false); plyr.destroy(); } });
            this.endGame(false); 
        }
    }
    triggerDragonAttack() { 
        if (!gameState.dragon.active || !gameState.player.active || gameState.gameIsOver || ['dragon_attack', 'dragon_hurt', 'dragon_death'].includes(gameState.dragon.anims.currentAnim.key)) return;
        gameState.dragon.play('dragon_attack', false); gameState.dragon.setVelocity(0);
        // Fireball is launched on animation complete of dragon_attack
        if (this.dragonAttackTimer && this.dragonAttackTimer.elapsed > -1) { 
             this.dragonAttackTimer.delay = Phaser.Math.Between(gameState.currentDifficultySettings.dragonAttackDelayMin, gameState.currentDifficultySettings.dragonAttackDelayMax);
        }
    }
    changeDragonMovement() { 
        if (!gameState.dragon.active || gameState.gameIsOver || ['dragon_attack', 'dragon_hurt', 'dragon_death'].includes(gameState.dragon.anims.currentAnim.key)) return;
        const moveType = Phaser.Math.Between(0, 2);
        const speed = gameState.currentDifficultySettings.dragonSpeed;
        let targetX = (gameState.player && gameState.player.active) ? gameState.player.x : gameState.dragon.x;
        let targetY = (gameState.player && gameState.player.active) ? gameState.player.y : gameState.dragon.y;
        targetY = Math.max(targetY, gameState.playableAreaTopY + (gameState.dragon.displayHeight/2));
        targetY = Math.min(targetY, this.cameras.main.height - (gameState.dragon.displayHeight/2));
        if (gameState.player && gameState.player.active && gameState.player.x < gameState.dragon.x) gameState.dragon.setFlipX(true); 
        else if (gameState.player && gameState.player.active) gameState.dragon.setFlipX(false);
        switch (moveType) {
            case 0: if (gameState.player.active) this.physics.moveTo(gameState.dragon, targetX, targetY, speed); else gameState.dragon.setVelocity(0); break;
            case 1: gameState.dragon.setVelocityY(0); if (gameState.player.active) gameState.dragon.setVelocityX(targetX < gameState.dragon.x ? -speed : speed); else gameState.dragon.setVelocityX(Phaser.Math.RND.sign() * speed); break;
            case 2: gameState.dragon.setVelocityX(0); if (gameState.player.active) { if (Math.abs(gameState.dragon.y - targetY) > 5) gameState.dragon.setVelocityY(targetY < gameState.dragon.y ? -speed : speed); else gameState.dragon.setVelocityY(0); } else gameState.dragon.setVelocityY(Phaser.Math.RND.sign() * speed); break;
        }
    }
    updateDragonAnimation() { 
         if (!gameState.dragon.active || ['dragon_attack', 'dragon_hurt', 'dragon_death'].includes(gameState.dragon.anims.currentAnim.key)) return;
        if (gameState.dragon.body.velocity.x !== 0 || gameState.dragon.body.velocity.y !== 0) {
            if(gameState.dragon.anims.currentAnim.key !== 'dragon_move') gameState.dragon.play('dragon_move', true);
        } else {
            if(gameState.dragon.anims.currentAnim.key !== 'dragon_idle') gameState.dragon.play('dragon_idle', true);
        }
    }
    handlePlayerHitByFireball(plyr, fireball) { 
        if (!plyr.active || !fireball.active || gameState.gameIsOver) return;
        gameState.playerHealth -= gameState.currentDifficultySettings.dragonFireballDamage;
        if(gameState.playerHealthText) gameState.playerHealthText.setText(`${gameState.playerName} HP: ${Math.max(0, gameState.playerHealth)}`);
        plyr.play('player_hurt', true); plyr.setTint(0xff0000);
        playSoundEffect('playerHurt'); // Play player hurt sound
        this.time.delayedCall(150, () => { if (plyr.active) plyr.clearTint(); });
        fireball.destroy();
        if (gameState.playerHealth <= 0) {
            plyr.play('player_death');
            plyr.on('animationcomplete-player_death', () => { if (plyr.active) { plyr.setActive(false); plyr.setVisible(false); plyr.destroy(); } });
            this.endGame(false); 
        }
    }

    endGame(playerWon) { 
        if(gameState.gameIsOver) return; 
        gameState.gameIsOver = true;
        stopMusic(); 

        if (gameState.player && gameState.player.active) gameState.player.setVelocity(0);
        if (gameState.dragon && gameState.dragon.active) gameState.dragon.setVelocity(0);
        if (this.dragonAttackTimer) { this.dragonAttackTimer.destroy(); this.dragonAttackTimer = null; }
        if (this.dragonMoveTimer) { this.dragonMoveTimer.destroy(); this.dragonMoveTimer = null; }

        if(gameState.playerHealthText) gameState.playerHealthText.destroy();
        if(gameState.dragonHealthText) gameState.dragonHealthText.destroy();
        
        const existingGameOverText = this.children.getByName('gameOverText_GS'); 
        if(existingGameOverText) existingGameOverText.destroy();


        if (playerWon) {
            this.scene.start('EpilogueScene', { playerName: gameState.playerName });
        } else {
            let localGameOverText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
                `GAME OVER\n${gameState.playerName} was defeated.`, 
                { fontSize: '24px', fill: '#ff0000', fontFamily: gameFont, align: 'center' }
            ).setOrigin(0.5).setName('gameOverText_GS'); 
            document.getElementById('instructions').textContent = "Defeated!";
            document.getElementById('debug-info').textContent = ""; 
            this.time.delayedCall(1000, () => {
                createButton(this, this.cameras.main.width / 2, this.cameras.main.height / 2 + 80, 'Play Again?', 
                    () => {stopMusic(); this.scene.start('TitleScene');}
                );
            });
        }
    }
     shutdown() { 
        if (this.dragonAttackTimer) { this.dragonAttackTimer.destroy(); this.dragonAttackTimer = null; }
        if (this.dragonMoveTimer) { this.dragonMoveTimer.destroy(); this.dragonMoveTimer = null; }
        if (gameState.touchControls.active) {
            Object.keys(gameState.touchControls).forEach(key => {
                const control = gameState.touchControls[key];
                if (control && typeof control.destroy === 'function') {
                    control.destroy();
                }
                gameState.touchControls[key] = null; 
            });
            gameState.touchControls.active = false;
            gameState.touchControls.isLeftDown = false;
            gameState.touchControls.isRightDown = false;
            gameState.touchControls.isUpDown = false;
            gameState.touchControls.isDownDown = false;
        }
        if (this.input && this.input.keyboard) {
            this.input.keyboard.off('keydown-SPACE', this.handlePlayerAttack, this);
        }
    }
}
