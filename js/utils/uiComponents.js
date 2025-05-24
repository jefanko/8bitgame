// js/utils/uiComponents.js
import { gameFont } from '../config/GameConfig.js'; // Import gameFont

export function createButton(scene, x, y, text, callback) {
    const button = scene.add.text(x, y, text, {
        fontSize: '16px',
        fill: '#fff',
        backgroundColor: '#333',
        padding: { x: 15, y: 8 },
        fontFamily: gameFont, // Now gameFont is correctly referenced
        align: 'center'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setStyle({ fill: '#ffdd00', backgroundColor: '#555' }));
    button.on('pointerout', () => button.setStyle({ fill: '#fff', backgroundColor: '#333' }));
    button.on('pointerdown', callback);
    return button;
}
