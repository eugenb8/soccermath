import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        // Load assets
        this.load.image('field', '/assets/field.png');
        this.load.image('ball', '/assets/ball.png');
        this.load.image('goal', '/assets/goal.png');
        this.load.image('player', '/assets/player.png');
        this.load.image('player_kick', '/assets/player_kick.png');
        this.load.image('player_windup', '/assets/player_windup.png');
        this.load.image('player_follow', '/assets/player_follow.png');
    }

    create() {
        this.scene.start('GameScene');
    }
}
