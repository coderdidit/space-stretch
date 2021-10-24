import 'regenerator-runtime/runtime'
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import { getAngleBetween } from './angles';
import { PoseDetectionCfg } from './pose-detection-cfg';
import { Camera } from './camera';
import * as params from './pose-detection-cfg';

// TODO wasm is much faster investigate why
// + vendor the dist
const wasmPath = `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
console.log('registering wasm backend', wasmPath)
tfjsWasm.setWasmPaths(wasmPath);

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

    const oneOfArmsUp = (leftElbowToSholder > angle)
        || (rightElbowToSholder > angle) && !bothArmsUp

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

    const shouldersAndElbowsVissible = lShoulderVissible && rShoulderVissible
        && lElbowVissible && rElbowVissible

    if (noseVissible && lEVissible && noseToLeftEyeYdistance < 5) {
        window.gameStateMoveLeft()
    } else if (noseVissible && REVissible && noseToRightEyeYdistance < 5) {
        window.gameStateMoveRight()
    } else if (shouldersAndElbowsVissible && bothArmsUp) {
        movedUp = true
        window.gameStateMoveJump()
    } else {
        if (movedUp) {
            movedUp = oneOfArmsUp
            window.gameStateStop()
        } else {
            if (shouldersAndElbowsVissible && oneOfArmsUp) {
                movedUp = true
                window.gameStateMoveUp()
            } else {
                movedUp = false
                window.gameStateStop()
            }
        }
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

const setupGame = async () => {
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
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING });

    renderPrediction(camera, poseDetector)
}

const playBtn = document.getElementById('play-btn')
playBtn.addEventListener('click', () => setupGame())
