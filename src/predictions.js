import 'regenerator-runtime/runtime'
import * as params from './pose-detection-cfg';
import * as tf from '@tensorflow/tfjs-core';
// import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import * as poseDetection from '@tensorflow-models/pose-detection';
// import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-cpu';



let poseDetector;
const setupTf = async () => {
    // TODO wasm is much faster investigate why
    // + vendor the dist
    // const wasmPath = `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
    // console.log('registering wasm backend', wasmPath)
    // tfjsWasm.setWasmPaths(wasmPath);

    // setup AI
    await tf.setBackend(params.PoseDetectionCfg.backend)
    console.log(`tfjs backend loaded ${params.PoseDetectionCfg.backend}`)
    poseDetector = await poseDetection.createDetector(
        params.PoseDetectionCfg.model,
        params.PoseDetectionCfg.modelConfig);
}

setupTf()

const predict = async (imgData) => {
    // pose detection
    let poses;
    try {
        poses = await poseDetector.estimatePoses(imgData)
    } catch (error) {
        poseDetector.dispose();
        poseDetector = null;
        console.error("error in worker.predict", error)
    }
    return poses
}

onmessage = async (e) => {
    const imgData = e.data

    const poses = await predict(imgData)
    postMessage(poses)
}

onerror = (e) => {
    console.error("error in worker", e)
}