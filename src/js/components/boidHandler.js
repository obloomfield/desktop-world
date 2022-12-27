import * as THREE from "three";
import { SCENEDATA } from "../setup.js";
import { terrainParams } from "./terrain.js";

import Boid from "./boid.js";

export var sphereRays = [];

export var boidParams = new (function () {
  this.NUM_RAYS = 100;
  this.NUM_BOIDS = 50;
  this.GEN_HEIGHT_MIN = terrainParams.PEAK; // min offset to make sure boids don't generate under terrain
  this.FOLLOW_TARGET = true;
  this.MIN_VELOCITY = -1;
  this.MAX_VELOCITY = 2;
  this.WANDER_WEIGHT = 0.4;
  this.WANDER_MIN_DIST = 5;
  this.WANDER_MAX_CNT = 500;
  this.COHESION_WEIGHT = 0.8;
  this.COHESION_DIST = 50;
  this.SEPARATION_WEIGHT = 1;
  this.SEPARATION_DIST = 100;
  this.ALIGNMENT_WEIGHT = 1;
  this.ALIGNMENT_DIST = 50;
  this.VISION_MAX = 150;
  this.BOUNDARY_RAD = terrainParams.RAD;
  this.ORIGIN = new THREE.Vector3(0, 0, 0);
  this.LOOK_SMOOTHING = true;
  this.SMOOTHING_SAMPLES = 20;
  this.TARGETING_ERROR = 10;
  this.TARGETING_FORGET_CNT = 200; // how many frames required for the boid to forget its previous targeting...
  this.FLICKER = true;
  this.RAYCASTING = false;
  this.RAYCAST_SEC_DELAY = 1;
  this.RAYCAST_MAX_DIST = 500;
  this.NORMAL_EMISSIVE = 0xffffff;
  this.BLOOM_EMISSIVE = 0xeed490; //0xdaa520;
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

export function randomPointError(pos, error) {
  // sample a random point around 'pos' with error radius 'error'
  return new THREE.Vector3(
    pos.x + (Math.random() * 2 * error - error),
    pos.y + (Math.random() * 2 * error - error),
    pos.z + (Math.random() * 2 * error - error)
  );
}

export function randomStartPos() {
  // only generate in top hemisphere
  const r = boidParams.BOUNDARY_RAD - 10; // - 10 to make sure they don't spawn right next to edge
  var x = Math.random() * 2 * r - r;
  const z_max = Math.sqrt(r * r - x * x);
  var z = Math.random() * 2 * z_max - z_max;
  const y_max = Math.sqrt(r * r - x * x - z * z); // height of hemisphere cap == max generated height
  var y =
    Math.random() * (y_max - boidParams.GEN_HEIGHT_MIN) +
    boidParams.GEN_HEIGHT_MIN; // random height from min height to hemisphere cap

  // console.log(x);

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

  // console.log(handler.boids);

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
    this.ticks_since_target = 0;
    // console.log(numBoids);

    this.flicker_offsets = [];
    // this.generateFlickerOffsets(numBoids);
    this.generateBoids(numBoids);
  }

  generateFlickerOffsets(n) {
    for (let i = 0; i < n; n++) {
      this.flicker_offsets.push(Math.random() * Math.PI);
    }
  }

  generateBoids(numBoids) {
    this.boids = this.boids || [];

    var position, color, followTarget, quaternion;

    for (let i = 0; i < numBoids; i++) {
      position = randomStartPos();
      // console.log(position);
      color = null; // will use default color in getBoid
      followTarget = boidParams.FOLLOW_TARGET;
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
    this.ticks_since_target = 0;
    this.target = newTarget;
    this.boids.forEach((boid) => {
      boid.target = randomPointError(newTarget, boidParams.TARGETING_ERROR);
    });
  }

  resetTargets() {
    // console.log("RESETTING BOID TARGETING");
    this.boids.forEach((boid) => {
      boid.target = null;
    });
  }

  applyFlicker(elapsed) {
    for (let i = 0; i < this.numBoids; i++) {
      var cur_boid = this.boids[i];
      var alpha = (Math.sin(elapsed * 10) + 1.0) / 2.0;
      cur_boid.mat.opacity = alpha;
    }
  }

  updateBoidBloom(is_bloom) {
    var new_emissive = is_bloom
      ? boidParams.BLOOM_EMISSIVE
      : boidParams.NORMAL_EMISSIVE;
    this.boids.forEach((boid) => {
      boid.mat.emissive.setHex(new_emissive);
    });
  }

  updateBoids(delta, elapsed) {
    // console.log(this.ticks_since_target);
    if (this.target !== null) this.ticks_since_target++;
    if (this.ticks_since_target > boidParams.TARGETING_FORGET_CNT) {
      this.resetTargets();
    }
    if (boidParams.FLICKER) {
      this.applyFlicker(elapsed);
    }

    this.boids.forEach((boid) => {
      boid.update(delta, this.boids, SCENEDATA.obstacles, elapsed);
    });
  }
}
