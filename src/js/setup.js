import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { setupBloom } from "./components/bloom";
import { setupBoids } from "./components/boidHandler";
import { buildClouds, makeRain } from "./components/clouds";
import { addIslands } from "./components/island";
import { addLights } from "./components/lighting";
import { addModels } from "./components/models";
import { createClusters } from "./components/particles";
import { addParticleSystem } from "./components/particleSystem";
import { addSky } from "./components/sky";
import { addTerrain, updateTerrain } from "./components/terrain";
import { makeGUI, makeStats } from "./components/ui";
import { buildWater2 } from "./components/water";
import { setupEvents } from "./events";
import { loop } from "./update";

export class SCENEDATA {
  static WIDTH;
  static HEIGHT;

  static scene;
  static camera;
  static renderer;
  static controls;

  static objects = new Map();
  static islands = new Array();

  static obstacles = new Array();

  static boidHandler;

  static treeObj;

  static updateTerrain = true;

  // # means private in JS - strange lol
  static #setupScene() {
    this.scene = new THREE.Scene();
  }

  static #setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.WIDTH / this.HEIGHT,
      1,
      100000
    );
    var cameraTarget = { x: 0, y: 0, z: 0 };
    this.camera.position.y = 700;
    this.camera.position.z = 2000;
    this.camera.rotation.x = (-15 * Math.PI) / 180;
    // this.camera.position.set(25,10,0);
  }

  static #setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    console.log("reached setup");
    this.renderer.setClearColor(0x000000);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    document.body.appendChild(this.renderer.domElement);
  }

  static #setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
  }

  // add keyed object3d to scene
  static add(key, object) {
    this.objects.set(key, object);
    this.scene.add(object);
  }

  // add keyed to scene, with obstacle collision add as well
  static addObstacle(key, object) {
    this.add(key, object);
    this.obstacles.push(object);
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

    setupBloom();

    addLights();

    addTerrain();

    await addIslands();

    // addParticleSystem(150,150,-150);

    // createClusters();

    buildWater2();

    buildClouds();

    makeRain();

    // addSky();

    await addModels();

    this.boidHandler = setupBoids();

    makeStats();
    makeGUI();

    setupEvents();

    updateTerrain(this.terrain);

    loop();
  }
}
