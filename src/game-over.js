import Phaser from "phaser";
import bgPath from './vendor/assets/images/space.jpeg'
import party from "party-js"


const textStyle = {
    font: 'bold 32px Orbitron',
    fill: '#FA34F3',
    backgroundColor: '#251F54',
    padding: 30,
    align: 'center',
}

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

        const text = this.add.text(
            width / 2,
            (height / 2) - height * .2,
            "🚀🚀🚀\n" +
            "You Won! 🎉 \n" +
            "All 🪨🪨🪨🪨 are crashed 💥",
            textStyle
        )
        text.setOrigin(0.5)
        text.setShadow(3, 3, 'rgba(0,0,0,0.2)', 2)
    }


    update() {
        if (this.confettiFiredCount < 30) {
            party.confetti(canvasParent)
            this.confettiFiredCount += 1
        }
    }
}
