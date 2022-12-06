import * as THREE from "three";

export var lightParams = new (function () {
  this.HEMI_LIGHT_INTENSITY = 0.2;
})();

export var sunParams = new (function () {
  this.SUN_AXIS = new THREE.Vector3(4, 0, 7).normalize();
  this.ORBIT_SPEED = 0.005;
})();

var sun_pivot = new THREE.Object3D();

export function addLights(scene, camera) {
  var sunlight = new THREE.DirectionalLight(0xffffff, 1);
  sunlight.position
    .set(camera.position.x, camera.position.y + 500, camera.position.z + 500)
    .normalize();
  scene.add(sunlight);
  console.log(sunlight.color);

  var sun = new THREE.Mesh(
    new THREE.SphereGeometry(5, 5, 5),
    new THREE.MeshBasicMaterial({ color: 0xffff000 })
  );
  sun_pivot.add(sun);
  sun_pivot.add(sunlight);

  sun.position.set(0, 500, 0);
  sunlight.position.set(
    sun.position.x * 300,
    sun.position.y * 300,
    sun.position.z * 300
  );
  console.log(sun.position);
  scene.add(sun_pivot);

  const hemiLight = new THREE.HemisphereLight(
    0xffffff,
    0xffffff,
    lightParams.HEMI_LIGHT_INTENSITY
  );
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);
  return [sunlight, hemiLight];
}

export function updateSun() {
  sun_pivot.rotateOnAxis(sunParams.SUN_AXIS, sunParams.ORBIT_SPEED);
  // console.log(sunlight.rotation);
}
