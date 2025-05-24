// js/scenes/PreloadScene.js
import {
    warriorFrameWidth, warriorFrameHeight, warriorFrames, warriorSpriteSheetUrl,
    dragonFrameWidth, dragonFrameHeight, dragonFrames, dragonSpriteSheetUrl,
    fireballFrameWidth, fireballFrameHeight, fireballFrames, fireballSpriteSheetUrl,
    princessFrameWidth, princessFrameHeight, princessFrames, princessSpriteSheetUrl
} from '../utils/svgAssets.js'; // Assuming svgAssets.js exports these

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        document.getElementById('instructions').textContent = "Loading Assets...";

        // Load spritesheets (URLs are now imported from svgAssets.js)
        this.load.spritesheet('warrior', warriorSpriteSheetUrl, { frameWidth: warriorFrameWidth, frameHeight: warriorFrameHeight });
        this.load.spritesheet('dragon', dragonSpriteSheetUrl, { frameWidth: dragonFrameWidth, frameHeight: dragonFrameHeight });
        this.load.spritesheet('fireball', fireballSpriteSheetUrl, { frameWidth: fireballFrameWidth, frameHeight: fireballFrameHeight });
        this.load.spritesheet('princess', princessSpriteSheetUrl, { frameWidth: princessFrameWidth, frameHeight: princessFrameHeight });

        // Generate grass texture
        const grassTextureKey = 'grassBG';
        if (!this.textures.exists(grassTextureKey)) {
            let gfx = this.add.graphics();
            gfx.fillStyle(0x103c10, 1);
            gfx.fillRect(0, 0, 64, 64);
            gfx.fillStyle(0x206820, 1);
            for (let i = 0; i < 15; i++) {
                gfx.fillRect(Phaser.Math.Between(0, 60), Phaser.Math.Between(0, 60), Phaser.Math.Between(2, 5), Phaser.Math.Between(2, 5));
            }
            gfx.fillStyle(0x002c00, 0.5);
            for (let i = 0; i < 5; i++) {
                gfx.fillCircle(Phaser.Math.Between(0, 64), Phaser.Math.Between(0, 64), Phaser.Math.Between(5, 10));
            }
            gfx.generateTexture(grassTextureKey, 64, 64);
            gfx.destroy();
        }
    }

    create() {
        // After loading, transition to the Title Scene
        this.scene.start('TitleScene');
    }
}
