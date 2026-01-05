import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.score = 0;
        this.isKicking = false;
    }

    create() {
        // Background
        this.add.image(400, 300, 'field').setDisplaySize(800, 600);

        // UI Text
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff', stroke: '#000', strokeThickness: 4 });
        this.nameText = this.add.text(784, 16, '', { fontSize: '24px', fill: '#fff', stroke: '#000', strokeThickness: 4 }).setOrigin(1, 0);
        this.equationText = this.add.text(400, 300, '', { fontSize: '48px', fill: '#fff', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5);

        // Listen for login
        this.events.on('user-login', (name) => {
            this.nameText.setText(`Player: ${name}`);
        });

        // Goals Group
        this.goals = [];
        this.goalTexts = [];
        const goalPositions = [100, 300, 500, 700];

        goalPositions.forEach((x, index) => {
            const goal = this.add.image(x, 80, 'goal').setDisplaySize(120, 80).setInteractive();
            goal.setData('index', index);

            // Goal number text
            const text = this.add.text(x, 80, '', { fontSize: '32px', fill: '#fff', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);

            this.goals.push(goal);
            this.goalTexts.push(text);

            goal.on('pointerdown', () => this.handleKick(index, x, 80));
        });

        // Player and Ball
        this.player = this.add.image(400, 500, 'player').setDisplaySize(64, 96);
        this.ball = this.add.image(400, 550, 'ball').setDisplaySize(32, 32);

        this.startNewRound();
    }

    startNewRound() {
        this.isKicking = false;
        this.ball.setPosition(400, 550);
        this.ball.setAlpha(1);

        // Generate Math Problem
        const num1 = Phaser.Math.Between(1, 10);
        const num2 = Phaser.Math.Between(1, 10);
        const isAddition = Math.random() > 0.5;

        let answer;
        let operator;

        if (isAddition) {
            answer = num1 + num2;
            operator = '+';
        } else {
            // Ensure positive result for simplicity
            const max = Math.max(num1, num2);
            const min = Math.min(num1, num2);
            answer = max - min;
            operator = '-';
            // Update display logic to match
            this.equationText.setText(`${max} ${operator} ${min} = ?`);
        }

        if (isAddition) {
            this.equationText.setText(`${num1} ${operator} ${num2} = ?`);
        }

        this.correctAnswer = answer;

        // Generate options
        const options = [answer];
        while (options.length < 4) {
            let wrong = answer + Phaser.Math.Between(-5, 5);
            if (wrong !== answer && wrong >= 0 && !options.includes(wrong)) {
                options.push(wrong);
            }
        }

        // Shuffle options
        Phaser.Utils.Array.Shuffle(options);

        // Assign to goals
        this.goalTexts.forEach((text, i) => {
            text.setText(options[i]);
            // Store the value in the goal object for validation
            this.goals[i].setData('value', options[i]);
        });
    }

    handleKick(index, targetX, targetY) {
        if (this.isKicking) return;
        this.isKicking = true;

        // Animate Player Kick
        // Sequence: Windup (50ms) -> Kick (50ms) -> Follow (150ms) -> Reset
        this.player.setTexture('player_windup');

        this.time.delayedCall(50, () => {
            this.player.setTexture('player_kick');
            // Ball starts moving at point of contact
            this.startBallMovement(targetX, targetY, index);
        });

        this.time.delayedCall(150, () => {
            this.player.setTexture('player_follow');
        });

        this.time.delayedCall(400, () => {
            this.player.setTexture('player');
        });
    }

    startBallMovement(targetX, targetY, index) {
        // Animate Ball
        this.tweens.add({
            targets: this.ball,
            x: targetX,
            y: targetY,
            duration: 600,
            ease: 'Power2',
            onComplete: () => {
                this.checkGoal(index);
            }
        });
    }

    checkGoal(index) {
        const selectedValue = this.goals[index].getData('value');

        if (selectedValue === this.correctAnswer) {
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
            this.showFeedback('GOAL!', '#0f0');
        } else {
            this.showFeedback('MISS!', '#f00');
        }

        this.time.delayedCall(1500, () => {
            this.startNewRound();
        });
    }

    showFeedback(message, color) {
        const feedback = this.add.text(400, 300, message, {
            fontSize: '64px',
            fill: color,
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.tweens.add({
            targets: feedback,
            scale: 1.5,
            alpha: 0,
            duration: 1000,
            onComplete: () => feedback.destroy()
        });
    }
}
