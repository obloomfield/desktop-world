import * as THREE from "three";
import { SCENEDATA } from "../setup";
import { terrainParams } from "./terrain";

import Boid from "./boid";

export var sphereRays = [];

export var boidParams = new (function () {
  this.NUM_RAYS = 100;
  this.NUM_BOIDS = 5;
  this.GEN_HEIGHT_MIN = terrainParams.PEAK; // min offset to make sure boids don't generate under terrain
  this.FOLLOW_TARGET = false;
  this.MIN_VELOCITY = -1;
  this.MAX_VELOCITY = 1;
  this.WANDER_WEIGHT = 0.2;
  this.COHESION_WEIGHT = 1;
  this.SEPARATION_WEIGHT = 1;
  this.ALIGNMENT_WEIGHT = 1;
  this.VISION_MAX = 150;
  this.BOUNDARY_RAD = terrainParams.RAD;
  this.ORIGIN = new THREE.Vector3(0, 0, 0);
})();

function azimuthal(inclination, azimuth) {
  return new THREE.Vector3(
    Math.sin(inclination) * Math.cos(azimuth),
    Math.sin(inclination) * Math.sin(azimuth),
    Math.cos(inclination)
  );
}

// inspired by sebastian lague's boid video
function generateSphereRays() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const increm = 2 * Math.PI * phi;

  for (var i = 0; i < boidParams.NUM_RAYS; i++) {
    const incline = Math.acos(1 - 2 * (i / boidParams.NUM_RAYS));
    const azimuth = increm * i;

    sphereRays.push(azimuthal(incline, azimuth));
  }
}

generateSphereRays();

function randomStartPos() {
  // only generate in top hemisphere
  const r = boidParams.BOUNDARY_RAD - 10; // - 10 to make sure they don't spawn right next to edge
  var x = Math.random() * 2 * r - r;
  var z = Math.random() * 2 * r - r;
  const y_max = Math.sqrt(r * r - x * x - z * z); // height of hemisphere cap == max generated height
  var y =
    Math.random() * (y_max - boidParams.GEN_HEIGHT_MIN) +
    boidParams.GEN_HEIGHT_MIN; // random height from min height to hemisphere cap

  console.log(x);

  return new THREE.Vector3(x, y, z);
}

export function randomVelocity() {
  const min = boidParams.MIN_VELOCITY,
    max = boidParams.MAX_VELOCITY;

  const v_range = max - min;
  return new THREE.Vector3(
    (Math.random() + min / v_range) * v_range,
    (Math.random() + min / v_range) * v_range,
    (Math.random() + min / v_range) * v_range
  );
}

export function setupBoids() {
  var handler = new BoidHandler(
    boidParams.NUM_BOIDS,
    SCENEDATA.obstacles,
    null
  );

  console.log(handler.boids);

  for (var i = 0; i < handler.boids.length; i++) {
    SCENEDATA.add("boid-".concat(i), handler.boids[i].mesh);
  }
  return handler;
}

export default class BoidHandler {
  //
  constructor(numBoids = boidParams.NUM_BOIDS, obstacles = [], target = null) {
    this.obstacles = obstacles;
    this.target = target;
    // console.log(numBoids);

    this.generateBoids(numBoids);
  }

  generateBoids(numBoids) {
    this.boids = this.boids || [];

    var position, color, followTarget, quaternion;

    for (let i = 0; i < numBoids; i++) {
      position = randomStartPos();
      console.log(position);
      color = null; // will use default color in getBoid
      followTarget = this.FOLLOW_TARGET;
      quaternion = null;

      // first boid is special :)
      if (i === 0) {
        color = 0xe56289;
      }

      var boid = new Boid(position, quaternion, color, followTarget);
      this.boids.push(boid);
    }
  }

  // updates the target position for all boids
  updateTarget(newTarget) {
    this.target = newTarget;
  }

  updateBoids(delta) {
    this.boids.forEach((boid) => {
      boid.update(delta, this.boids, this.obstacles, this.target);
    });
  }
}
