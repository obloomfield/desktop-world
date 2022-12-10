import { GUI } from "dat.gui";
import { createNoise2D } from "simplex-noise";
import Stats from "stats.js";
import * as THREE from "three";
import { Vector2 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "../public/style.css";
import {generateBase} from "./floating_island.js";
import {FloatingIsland} from "./floating_island_2.js";

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 3000);
var cameraTarget = { x: 0, y: 0, z: 0 };
camera.position.y = 70;
camera.position.z = 1000;
camera.rotation.x = (-15 * Math.PI) / 180;

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x999999);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

var light = new THREE.DirectionalLight(0x00ff00, 2);
light.position
  .set(camera.position.x, camera.position.y + 500, camera.position.z + 500)
  .normalize();
scene.add(light);

var geometry = new THREE.PlaneGeometry(800, 800, 20, 20);
const ORIGIN = new Vector2(0, 0);
var material = new THREE.MeshStandardMaterial({
  color: 0x3c3951,
  side: THREE.DoubleSide,
});
var terrain = new THREE.Mesh(geometry, material);
terrain.rotation.x = -Math.PI / 2;
scene.add(terrain);

// const islandBase = generateBase(0,0,50,100,100);
const islandGenerator = new FloatingIsland();

const islands = [];

const islandLocs = [[200,150,150]]; //, [-200,140,100], [75, 76, 85], [-150, -190, 125], [-145, 160, 104]];
const islandSize = [[100,150],[30,50],[60,90],[100,70],[45,36]];
for (var i = 0; i < islandLocs.length; i++) {
  var islandLoc = islandLocs[i];
  var islandDim = islandSize[i];
  var islandBase = await islandGenerator.generateIslandBase(islandLoc[0], islandLoc[1], islandLoc[2], islandDim[0], islandDim[1]);
  islands.push(islandBase);
  scene.add(islandBase);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const gui = new GUI();
const centerFolder = gui.addFolder("Center");
centerFolder.add(ORIGIN, "x", -50, 50);
centerFolder.add(ORIGIN, "y", -50, 50);
centerFolder.open();

var clock = new THREE.Clock();

function perlin(amp, freq, v_i, v_i2) {
  return amp * NOISE2D(v_i / freq, v_i2 / freq);
}

function falloff(point, rad) {
  let x = point.length() / rad;
  return -Math.pow(x, 10) + 1;
}

const NOISE2D = createNoise2D();
const PEAK = 20;
const RAD = 400;
function updateMesh() {
  var verts = terrain.geometry.attributes.position.array;
  for (var i = 0; i <= verts.length; i += 3) {
    let pt = new Vector2(verts[i], verts[i + 1]);
    let pt_len = pt.length();
    let r = pt.addScaledVector(ORIGIN, -1);
    if (ORIGIN.distanceTo(pt) > RAD) {
      verts[i] *= RAD / pt_len;
      verts[i + 1] *= RAD / pt_len;
      verts[i + 2] = 0;
    }
    verts[i + 2] =
      PEAK *
      (300 / (r.length() + 50)) *
      falloff(pt, RAD) *
      (perlin(1 / 8, 4, verts[i], verts[i + 1]) +
        perlin(1 / 2, 40, verts[i], verts[i + 1]) +
        perlin(1, 400, verts[i], verts[i + 1]));
  }
  terrain.geometry.attributes.position.needsUpdate = true;
  terrain.geometry.computeVertexNormals();
}

const SPEED = 100;
var times = [0,Math.PI/3, -Math.PI/4,Math.PI/6, Math.PI/5];

function update() {
  var delta = clock.getDelta();
  // console.log(times);
  for (var i = 0; i < islands.length; i++) {
    islands[i].position.y += 0.15*Math.sin(times[i]);
  }
  // terrain.position.z += SPEED * delta;
  // camera.position.z += SPEED * delta;
  /* Moving the terrain forward. */
  const newTimes = times.map((x) => x+delta);
  times = newTimes;
  // times[i] = Math.min(Math.max(0, times[i]), 10000);
  updateMesh();
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
loop();
