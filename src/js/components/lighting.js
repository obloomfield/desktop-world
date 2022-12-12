import * as THREE from "three";
import { SCENEDATA } from "../setup";

export var lightParams = new (function () {
  this.HEMI_LIGHT_INTENSITY = 0.2;
})();

export var sunParams = new (function () {
  this.SUN_AXIS = new THREE.Vector3(4, 0, 7).normalize();
  this.ORBIT_SPEED = 0.005;
})();

export var sun_pivot = new THREE.Object3D();

export function addLights() {
  var sunlight = new THREE.SpotLight(0xffffff, 0.2);
  sunlight.position
    .set(
      SCENEDATA.camera.position.x,
      SCENEDATA.camera.position.y + 500,
      SCENEDATA.camera.position.z + 500
    )
    .normalize();
  SCENEDATA.add("sunlight", sunlight);
  // console.log(sunlight.color);

  var sun = new THREE.Mesh(
    new THREE.SphereGeometry(5, 5, 5),
    new THREE.MeshStandardMaterial({ color: 0xffff000, emissive: 0xffffff })
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
  SCENEDATA.add("sun_pivot", sun_pivot);

  const hemiLight = new THREE.HemisphereLight(
    0xffffff,
    0xffffff,
    lightParams.HEMI_LIGHT_INTENSITY
  );
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  SCENEDATA.add("hemiLight", hemiLight);
}

export function updateSun() {
  sun_pivot.rotateOnAxis(sunParams.SUN_AXIS, sunParams.ORBIT_SPEED);
}
