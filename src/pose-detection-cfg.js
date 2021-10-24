 import * as posedetection from '@tensorflow-models/pose-detection';
 
const BLAZEPOSE_CONFIG = {
   maxPoses: 1,
   type: 'full',
   scoreThreshold: 0.65,
   render3D: true
 };
const MOVENET_CONFIG = {
   maxPoses: 1,
   type: 'lightning',
   scoreThreshold: 0.3,
   customModel: '',
   enableTracking: false
 };

const moveNetModel = posedetection.SupportedModels.MoveNet
const blazePoseModel = posedetection.SupportedModels.BlazePose

export const modelToCfg = new Map([
  [moveNetModel, MOVENET_CONFIG],
  [blazePoseModel, BLAZEPOSE_CONFIG]
])

// pose detection model config
export const PoseDetectionCfg = {
  camera: {targetFPS: 60},
  backend: 'wasm',
  modelConfig: modelToCfg.get(moveNetModel),
  model: moveNetModel
}

console.log('PoseDetectionCfg', PoseDetectionCfg)
