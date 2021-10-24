import 'regenerator-runtime/runtime'
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import { getAngleBetween, getAnglesBetween } from './angles';
import { PoseDetectionCfg } from './pose-detection-cfg';
import { Camera } from './camera';
import * as params from './pose-detection-cfg';

// TODO wasm is much faster investigate why
// + vendor the dist
const wasmPath = `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
console.log('registering wasm backend', wasmPath)
tfjsWasm.setWasmPaths(wasmPath);

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
    }

    if (poses && poses.length > 0) {
        // camera.drawResults(poses);
        const poseKeypoints = poses[0].keypoints

        const nose = poseKeypoints[0]

        const leftEye = poseKeypoints[1]
        const rightEye = poseKeypoints[2]

        const left_shoulder = poseKeypoints[5]
        const right_shoulder = poseKeypoints[6]

        const left_elbow = poseKeypoints[7]
        const right_elbow = poseKeypoints[8]

        const leftElbowToSholder = getAngleBetween(left_shoulder, left_elbow)
        const rightElbowToSholder = getAngleBetween(right_shoulder, right_elbow)

        const angle = 40

        const bothArmsUp = (leftElbowToSholder > angle)
            && (rightElbowToSholder > angle)

        const oneOfArmsUp = (leftElbowToSholder > angle)
            || (rightElbowToSholder > angle) && !bothArmsUp


        const noseToLeftEyeYdistance = nose.y - leftEye.y
        const noseToRightEyeYdistance = nose.y - rightEye.y

        const scoreThreshold = params.PoseDetectionCfg.modelConfig.scoreThreshold || 0;

        const noseVissible = nose.score > scoreThreshold
        const lEVissible = leftEye.score > scoreThreshold
        const REVissible = rightEye.score > scoreThreshold

        const lShoulderVissible = left_shoulder.score > scoreThreshold
        const rShoulderVissible = right_shoulder.score > scoreThreshold
        const lElbowVissible = left_elbow.score > scoreThreshold
        const rElbowVissible = right_elbow.score > scoreThreshold

        const shouldersAndElbowsVissible = lShoulderVissible && rShoulderVissible
            && lElbowVissible && rElbowVissible

        if (noseVissible && lEVissible && noseToLeftEyeYdistance < 5) {
            window.gameStateMoveLeft()
            camera.ctx.fillStyle = "red";
            console.log('LEFT')
        } else if (noseVissible && REVissible && noseToRightEyeYdistance < 5) {
            window.gameStateMoveRight()
            camera.ctx.fillStyle = "yellow";
            console.log('RIGHT')
        } else if (shouldersAndElbowsVissible && bothArmsUp) {
            movedUp = true
            window.gameStateMoveJump()
            camera.ctx.fillStyle = "blue";
        } else {
            if (movedUp) {
                if (!oneOfArmsUp) {
                    movedUp = false
                }
                window.gameStateStop()
            } else {
                if (oneOfArmsUp) {
                    movedUp = true
                    window.gameStateMoveUp()
                } else {
                    movedUp = false
                    window.gameStateStop()
                }
            }
        }
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
