import Phaser from "phaser";
import shipPath from './vendor/assets/images/ship.png'
import bgPath from './vendor/assets/images/space.jpeg'
import asteroidsPath from './vendor/assets/images/asteroids.png'
import party from "party-js"


const isMobile = window.innerWidth < 450
const scaleDownSketch = !isMobile
const gravity = 750
const canvasParent = document.getElementById('main-canvas')

const config = {
    type: Phaser.AUTO,
    parent: 'main-canvas',
    width: scaleDownSketch ? window.innerWidth / 1.2 : window.innerWidth,
    height: scaleDownSketch ? window.innerHeight / 1.3 : window.innerHeight / 1.2,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_VERTICALLY,
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

let player;
let score = 0
let scoreBoard, cursors;
const asteroidPlatformsCnt = 7

function preload() {
    this.load.image('asteroids', asteroidsPath);
    this.load.image('ship', shipPath);
    this.load.image('bg', bgPath);
}

function create() {
    cursors = this.input.keyboard.createCursorKeys();

    // background
    this.bg = this.add.image(config.width / 2, config.height / 2, 'bg');
    this.bg.setDisplaySize(config.width, config.height);

    // openingText
    const textStyle = { fontSize: '20px', fill: '#fff', fontFamily: 'Monaco, Courier, monospace' }
    this.add.text(
        5,
        5,
        '🚀 Land on asteroids 🪨 to crush them 💥',
        textStyle);

    // Add the scoreboard in
    scoreBoard = this.add.text(
        this.physics.world.bounds.width - 145,
        5,
        "👨‍🚀 SCORE: 0",
        textStyle);

    const asteroidGroupProps = {
        immovable: true,
        allowGravity: false,
    }
    const asteroids = this.physics.add.group(asteroidGroupProps)

    const placeAsteroids = () => {
        const asteroidScale = 1.2
        const yOffset = 80
        const xOffset = 150
        let asteroidYPos = yOffset
        for (let i = 0; i < asteroidPlatformsCnt; i++) {
            if (this.physics.world.bounds.height - asteroidYPos > yOffset) {
                const x = Phaser.Math.Between(xOffset, this.physics.world.bounds.width - xOffset)
                const asteroidTile = asteroids.create(x, asteroidYPos, 'asteroids')
                asteroidTile.setScale(asteroidScale)
                asteroidYPos += 120
            }
        }
    }

    placeAsteroids()

    player = this.physics.add.sprite(
        Phaser.Math.Between(0, this.physics.world.bounds.width - 80),
        this.physics.world.bounds.height,
        'ship',
    );
    player.setScale(1.6)
    player.setCollideWorldBounds(true);

    const onCollide = (avatar, ballgr) => {
        if (avatar.body.onFloor()) {
            score += 1
            ballgr.setTint("0x33dd33")
            ballgr.setImmovable(false)
            ballgr.setVelocityY(600)
            scoreBoard.setText('Score: ' + score)
        }
    }

    this.physics.add.collider(player, asteroids, onCollide, null, this);
}

const playerSpeed = 100
function update(time, delta) {
    // manage events for neck stretches
    handlePlayerMoves(player)
}

let lastMovetime = Date.now()
let won = false
const handlePlayerMoves = (player) => {

    // win
    if (!won && score == asteroidPlatformsCnt) {
        party.confetti(canvasParent)
        won = true
    }

    player.body.setVelocityX(0);
    player.body.setVelocityY(0);

    const now = Date.now()
    const timeDiff = (now - lastMovetime) / 1000
    // deffer gravity from in move state
    if (timeDiff > 0.8) {
        if (!window.gameInMove()) {
            player.body.setAllowGravity(true)
            player.body.setVelocityY(playerSpeed);
        }
    }
    if (window.gameLeftMove() || cursors.left.isDown) {
        player.body.setVelocityX((playerSpeed * 0.8) * -1);
        player.body.setAllowGravity(false)
        lastMovetime = now
    } else if (window.gameRightMove() || cursors.right.isDown) {
        player.body.setVelocityX(playerSpeed * 0.8);
        player.body.setAllowGravity(false)
        lastMovetime = now
    } else if (window.gameUpMove() || cursors.up.isDown) {
        player.body.setVelocityY((playerSpeed) * -1);
        player.body.setAllowGravity(false)
        lastMovetime = now
    }
}
