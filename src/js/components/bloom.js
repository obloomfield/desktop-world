import * as THREE from "three";

import { SCENEDATA } from "../setup";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { bloomPass } from "./shader";

const ENTIRE_SCENE = 0,
  BLOOM_SCENE = 1;


  export var bloomParam = {
    bloomEnabled: false
  }

var bloomLayer = new THREE.Layers();
var bloomComposer;
var finalComposer;

const materials = {};

const DARK_MATERIAL = new THREE.MeshBasicMaterial({ color: "black" });

export function setupBloom() {
  bloomLayer.set(BLOOM_SCENE);

  bloomComposer = new EffectComposer(SCENEDATA.renderer);
  const renderScene = new RenderPass(SCENEDATA.scene, SCENEDATA.camera);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(
    new UnrealBloomPass({ x: 1024, y: 1024 }, 1.0, 0.0, 0.0)
  );

  // uniformData.bloomTexture.value = bloomComposer.renderTarget2.texture;

  finalComposer = new EffectComposer(SCENEDATA.renderer);
  finalComposer.addPass(renderScene);
  finalComposer.addPass(bloomPass(bloomComposer.renderTarget2.texture));
}

export function renderBloom() {
  // renderer.render( scene, camera );
  traverseBloom();
  
  finalComposer.render();
}

function traverseBloom() {
  SCENEDATA.scene.traverse(darkenNonBloomed);
  bloomComposer.render();
  SCENEDATA.scene.traverse(restoreMaterial);

  // camera.layers.set( BLOOM_SCENE );
  // bloomComposer.render();
  // camera.layers.set( ENTIRE_SCENE );
}
function darkenNonBloomed(obj) {
  // console.log(bloomLayer);
  if (!(obj.isMesh && bloomLayer.test( obj.layers ))) {
    materials[obj.uuid] = obj.material;
    obj.material = DARK_MATERIAL;
  }
}

function restoreMaterial(obj) {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}
