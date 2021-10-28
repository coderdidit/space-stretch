import 'regenerator-runtime/runtime'
import { Camera } from './camera';
import { predict } from './predictions'
import { handleMoveToEvent } from './game-state'
import * as params from './pose-detection-cfg';
import { getAngleBetween } from './angles';
import { left, right, up, stop } from './game-state'


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

// fps for predictions
let fps = 5;
let then = Date.now();
let now, delta;
let interval = 1000 / fps;
let poses

const predictPose = async (camera) => {
    requestAnimationFrame(() => {
        predictPose(camera)
    })

    now = Date.now();
    delta = now - then;
    if (delta > interval) {
        then = now - (delta % interval);
        poses = await predict(camera.video)
        camera.drawCtx()
        if (poses && poses.length > 0) {
            camera.drawResults(poses);
            const pose = poses[0]
            const move = handlePoseToGameEvents(pose)
            handleMoveToEvent(move)
        }
    }
}

const playBtn = document.getElementById('play-btn')
playBtn.addEventListener('click', () => startGame())
