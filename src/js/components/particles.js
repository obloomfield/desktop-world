import * as THREE from "three";

import { SCENEDATA } from "../setup";

var particles = [];
var pLights = [];
var initialpos = [];
var randz = [];
var numParticles = 5;

export var fireflyParams = new (function () {
  this.SPREAD = 10;
  this.NUMCLUSTERS = 4;
})();

export function updateParticles(elapsed) {
  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];
    let plight = pLights[i];
    var initpos = initialpos[i];
    particle.position.x =
      initpos.x + randz[i] * 10 * Math.sin(elapsed / 2 + randz[i]);
    particle.position.z =
      initpos.z + randz[i] * 10 * Math.cos(elapsed / 2 + randz[i]);
    particle.position.y =
      initpos.y + randz[i] * Math.cos(5 * elapsed + randz[i]);
    plight.position.x = particle.position.x;
    plight.position.y = particle.position.y;
    plight.position.z = particle.position.z;
    var alpha = (Math.sin(elapsed * 10) + 1.0) / 2.0;
    plight.intensity = alpha;
  }
}

export function createFireFly(x, y, z, i) {
  let particle = new THREE.Sprite();
  particle.scale.set(2, 2, 2);
  particle.position.set(
    Math.random() * fireflyParams.SPREAD + x,
    Math.random() * fireflyParams.SPREAD + y,
    Math.random() * fireflyParams.SPREAD + z
  );

  let plight = new THREE.PointLight("#a833ff", 1, 100, 2);
  plight.position.set(
    particle.position.x,
    particle.position.y,
    particle.position.z
  );

  particles.push(particle);
  pLights.push(plight);
  let initialpospart = new THREE.Vector3(
    particle.position.x,
    particle.position.y,
    particle.position.z
  );
  initialpos.push(initialpospart);
  randz.push(Math.random() * 10 - 5);
  SCENEDATA.add("plight-".concat(i), plight);
  SCENEDATA.add("particle-".concat(i), particle);
}
export function manageParticles(x, y, z) {
  for (let i = 0; i < numParticles; i++) {
    createFireFly(x, y, z, i);
  }
}

export function createClusters() {
  for (let i = 0; i < fireflyParams.NUMCLUSTERS; i++) {
    manageParticles(
      Math.random() * 800 - 400,
      Math.random() * 50 + 100,
      Math.random() * 800 - 400
    );
  }
}
