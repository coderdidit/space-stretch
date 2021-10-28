import Phaser from "phaser";
import shipPath from './vendor/assets/images/ship.png'
import bgPath from './vendor/assets/images/space.jpeg'
import asteroidPath from './vendor/assets/images/asteroid3.png'


const isMobile = window.innerWidth < 450
const scaleDownSketch = !isMobile
const gravity = 750

const config = {
    type: Phaser.AUTO,
    parent: 'main-canvas',
    width: 1024,
    height: 768,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    scene: {
        preload,
        create,
        update,
    },
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: gravity },
        }
    },
    fps: 30
};

const game = new Phaser.Game(config);

let player, ballsGroup;
let ballGroups = new Map()
let score = 0
let scoreBoard, cursors;

function preload() {
    this.load.image('asteroid', asteroidPath);
    this.load.image('ship', shipPath);
    this.load.image('bg', bgPath);
}

function create() {
    cursors = this.input.keyboard.createCursorKeys();

    // background
    this.bg = this.add.image(config.width / 2, config.height / 2, 'bg');
    this.bg.setDisplaySize(config.width, config.height);

    // openingText
    this.add.text(
        5,
        5,
        'Land on asteroids 🌕 to crush them 💥',
        {
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '20px',
            fill: '#fff'
        }
    );

    // Add the scoreboard in
    scoreBoard = this.add.text(
        this.physics.world.bounds.width - 200,
        0,
        "SCORE: 0", { fontSize: '32px', fill: '#fff' });

    this.physics.world.setBoundsCollision(true, true, true, true)

    ballsGroup = this.physics.add.group()
    ballsGroup.enableBody = true;

    const asteroidsInGroupCount = 7
    const asteroidScale = 1

    // left
    for (let i = 0; i < asteroidsInGroupCount; i++) {
        const tile = ballsGroup.create((i * 32) + 150, 600, 'asteroid')
        tile.body.allowGravity = false
        tile.setImmovable(true);
        tile.setScale(asteroidScale)

        ballGroups.set(tile, 0);
    }

    // right
    for (let i = 0; i < asteroidsInGroupCount; i++) {
        const tile = ballsGroup.create((i * 32) + 700, 550, 'asteroid')
        tile.body.allowGravity = false
        tile.setImmovable(true);
        tile.setScale(asteroidScale)

        ballGroups.set(tile, 0);
    }

    // left
    for (let i = 0; i < asteroidsInGroupCount; i++) {
        const tile = ballsGroup.create((i * 32) + 50, 400, 'asteroid')
        tile.body.allowGravity = false
        tile.setImmovable(true);
        tile.setScale(asteroidScale)

        ballGroups.set(tile, 0);
    }

    // left
    for (let i = 0; i < asteroidsInGroupCount; i++) {
        const tile = ballsGroup.create((i * 32) + 100, 150, 'asteroid')
        tile.body.allowGravity = false
        tile.setImmovable(true);
        tile.setScale(asteroidScale)

        ballGroups.set(tile, 0);
    }

    // right
    for (let i = 0; i < asteroidsInGroupCount; i++) {
        const tile = ballsGroup.create((i * 32) + 800, 400, 'asteroid')
        tile.body.allowGravity = false
        tile.setImmovable(true);
        tile.setScale(asteroidScale)

        ballGroups.set(tile, 0);
    }

    // left
    for (let i = 0; i < asteroidsInGroupCount; i++) {
        const tile = ballsGroup.create((i * 32) + 700, 100, 'asteroid')
        tile.body.allowGravity = false
        tile.setImmovable(true);
        tile.setScale(asteroidScale)

        ballGroups.set(tile, 0);
    }

    player = this.physics.add.sprite(
        Phaser.Math.Between(0, this.physics.world.bounds.width - 80), // x position
        this.physics.world.bounds.height, // y position
        'ship', // key of image for the sprite
    );

    player.setScale(1.2)
    player.setCollideWorldBounds(true);

    const onCollide = (avatar, ballgr) => {
        if (avatar.body.onFloor()) {
            const thisBgLanded = ballGroups.get(ballgr);
            if (thisBgLanded == 0) {
                score += 1
                ballGroups.set(ballgr, 1)
                ballgr.setTint("0x33dd33")
                ballgr.setImmovable(false)
                scoreBoard.setText('Score: ' + score)
            }
        }
    }

    this.physics.add.collider(player, ballsGroup, onCollide, null, this);
}

const playerSpeed = 100
let lastMovetime = Date.now()
function update(time, delta) {
    // manage events for neck stretches
    handlePlayerMoves(player, lastMovetime)
}

const handlePlayerMoves = (player, lastMovetime) => {
    player.body.setVelocityX(0);
    player.body.setVelocityY(0);

    const now = Date.now()
    const timeDiff = (now - lastMovetime) / 1000
    // deffer gravity from in move state
    if (timeDiff > 0.8) {
        player.body.setAllowGravity(true)
    }
    if (window.gameLeftMove() || cursors.left.isDown) {
        player.body.setVelocityX((playerSpeed) * -1);
        player.body.setAllowGravity(false)
        lastMovetime = now
    } else if (window.gameRightMove() || cursors.right.isDown) {
        player.body.setVelocityX(playerSpeed);
        player.body.setAllowGravity(false)
        lastMovetime = now
    } else if (window.gameUpMove() || cursors.up.isDown) {
        player.body.setVelocityY((playerSpeed) * -1);
        player.body.setAllowGravity(false)
        lastMovetime = now
    }
}
