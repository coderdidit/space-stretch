import Phaser from "phaser";
import shipPath from './vendor/assets/images/ship.png'
import bgPath from './vendor/assets/images/space.jpeg'
import asteroidPath from './vendor/assets/images/asteroids.png'


const isMobile = window.innerWidth < 450
const scaleDownSketch = !isMobile
const gravity = 750

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

// this.sys.game.CONFIG 

const gameProps = {
    width: config.width,
    height: config.height,
    centerX: Math.round(0.5 * config.width),
    centerY: Math.round(0.5 * config.height),
    tile: 32
}

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

    this.physics.world.setBoundsCollision(true, true, true, true)

    const asteroidScale = 1.3

    const placeAsteroids = (y) => {
        const asteroidGroupProps = {
            immovable: true,
            allowGravity: false,
        }
        const xOffset = 150
        const asteroids = this.physics.add.group(asteroidGroupProps)
        asteroids.createMultiple({ key: 'asteroid', frameQuantity: 1 })
        asteroids.getChildren().forEach(el => el.setScale(asteroidScale))
        const line = new Phaser.Geom.Line(
            xOffset,
            y,
            this.physics.world.bounds.width - xOffset,
            y
        )
        Phaser.Actions.RandomLine(asteroids.getChildren(), line)
        return asteroids
    }

    const yOffset = 80
    const asteroidGroups = []
    const platformsCnt = 6
    let yStep = yOffset
    for (let i = 0;i < platformsCnt;i++){
        asteroidGroups.push(placeAsteroids(yStep))
        yStep += 150
    } 
    // const ballsGroup2 = this.physics.add.group({ immovable: true, allowGravity: false })
    // ballsGroup2.createMultiple({ key: 'asteroid', frameQuantity: 5 });
    // Phaser.Actions.SetXY(ballsGroup2.getChildren(), 900, 100, 32);

    // for (let i = 0; i < asteroidsInGroupCount; i++) {
    //     const tile = ballsGroup.create((i * 32) + 150, 600, 'asteroid')
    //     tile.body.allowGravity = false
    //     tile.setImmovable(true);
    //     tile.setScale(asteroidScale)

    //     ballGroups.set(tile, 0);
    // }

    // // right
    // for (let i = 0; i < asteroidsInGroupCount; i++) {
    //     const tile = ballsGroup.create((i * 32) + 700, 550, 'asteroid')
    //     tile.body.allowGravity = false
    //     tile.setImmovable(true);
    //     tile.setScale(asteroidScale)

    //     ballGroups.set(tile, 0);
    // }

    // // left
    // for (let i = 0; i < asteroidsInGroupCount; i++) {
    //     const tile = ballsGroup.create((i * 32) + 50, 400, 'asteroid')
    //     tile.body.allowGravity = false
    //     tile.setImmovable(true);
    //     tile.setScale(asteroidScale)

    //     ballGroups.set(tile, 0);
    // }

    // // left
    // for (let i = 0; i < asteroidsInGroupCount; i++) {
    //     const tile = ballsGroup.create((i * 32) + 100, 150, 'asteroid')
    //     tile.body.allowGravity = false
    //     tile.setImmovable(true);
    //     tile.setScale(asteroidScale)

    //     ballGroups.set(tile, 0);
    // }

    // // right
    // for (let i = 0; i < asteroidsInGroupCount; i++) {
    //     const tile = ballsGroup.create((i * 32) + 800, 400, 'asteroid')
    //     tile.body.allowGravity = false
    //     tile.setImmovable(true);
    //     tile.setScale(asteroidScale)

    //     ballGroups.set(tile, 0);
    // }

    // // left
    // for (let i = 0; i < asteroidsInGroupCount; i++) {
    //     const tile = ballsGroup.create((i * 32) + 700, 100, 'asteroid')
    //     tile.body.allowGravity = false
    //     tile.setImmovable(true);
    //     tile.setScale(asteroidScale)

    //     ballGroups.set(tile, 0);
    // }

    player = this.physics.add.sprite(
        Phaser.Math.Between(0, this.physics.world.bounds.width - 80), // x position
        this.physics.world.bounds.height, // y position
        'ship', // key of image for the sprite
    );

    player.setScale(1.6)
    player.setCollideWorldBounds(true);

    const onCollide = (avatar, ballgr) => {
        if (avatar.body.onFloor()) {
            const thisBgLanded = ballGroups.get(ballgr);
            // if (thisBgLanded == 0) {
            score += 1
            ballGroups.set(ballgr, 1)
            ballgr.setTint("0x33dd33")
            ballgr.setImmovable(false)
            ballgr.setVelocityY(600)
            scoreBoard.setText('Score: ' + score)
            // }
        }
    }

    asteroidGroups.forEach(a => {
        this.physics.add.collider(player, a, onCollide, null, this);
    })
    
}

const playerSpeed = 100
function update(time, delta) {
    // manage events for neck stretches
    handlePlayerMoves(player)
}

let lastMovetime = Date.now()
const handlePlayerMoves = (player) => {
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
