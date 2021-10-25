import 'regenerator-runtime/runtime'
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl'
import { getAngleBetween } from './angles';
import { PoseDetectionCfg } from './pose-detection-cfg';
import { Camera } from './camera';
import * as params from './pose-detection-cfg';

// TODO wasm is much faster investigate why
// + vendor the dist
const wasmPath = `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
console.log('registering wasm backend', wasmPath)
tfjsWasm.setWasmPaths(wasmPath);

// TODO implement jump up move after 3 stop, up moves 
const handlePoseToGameEvents = (pose) => {
    const poseKeypoints = pose.keypoints

    const nose = poseKeypoints[0]

    const leftEye = poseKeypoints[1]
    const rightEye = poseKeypoints[2]

    const leftShoulder = poseKeypoints[5]
    const rightShoulder = poseKeypoints[6]

    const leftElbow = poseKeypoints[7]
    const rightElbow = poseKeypoints[8]

    const leftElbowToSholder = getAngleBetween(leftShoulder, leftElbow)
    const rightElbowToSholder = getAngleBetween(rightShoulder, rightElbow)

    // arms and elbows
    const angle = 40
    const bothArmsUp = (leftElbowToSholder > angle)
        && (rightElbowToSholder > angle)

    const noseToLeftEyeYdistance = nose.y - leftEye.y
    const noseToRightEyeYdistance = nose.y - rightEye.y

    // vissibility
    const scoreThreshold = params.PoseDetectionCfg.modelConfig.scoreThreshold || 0;

    const noseVissible = nose.score > scoreThreshold
    const lEVissible = leftEye.score > scoreThreshold
    const REVissible = rightEye.score > scoreThreshold

    const lShoulderVissible = leftShoulder.score > scoreThreshold
    const rShoulderVissible = rightShoulder.score > scoreThreshold
    const lElbowVissible = leftElbow.score > scoreThreshold
    const rElbowVissible = rightElbow.score > scoreThreshold

    const shouldersVisible = lShoulderVissible && rShoulderVissible

    let visibleShoulders = 0
    if (lElbowVissible) {
        visibleShoulders += 1
    }
    if (rElbowVissible) {
        visibleShoulders += 1
    }
    const shouldersAndElbowsVissible = shouldersVisible && visibleShoulders == 2

    const moveSideActivationDist = 8
    if (noseVissible && lEVissible
        && noseToLeftEyeYdistance < moveSideActivationDist) {
        window.gameStateMoveLeft()
    } else if (noseVissible && REVissible
        && noseToRightEyeYdistance < moveSideActivationDist) {
        window.gameStateMoveRight()
    } else if (shouldersAndElbowsVissible && bothArmsUp) {
        movedUp = true
        window.gameStateMoveUp()
    } else {
        movedUp = false
        window.gameStateStop()
    }
}

let camera, poseDetector;
let movedUp = false

const renderPrediction = async () => {

    if (camera.video.readyState < 2) {
        await new Promise((resolve) => {
            camera.video.onloadeddata = () => {
                resolve(video);
            };
        });
    }
    // pose detection
    let poses;
    try {
        poses = await poseDetector.estimatePoses(camera.video)
    } catch (error) {
        poseDetector.dispose();
        poseDetector = null;
        alert(error);
    }
    camera.drawCtx();

    if (poses && poses.length > 0) {
        camera.drawResults(poses);
        const pose = poses[0]
        handlePoseToGameEvents(pose)
    }
    requestAnimationFrame(renderPrediction)
}

const startPredicting = async () => {
    camera = await Camera.setupCamera();
    console.log('setupCamera finished', camera)
    await tf.setBackend(PoseDetectionCfg.backend)
    console.log(`tfjs backend loaded ${PoseDetectionCfg.backend}`)

    // hide main bg
    const welcomBg = document.getElementById('welcom-bg')
    welcomBg.style.display = 'none'

    // unhide game and camera canvas
    const mainCanvas = document.getElementById('main-canvas')
    mainCanvas.style.display = 'block'
    const videoOutput = document.getElementById('video-output')
    videoOutput.style.display = 'block'

    // setup AI
    poseDetector = await poseDetection.createDetector(
        params.PoseDetectionCfg.model,
        params.PoseDetectionCfg.modelConfig);

    renderPrediction(camera, poseDetector)
}

export {startPredicting}
