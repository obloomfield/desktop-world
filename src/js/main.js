import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "../public/style.css";

import { setupEvents } from "./events";
import { addLights, updateSun } from "./lighting";

import { CullFaceFrontBack } from "three";
import { addModels } from "./models";
import { createClusters, updateParticles } from "./particles";
import { circle_constraint_material } from "./shader";
import { terrainParams, updateTerrain } from "./terrain";
import { makeGUI, makeStats, stats } from "./ui";
import { buildWater, buildWater2, updateWater, updateWater2 } from "./water";

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

// const loader = new THREE.TextureLoader();
// const alpha = loader.load("/public/alpha3.png");

var scene = new THREE.Scene();
scene.background = new THREE.Color().setHSL(0.3, 0, 0.8);
// scene.fog = new THREE.Fog(scene.background, 1, 5000);

var camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 3000);
var cameraTarget = { x: 0, y: 0, z: 0 };
camera.position.y = 700;
camera.position.z = 2000;
camera.rotation.x = (-15 * Math.PI) / 180;

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor(0xffffff, 0);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

var [sunlight, hemiLight] = addLights(scene, camera);

var geometry = new THREE.PlaneGeometry(1000, 1000, 20, 20);
var material = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  side: THREE.Side,
});

var terrain = new THREE.Mesh(
  geometry,
  circle_constraint_material(new THREE.Vector4(0, 1, 0, 1))
);

// if (terrainParams.FLAT_SHADING) {
//   terrain.geometry = terrain.geometry.toNonIndexed();
// }
terrain.rotation.x = -Math.PI / 2;
scene.add(terrain);

createClusters(scene);
//const water = buildWater(scene);
buildWater2(scene);

var back = new THREE.SphereGeometry(500, 100, 100, 0, 2 * Math.PI, 0, Math.PI);
let m = new THREE.MeshStandardMaterial({
  color: "pink",
  roughness: 1.0,
});
m.side = THREE.BackSide;
let o = new THREE.Mesh(back, m);
scene.add(o);

addModels(scene);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;

var clock = new THREE.Clock();

var i = 0;
function update() {
  var delta = clock.getDelta();
  var elapsed = clock.elapsedTime;
  // terrain.position.z += SPEED * delta;
  // camera.position.z += SPEED * delta;
  /* Moving the terrain forward. */
  updateSun();

  updateParticles(elapsed, scene);
  updateTerrain(terrain);
  //updateWater(water, sun_pivot.position);
  updateWater2(elapsed);
  i++;
}

function render() {
  controls.update();
  renderer.render(scene, camera);
}

function loop() {
  stats.begin();
  update();
  render();
  stats.end();
  requestAnimationFrame(loop);
}
makeStats();
makeGUI();
setupEvents(renderer, terrain, camera, scene);
loop();
