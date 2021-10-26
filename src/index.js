import 'regenerator-runtime/runtime'
import { Camera } from './camera';
import { handleMoveToEvent } from './game-state'
import * as params from './pose-detection-cfg';
import { getAngleBetween } from './angles';
import { left, right, up, stop } from './game-state'

let camera;
const startGame = async () => {
    console.log('starting camera setup')
    camera = await Camera.setupCamera();
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
    predictPose()
}

// TODO implement jump up move after 3 stop, up moves 
let movedUp = false
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
        return left;
    } else if (noseVissible && REVissible
        && noseToRightEyeYdistance < moveSideActivationDist) {
        return right;
    } else if (shouldersAndElbowsVissible && bothArmsUp) {
        movedUp = true
        return up;
    } else {
        movedUp = false
        return stop;
    }
}

const predictionsWorker = new Worker('predictions.js')

predictionsWorker.onmessage = e => {
    const poses = e.data

    camera.drawCtx();
    if (poses && poses.length > 0) {
        camera.drawResults(poses);
        const pose = poses[0]
        const move = handlePoseToGameEvents(pose)
        handleMoveToEvent(move)
    }
}

const predictPose = async () => {
    const width = camera.canvas.width;
    const height = camera.canvas.height;
    const imgData = camera.ctx.getImageData(0, 0, width, height)
    
    predictionsWorker.postMessage(imgData, [imgData.data.buffer])    
    requestAnimationFrame(() => {
        predictPose()
    })
}

const playBtn = document.getElementById('play-btn')
playBtn.addEventListener('click', () => startGame())
