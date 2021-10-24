 import * as posedetection from '@tensorflow-models/pose-detection';
 
 export const BLAZEPOSE_CONFIG = {
   maxPoses: 1,
   type: 'full',
   scoreThreshold: 0.65,
   render3D: true
 };
 export const MOVENET_CONFIG = {
   maxPoses: 1,
   type: 'lightning',
   scoreThreshold: 0.3,
   customModel: '',
   enableTracking: false
 };

const moveNetModel = posedetection.SupportedModels.MoveNet
const blazePoseModel = posedetection.SupportedModels.BlazePose

export const modelToCfg = {
  moveNetModel: MOVENET_CONFIG,
  blazePoseModel: BLAZEPOSE_CONFIG
}

export const PoseDetectionCfg = {
  camera: {targetFPS: 60},
  backend: 'wasm',
  modelConfig: modelToCfg[moveNetModel],
  model: moveNetModel
}

