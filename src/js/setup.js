import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { addIslands, FloatingIsland } from "./components/island";
import { addLights } from "./components/lighting";
import { addModels } from "./components/models";
import { createClusters } from "./components/particles";
import { circle_constraint_material } from "./components/shader";
import { addSky } from "./components/sky";
import { addTerrain } from "./components/terrain";
import { makeGUI, makeStats } from "./components/ui";
import { buildWater2 } from "./components/water";
import { setupEvents } from "./events";
import { loop } from "./update";

import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass.js";
import { vertShader,fragShader,uniformData } from "./components/interp_shader";


export class SCENEDATA {
  static WIDTH;
  static HEIGHT;

  static scene;
  static camera;
  static renderer;
  static controls;

  static bloomComposer;
  static finalComposer;
  static bloomLayer;
  static materials = {};

  static objects = new Map();
  static islands = new Array();

  // # means private in JS - strange lol
  static #setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color().setHSL(0.3, 0, 0.8);
  }

  static #setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.WIDTH / this.HEIGHT,
      1,
      3000
    );
    // var cameraTarget = { x: 0, y: 0, z: 0 };
    this.camera.position.y = 700;
    this.camera.position.z = 2000;
    this.camera.rotation.x = (-15 * Math.PI) / 180;
  }

  static #setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    console.log("reached setup");
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    document.body.appendChild(this.renderer.domElement);
  }

  static #setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = false;
  }

  static #setupBloom() {

    const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;


const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
const materials = {};
this.bloomLayer = new THREE.Layers();
this.bloomLayer.set( BLOOM_SCENE );



const bloomParams = {
        exposure: 1,
        bloomStrength: 5,
        bloomThreshold: 0,
        bloomRadius: 0,
        scene: 'Scene with Glow'
      };

this.bloomComposer = new EffectComposer(SCENEDATA.renderer);
const renderScene = new RenderPass(SCENEDATA.scene, SCENEDATA.camera);
this.bloomComposer.renderToScreen = false;
this.bloomComposer.addPass(renderScene);
this.bloomComposer.addPass(new UnrealBloomPass({x: 1024, y: 1024}, 1.0, 0.0, 0.0));

// uniformData.bloomTexture.value = this.bloomComposer.renderTarget2.texture;

const finalPass = new ShaderPass(
        new THREE.ShaderMaterial( {
          uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
          },
          vertexShader: vertShader(),
          fragmentShader: fragShader(),
          defines: {}
        } ), 'baseTexture'
      );
finalPass.needsSwap = true;

this.finalComposer = new EffectComposer( SCENEDATA.renderer );
      this.finalComposer.addPass( renderScene );
      this.finalComposer.addPass( finalPass );


}


  // add keyed object3d to scene
  static add(key, object) {
    this.objects.set(key, object);
    this.scene.add(object);
  }

  // get keyed object3d from scene
  static get(key) {
    return this.objects.get(key);
  }

  static async setup() {
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;

    this.#setupScene();

    this.#setupCamera();

    this.#setupRenderer();

    this.#setupControls();

    this.#setupBloom();

    addLights();

    addTerrain();

    await addIslands();

    createClusters();

    buildWater2();

    addSky();

    addModels();

    makeStats();
    makeGUI();

    setupEvents();

    loop();
  }
}
