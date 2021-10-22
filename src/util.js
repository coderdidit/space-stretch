 import * as tf from '@tensorflow/tfjs-core';

 async function setBackend(backendName) {
   const ENGINE = tf.engine();
   if (!(backendName in ENGINE.registryFactory)) {
     throw new Error(`${backendName} backend is not registed.`);
   }
 
   if (backendName in ENGINE.registry) {
     const backendFactory = tf.findBackendFactory(backendName);
     tf.registerBackend(backendName, backendFactory);
   }
 
   await tf.setBackend(backendName);
 }
 
