import 'regenerator-runtime/runtime'
import { Camera } from './camera';
import { predict, handlePoseToGameEvents } from './predictions'
import { handleMoveToEvent } from './game-state'


const startGame = async () => {
    console.log('starting camera setup')
    const camera = await Camera.setupCamera();
    if (camera.video.readyState < 2) {
        await new Promise((resolve) => {
            camera.video.onloadeddata = () => {
                resolve(video);
            };
        });
    }
    console.log('setupCamera finished', camera)

    // hide main bg
    const welcomBg = document.getElementById('welcom-bg')
    welcomBg.style.display = 'none'

    // un-hide game and camera canvas
    const mainCanvas = document.getElementById('main-canvas')
    mainCanvas.style.display = 'block'
    const videoOutput = document.getElementById('video-output')
    videoOutput.style.display = 'block'

    // ai
    predictPose(camera)
}

const predictPose = async (camera) => {
    const width = camera.canvas.width;
    const height = camera.canvas.height;
    const imgData = camera.ctx.getImageData(0, 0, width, height)
    const poses = await predict(imgData)
    camera.drawCtx();
    if (poses && poses.length > 0) {
        camera.drawResults(poses);
        const pose = poses[0]
        const move = handlePoseToGameEvents(pose)
        handleMoveToEvent(move)
    }
    requestAnimationFrame(() => {
        predictPose(camera)
    })
}

const playBtn = document.getElementById('play-btn')
playBtn.addEventListener('click', () => startGame())
