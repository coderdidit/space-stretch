import 'regenerator-runtime/runtime'
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
// import '@tensorflow/tfjs-backend-webgl';
// import '@tensorflow/tfjs-backend-cpu';
import { getAngleBetween } from './angles';

// TODO wasm is much faster investigate why
// + vendor the dist
const wasmPath = `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
console.log('registering wasm', wasmPath)
tfjsWasm.setWasmPaths(wasmPath);

const video = document.getElementById('video')
const canvas = document.getElementById('video-output')

let ctx, poseDetector;

const setupCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': { facingMode: 'user' },
    })
    video.srcObject = stream

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video)
        }
    })
}

let moved = false
const renderPrediction = async () => {
    // pose detection
    const poses = await poseDetector.estimatePoses(video);
    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight

    if (poses.length > 0) {
        const poseKeypoints = poses[0].keypoints
        const left_shoulder = poseKeypoints[5]
        const right_shoulder = poseKeypoints[6]
        const left_elbow = poseKeypoints[7]
        const right_elbow = poseKeypoints[8]
        const left_wrist  = poseKeypoints[9]
        const right_wrist  = poseKeypoints[10]

        const leftElbowToSholder = getAngleBetween(left_shoulder, left_elbow)
        const rightElbowToSholder = getAngleBetween(right_shoulder, right_elbow)

        // draw video to canvas 
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight)

        const angle = 40
        const oneOfArmsOrBothUp = leftElbowToSholder > angle || rightElbowToSholder > angle

        if (moved) {
            if (!oneOfArmsOrBothUp) {
                moved = false
            }
            window.gameStateStop()
        } else {
            if (oneOfArmsOrBothUp) {
                moved = true
                window.gameStateMoveJump()
                ctx.fillStyle = "blue";
            } else {
                moved = false
                window.gameStateStop()
                ctx.fillStyle = "blue";
            }
        }
    }
    requestAnimationFrame(renderPrediction)
}

const setupGame = async () => {
    await tf.setBackend('wasm')
    console.log('tfjs backend loaded wasm')
    await setupCamera()
    console.log('setupCamera finished')
    video.play()

    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight
    video.width = videoWidth
    video.height = videoHeight

    canvas.width = videoWidth
    canvas.height = videoHeight

    const welcomBg = document.getElementById('welcom-bg')
    welcomBg.style.display = 'none'

    const videoOutput = document.getElementById('video-output')
    const mainCanvas = document.getElementById('main-canvas')
    videoOutput.style.display = 'block'
    mainCanvas.style.display = 'block'

    ctx = canvas.getContext('2d')
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)"

    poseDetector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER });

    renderPrediction()
}

const playBtn = document.getElementById('play-btn')
playBtn.addEventListener('click', () => setupGame())
