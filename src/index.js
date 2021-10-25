import 'regenerator-runtime/runtime'
import { startPredicting } from './camera-predictions'


const setupGame = async () => {
    startPredicting()
}

const playBtn = document.getElementById('play-btn')
playBtn.addEventListener('click', () => setupGame())
