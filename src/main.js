import Phaser from 'phaser';
import Preloader from './scenes/Preloader';
import GameScene from './scenes/GameScene';
import { jwtDecode } from "jwt-decode";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [Preloader, GameScene]
};

const game = new Phaser.Game(config);

window.handleCredentialResponse = (response) => {
    try {
        const decoded = jwtDecode(response.credential);
        console.log("User logged in:", decoded.name);

        // Hide login button
        const loginContainer = document.getElementById('google-login-container');
        if (loginContainer) {
            loginContainer.style.display = 'none';
        }

        // Pass to GameScene
        const gameScene = game.scene.getScene('GameScene');
        if (gameScene) {
            gameScene.events.emit('user-login', decoded.name);
        }
    } catch (e) {
        console.error("Error decoding token", e);
    }
};
