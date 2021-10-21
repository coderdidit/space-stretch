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
            gravity: {y: 500},
        }
    }
};

const game = new Phaser.Game(config);

let player1, ballsGroup, cursors;

let ballGroups = new Map()

function preload() {
    this.load.image('ball', ballPath);
    this.load.image('paddle', paddlePath);
}

function create() {

    // openingText
    this.add.text(
        5,
        5,
        'Land on asteroids 🌝',
        {
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '25px',
            fill: '#fff'
        }
    );

    this.physics.world.setBoundsCollision(true, true, true, true)

    ballsGroup = this.physics.add.group()
    ballsGroup.enableBody = true;
    // this.platforms.enableBody = true
    // this.platforms.createMultiple(20, "ball")

    // left
    let tileSet = []
    for (let i = 0; i < 15; i++) {
        const tile = ballsGroup.create((i * 32)+150, 800, 'ball')
        tile.body.allowGravity = false
        tile.setImmovable(true);

        ballGroups.set(tile, 0);
        
    }

    // right
    for (let i = 0; i < 15; i++) {
        const tile = ballsGroup.create((i * 32)+700, 650, 'ball')
        tile.body.allowGravity = false
        tile.setImmovable(true);

        ballGroups.set(tile, 0);
    }

    // left
    for (let i = 0; i < 15; i++) {
        const tile = ballsGroup.create((i * 32)+50, 400, 'ball')
        tile.body.allowGravity = false
        tile.setImmovable(true);

        ballGroups.set(tile, 0);
    }

    // left
    for (let i = 0; i < 15; i++) {
        const tile = ballsGroup.create((i * 32)+100, 150, 'ball')
        tile.body.allowGravity = false
        tile.setImmovable(true);

        ballGroups.set(tile, 0);
    }

    // right
    for (let i = 0; i < 15; i++) {
        const tile = ballsGroup.create((i * 32)+900, 400, 'ball')
        tile.body.allowGravity = false
        tile.setImmovable(true);

        ballGroups.set(tile, 0);
    }

    // left
    for (let i = 0; i < 15; i++) {
        const tile = ballsGroup.create((i * 32)+800, 100, 'ball')
        tile.body.allowGravity = false
        tile.setImmovable(true);

        ballGroups.set(tile, 0);
    }
    
    // ball.setVisible(false);
    // ball.setScale(2)

    player1 = this.physics.add.sprite(
        Phaser.Math.Between(0, this.physics.world.bounds.width-80), // x position
        this.physics.world.bounds.height, // y position
        'paddle', // key of image for the sprite
    );

    // player1.setScale(1.7)

    // player2 = this.physics.add.sprite(
    //     this.physics.world.bounds.width / 2, // x position
    //     0, // y position
    //     'paddle', // key of image for the sprite
    // );

    // player2.setScale(1.7)

    cursors = this.input.keyboard.createCursorKeys();

    player1.setCollideWorldBounds(true);
    // player2.setCollideWorldBounds(true);
    // ball.setCollideWorldBounds(true);
    // ball.setBounce(1, 1);
    // player1.setImmovable(true);
    // player2.setImmovable(true);

    const onCollide = (avatar, ballgr) => {
        if (player1.body.onFloor()) {
            const thisBgLanded = ballGroups.get(ballgr);
            if (thisBgLanded == 0) {
                ballGroups.set(ballgr, 1)
                ballgr.setTint("0x33dd33")
                ballgr.setImmovable(false)
            }
        }
    }

    this.physics.add.collider(player1, ballsGroup, onCollide, null, this);
    // this.physics.add.collider(ball, player2, null, null, this);

    // openingText = this.add.text(
    //     this.physics.world.bounds.width / 2,
    //     this.physics.world.bounds.height / 2,
    //     'Press SPACE to Start',
    //     {
    //         fontFamily: 'Monaco, Courier, monospace',
    //         fontSize: '50px',
    //         fill: '#fff'
    //     }
    // );

    // openingText.setOrigin(0.5);
}

const paddleSpeed = 100
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
    // if (window.gameLeftMove() || window.gameRightMove()) {
    //     if(player1.x <= 65 || player1.x >= this.physics.world.bounds.width-100) {
    //         player1.body.setVelocityY(paddleSpeed);
    //     }
    // }

    // manage events for neck stretches
    if (window.gameUpMove()) {
        player1.body.setVelocityY(paddleSpeed*-1);
        player1.body.setAllowGravity(false)
        lastMovetime = now
    } else if (window.gameJumpMove()) {
        player1.body.setVelocityY((paddleSpeed)*-1);
        player1.body.setAllowGravity(false)
        lastMovetime = now
    } else if (window.gameDownMove()) {
        player1.body.setVelocityY(paddleSpeed);
    } else if (window.gameLeftMove()) {
        player1.body.setVelocityX(paddleSpeed*-1);
        player1.body.setAllowGravity(false)
        lastMovetime = now
        // player2.body.setVelocityX(paddleSpeed*-1);
    } else if (window.gameRightMove()) {
        player1.body.setVelocityX(paddleSpeed);
        player1.body.setAllowGravity(false)
        lastMovetime = now
        // player2.body.setVelocityX(paddleSpeed);
    }
    // if (!gameStarted) {
    //     if (cursors.space.isDown) {
    //         console.log('space hit!')
    //         ball.setVisible(true);
    //         gameStarted = true;
    //         // ball.setVelocityX(ballSpeed);
    //         // ball.setVelocityY(300);
    //         openingText.setVisible(false);
    //     }
    // }
}
