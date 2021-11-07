import Phaser from "phaser";
import bgPath from './vendor/assets/images/space3.png'
import party from "party-js"


const canvasParent = document.getElementById('main-canvas')

export default class GameOver extends Phaser.Scene {
    constructor() {
        super('you-won')
    }

    preload() {
        this.load.image('bg', bgPath);
    }

    create() {
        this.confettiFiredCount = 0
        const { width, height } = this.physics.world.bounds

        this.bg = this.add.image(width / 2, height / 2, 'bg');
        this.bg.setOrigin(0.5)
        this.bg.setDisplaySize(width, height);

        const textStyle = {
            font: 'bold 32px Orbitron',
            fill: '#FA34F3',
            backgroundColor: '#251F54',
            padding: 30,
            align: 'center',
        }
        const infoText = this.add.text(
            width / 2,
            (height / 2) - height * .2,
            "🚀🚀🚀\n" +
            "You Won! 🎉 \n" +
            "All 🪨🪨🪨🪨 are crashed 💥",
            textStyle
        )
        infoText.setOrigin(0.5)
        infoText.setShadow(3, 3, 'rgba(0,0,0,0.2)', 2)

        this.input.on("pointerdown", () => this.scene.start('space-stretch'))

        const restartTextStyle = {
            font: 'bold 32px Orbitron',
            fill: '#EEEEF0',
            backgroundColor: '#262D83',
            padding: 30,
            align: 'center',
        }
        const restartText = this.add.text(
            width / 2,
            height * .8,
            "🎮 restart",
            restartTextStyle
        )
        restartText.setOrigin(0.5)
        restartText.setShadow(3, 3, 'rgba(0,0,0,0.2)', 2)
    }

    update() {
        if (this.confettiFiredCount < 15) {
            party.confetti(canvasParent)
            this.confettiFiredCount += 1
        }
    }
}
