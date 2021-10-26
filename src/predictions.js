import 'regenerator-runtime/runtime'
import { getAngleBetween } from './angles';
import * as params from './pose-detection-cfg';
import { left, right, up, stop } from './game-state'

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

// var myWorker = new Worker('worker.js');
// myWorker.postMessage(JSON.stringify(pose[0]));

const predict = async (video, poseDetector) => {
    // pose detection
    let poses;
    try {
        poses = await poseDetector.estimatePoses(video)
    } catch (error) {
        poseDetector.dispose();
        poseDetector = null;
        alert(error);
    }
    return poses
}

export { predict, handlePoseToGameEvents }
