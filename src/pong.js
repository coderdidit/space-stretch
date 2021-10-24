import Phaser from "phaser";
import ballPath from './vendor/assets/images/ball.png'
import paddlePath from './vendor/assets/images/paddle-horizontal.png'

const isMobile = window.innerWidth < 450
const scaleDownSketch = !isMobile

const config = {
    type: Phaser.AUTO,
    parent: 'main-canvas',
    width: scaleDownSketch ? window.innerWidth / 1.2 : window.innerWidth,
    height: scaleDownSketch ? window.innerHeight / 1.3 : window.innerHeight / 1.2,
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

let player1, ballsGroup, cursors;
let ballGroups = new Map()
let score = 0
let scoreBoard

function preload() {
    this.load.image('ball', ballPath);
    this.load.image('paddle', paddlePath);
}

function create() {

    // openingText
    this.add.text(
        5,
        5,
        'Move the paddle left, right, up, jump',
        {
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '25px',
            fill: '#fff'
        }
    );

    player1 = this.physics.add.sprite(
        this.physics.world.bounds.width / 2, // x position
        this.physics.world.bounds.height - 30, // y position
        'paddle', // key of image for the sprite
    );
    
}

const paddleSpeed = 130
// const ballSpeed = 400
let lastMovetime = Date.now()
function update(time, delta) {
    player1.body.setVelocityX(0);
    player1.body.setVelocityY(0);

    // ball.body.setAllowGravity(false)
    const now = Date.now()
    const timeDiff = (now - lastMovetime) / 1000
    // deffer gravity from in move state
    if (timeDiff > 0.8) {
        player1.body.setAllowGravity(true)
    }
    // manage events for neck stretches
    handlePlayerMoves(player1, lastMovetime)
    this.physics.world.wrap(player1, 32);
}

const handlePlayerMoves = (player, lastMovetime) => {
    if (window.gameUpMove()) {
        player.body.setVelocityY((paddleSpeed + 40) * -1);
        // player.body.setAllowGravity(false)
        lastMovetime = now
    } else 
    if (window.gameJumpMove()) {
        player.body.setVelocityY((paddleSpeed - 20) * -1);
        // player.body.setAllowGravity(false)
        lastMovetime = now
    } else if (window.gameLeftMove()) {
        player.body.setVelocityX((paddleSpeed) * -1);
        // player.body.setAllowGravity(false)
        lastMovetime = now
        // player2.body.setVelocityX(paddleSpeed*-1);
    } else if (window.gameRightMove()) {
        player.body.setVelocityX(paddleSpeed);
        // player.body.setAllowGravity(false)
        lastMovetime = now
    }
}
