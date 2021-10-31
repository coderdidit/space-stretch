import Phaser from "phaser";
import shipPath from './vendor/assets/images/ship.png'
import bgPath from './vendor/assets/images/space.jpeg'
import asteroidsPath from './vendor/assets/images/asteroids.png'
import party from "party-js"


const canvasParent = document.getElementById('main-canvas')

class SpaceStretchGame extends Phaser.Scene {
    constructor() {
        super({ key: 'SpaceStretchGame' });
    }

    init(data) { }

    preload() {
        this.load.image('asteroids', asteroidsPath);
        this.load.image('ship', shipPath);
        this.load.image('bg', bgPath);
    }

    create() {
        this.lastMovetime = Date.now()
        this.won = false
        this.score = 0
        this.cursors = this.input.keyboard.createCursorKeys();

        // background
        this.bg = this.add.image(config.width / 2, config.height / 2, 'bg');
        // this.bg.setDisplaySize(config.width, config.height);

        // openingText
        const textStyle = { fontSize: '20px', fill: '#fff', fontFamily: 'Monaco, Courier, monospace' }
        this.add.text(
            5,
            5,
            '🚀 Land on asteroids 🪨 to crush them 💥',
            textStyle);

        // Add the scoreboard in
        this.scoreBoard = this.add.text(
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

        const player = this.player = this.physics.add.sprite(
            Phaser.Math.Between(0, this.physics.world.bounds.width - 80),
            this.physics.world.bounds.height,
            'ship',
        );
        player.setScale(1.8)
        player.setCollideWorldBounds(true);

        const onCollide = (avatar, ballgr) => {
            if (avatar.body.onFloor()) {
                this.score += 1
                ballgr.setTint("0x33dd33")
                ballgr.setImmovable(false)
                ballgr.setVelocityY(600)
                this.scoreBoard.setText('Score: ' + this.score)
            }
        }

        this.physics.add.collider(player, asteroids, onCollide, null, this);
    }

    update(time, delta) {
        // manage events for neck stretches
        const player = this.player
        this.handlePlayerMoves(player)
    }

    handlePlayerMoves() {
        // win
        const player = this.player
        if (!this.won && this.score == asteroidPlatformsCnt) {
            party.confetti(canvasParent)
            this.won = true
        }
        player.body.setVelocityX(0);
        player.body.setVelocityY(0);
        const now = Date.now()
        const timeDiff = (now - this.lastMovetime) / 1000
        // deffer gravity from in move state
        if (timeDiff > 0.8) {
            if (!window.gameInMove()) {
                player.body.setAllowGravity(true)
                player.body.setVelocityY(playerSpeed);
            }
        }
        if (window.gameLeftMove() || this.cursors.left.isDown) {
            player.body.setVelocityX((playerSpeed * 0.8) * -1);
            player.body.setAllowGravity(false)
            this.lastMovetime = now
        } else if (window.gameRightMove() || this.cursors.right.isDown) {
            player.body.setVelocityX(playerSpeed * 0.8);
            player.body.setAllowGravity(false)
            this.lastMovetime = now
        } else if (window.gameUpMove() || this.cursors.up.isDown) {
            player.body.setVelocityY((playerSpeed) * -1);
            player.body.setAllowGravity(false)
            this.lastMovetime = now
        }
    }
}


const isMobile = window.innerWidth < 450
const scaleDownSketch = !isMobile
const gravity = 750
const asteroidPlatformsCnt = 7
const playerSpeed = 100

const config = {
    type: Phaser.AUTO,
    parent: 'main-canvas',
    width: scaleDownSketch ? window.innerWidth / 1.2 : window.innerWidth,
    height: scaleDownSketch ? window.innerHeight / 1.3 : window.innerHeight / 1.2,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_VERTICALLY,
    scene: [SpaceStretchGame],
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
}

const game = new Phaser.Game(config)
