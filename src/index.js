import 'regenerator-runtime/runtime'
import * as tf from '@tensorflow/tfjs-core';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl'
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as params from './pose-detection-cfg';
import { Camera } from './camera';
import { startPredictions } from './camera-predictions'

let poseDetector;
const setupTf = async () => {
    // TODO wasm is much faster investigate why
    // + vendor the dist
    const wasmPath = `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
    console.log('registering wasm backend', wasmPath)
    tfjsWasm.setWasmPaths(wasmPath);

    // setup AI
    await tf.setBackend(params.PoseDetectionCfg.backend)
    console.log(`tfjs backend loaded ${params.PoseDetectionCfg.backend}`)
    poseDetector = await poseDetection.createDetector(
        params.PoseDetectionCfg.model,
        params.PoseDetectionCfg.modelConfig);
}

setupTf()

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
    startPredictions(camera, poseDetector)
}

const playBtn = document.getElementById('play-btn')
playBtn.addEventListener('click', () => startGame())
