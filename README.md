# 8-Bit Dragon Slayer

## About The Game

**8-Bit Dragon Slayer** is a retro-style, web-based adventure game where you take on the role of a valiant warrior. Your epic quest is to defeat the fearsome dragon, Ignis, and rescue the beloved Princess Aurelia from his fiery clutches. Navigate through challenges, master your sword, dodge attacks, and bring peace back to the kingdom of Eldoria!

This game is built using HTML, JavaScript, and the Phaser 3 game framework, featuring synthesized 8-bit music with Tone.js and a classic pixel art aesthetic (currently using SVG placeholders).

## Features

* **Classic 8-Bit Graphics:** Retro pixel art style (currently implemented with dynamic SVGs, easily replaceable with custom sprite sheets).
* **Engaging Narrative:** A storyline involving saving Princess Aurelia, with pre-game narration and a rewarding epilogue cutscene.
* **Player Control:** Smooth warrior movement (up, down, left, right) and sword attack mechanics.
* **Dynamic Dragon AI:** The dragon moves, attacks with fireballs, and can cause damage on body contact.
* **Difficulty Levels:** Choose from Easy, Normal, or Hard modes, affecting player/dragon HP, attack damage, and dragon behavior.
* **Player Customization:** Enter your warrior's name to personalize your adventure.
* **Synthesized 8-bit Music:** Unique themes for the menu, battle, and epilogue created with Tone.js.
* **Scenic Background:** A scrolling grass background in the battle scene to enhance the epic feel.
* **Multiple Game Scenes:** Title screen, name input, difficulty selection, narration, main game, and epilogue.

## Technologies Used

* **HTML5**
* **JavaScript (ES6+)**
* **Phaser 3:** A fast, free, and fun open-source HTML5 game framework.
* **Tone.js:** A Web Audio framework for creating interactive music in the browser.
* **Tailwind CSS:** Used for basic styling of the HTML page elements outside the game canvas.

## How to Play

1.  **Start the Game:** Open the `index.html` file in a modern web browser.
2.  **Main Menu:**
    * Click "Start Game" to begin your adventure.
    * Click "Exit" to (metaphorically) leave the game.
3.  **Enter Your Name:** Type in your desired warrior name and click "Continue" or press Enter.
4.  **Select Difficulty:** Choose between Easy, Normal, or Hard.
5.  **Narration:** Immerse yourself in the story. Press **SPACEBAR** to advance through the text.
6.  **Gameplay:**
    * **Arrow Keys:** Move your warrior (Up, Down, Left, Right).
    * **SPACEBAR:** Swing your sword to attack the dragon.
7.  **Objective:**
    * Dodge the dragon's fireballs and avoid direct contact with its body.
    * Attack the dragon with your sword until its HP reaches zero.
    * Save Princess Aurelia!
8.  **Epilogue/Game Over:**
    * If you win, enjoy a short cutscene and epilogue narration. Press **SPACEBAR** to advance.
    * If you are defeated, a "Game Over" message will appear.
    * In both cases, a "Play Again?" button will allow you to return to the Title Screen.

## Setup and Running Locally

1.  **No Build Step Required:** This game is designed to run directly from the `index.html` file.
2.  **Run with a Local Server:** Due to browser security restrictions (CORS) when loading assets, it's best to run the game using a local web server.
    * **Using VS Code Live Server:** If you have Visual Studio Code and the "Live Server" extension, right-click on `index.html` and select "Open with Live Server."
    * **Using Python's HTTP Server:**
        * Open your terminal or command prompt.
        * Navigate to the project's root directory (where `index.html` is located).
        * Run the command:
            * Python 3: `python -m http.server`
            * Python 2: `python -m SimpleHTTPServer`
        * Open your browser and go to `http://localhost:8000` (or the port indicated by the server).
    * **Using Node.js `http-server`:**
        * If you have Node.js and npm installed, you can install `http-server` globally: `npm install -g http-server`
        * Navigate to the project's root directory.
        * Run: `http-server`
        * Open your browser and go to `http://localhost:8080` (or the port indicated).

## Assets & Credits

* **Sprites:** Currently implemented using dynamically generated SVG placeholders for an 8-bit style. These are intended to be replaced with custom pixel art sprite sheets for a more polished look.
* **Music:** All music is synthesized in real-time using Tone.js. No external audio files are used.
* **Font:** Uses the "Press Start 2P" Google Font for the 8-bit aesthetic.

## Future Enhancements (Ideas)

* Replace SVG placeholders with detailed pixel art sprite sheets.
* Add sound effects for attacks, hits, and other actions.
* More complex dragon attack patterns and behaviors.
* Additional enemy types or environmental hazards.
* Player power-ups or special abilities.
* A more detailed game world with multiple levels or areas.
* Persistent high scores or player progress.

---

Thank you for checking out 8-Bit Dragon Slayer! Happy dragon slaying!
