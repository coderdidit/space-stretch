import Phaser from "phaser";
import ballPath from './vendor/assets/images/ball.png'
import paddlePath from './vendor/assets/images/ship.png'

const isMobile = window.innerWidth < 450
const scaleDownSketch = !isMobile

const config = {
    type: Phaser.AUTO,
    parent: 'main-canvas',
    // width: scaleDownSketch ? window.innerWidth / 1.2 : window.innerWidth,
    // height: scaleDownSketch ? window.innerHeight / 1.3 : window.innerHeight / 1.2,
    width: 1024,
    height: 768,
    scene: {
        preload,
        create,
        update,
    },
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
        }
    }
};

const game = new Phaser.Game(config);

let player1, cursors;
let score = 0
let scoreBoard

function preload() {
    this.load.image('ball', ballPath);
    this.load.image('ship', paddlePath);
}

function create() {

    cursors = this.input.keyboard.createCursorKeys();

    // openingText
    this.add.text(
        5,
        5,
        'Collect balls 🌝',
        {
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '25px',
            fill: '#fff'
        }
    );

    //Add the scoreboard in
    scoreBoard = this.add.text(
        this.physics.world.bounds.width - 200,
        0,
        "SCORE: 0", { fontSize: '32px', fill: '#fff' });

    this.physics.world.setBoundsCollision(true, true, true, true)

    player1 = this.physics.add.sprite(
        this.physics.world.bounds.width / 2, // x position
        this.physics.world.bounds.height / 2, // y position
        'ship', // key of image for the sprite
    );

    player1.setScale(2.2)
    player1.setCollideWorldBounds(true);

    let ballsGroup = this.physics.add.group({
        key: 'ball',
        quantity: 15,
        collideWorldBounds: true,
    })

    Phaser.Actions.RandomRectangle(ballsGroup.getChildren(), this.physics.world.bounds)

    this.physics.add.overlap(player1, ballsGroup, collectBalls, null, this)

    function collectBalls(avatar, ball) {
        ball.destroy()
    }
}

const paddleSpeedUp = 50
const ballSpeedNg = 45
function update(time, delta) {

    player1.body.setAngularVelocity(0);
    player1.body.setVelocity(0, 0);
    player1.body.setAcceleration(0)

    // manage events for neck stretches
    if (window.gameUpMove()) {
        const ng = player1.angle
        const vec = this.physics.velocityFromAngle(ng, paddleSpeedUp)
        // const vx = (Math.cos(player1.rotation)- (Math.PI/2)) * 50
        // const vy = (Math.sin(player1.rotation)- (Math.PI/2)) * 50
        player1.body.setVelocity(vec.x, vec.y);

    } else if (window.gameJumpMove() || cursors.up.isDown) {
        const ng = player1.angle
        const vec = this.physics.velocityFromAngle(ng, paddleSpeedUp)
        // const vx = (Math.cos(player1.rotation)- (Math.PI/2)) * 50
        // const vy = (Math.sin(player1.rotation)- (Math.PI/2)) * 50
        player1.body.setVelocity(vec.x, vec.y);

        // this.physics.velocityFromRotation(player1.rotation, 200,
        //     player1.body.velocity)
    } else if (window.gameLeftMove() || cursors.left.isDown) {
        player1.body.setAngularVelocity(ballSpeedNg * -1);
    } else if (window.gameRightMove() || cursors.right.isDown) {
        player1.body.setAngularVelocity(ballSpeedNg);
    }
}
