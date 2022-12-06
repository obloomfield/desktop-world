import * as THREE from "three";

export var fireflyParams = new (function () {
  this.FLY_RADIUS = 250;
})();

export function createFireFly(scene) {
  let particle = new THREE.Sprite();
  particle.scale.set(5, 5, 5);
  particle.position.set(0, 100, 0);
  scene.add(particle);
  return particle;
}

export function updateFirefly(particle, elapsed) {
  particle.position.x = fireflyParams.FLY_RADIUS * Math.sin(elapsed);
  particle.position.z = fireflyParams.FLY_RADIUS * Math.cos(elapsed);
  particle.position.y = (fireflyParams.FLY_RADIUS * Math.cos(elapsed)) / 2 + 1;
  // particle.rotateOnAxis(axis, speed);
}
