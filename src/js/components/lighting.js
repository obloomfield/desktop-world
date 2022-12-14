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
  // var ambLight = new THREE.AmbientLight(0xffffff);
  // SCENEDATA.add("ambient", ambLight);
  var pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(0,4000,0);
  pointLight.intensity = 0.4;
  pointLight.castShadow = false;
  pointLight.shadow.mapSize.width = 2048;
  pointLight.shadow.mapSize.height = 2048;
  pointLight.shadow.camera.far = 10000;
  SCENEDATA.add("pointlight", pointLight);
  // var pointLight2 = new THREE.PointLight(0xffffff);
  // pointLight2.position.set(0,4000,0);
  // pointLight2.intensity = 0.2;
  // SCENEDATA.add("pointlight2", pointLight2);

  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.intensity = 0.6;
  spotLight.angle  = Math.PI/6;
  spotLight.penumbra = 0.5;
  spotLight.position.set(-1620,500,110);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.camera.far = 10000;

  SCENEDATA.add("spotlight", spotLight);

  var sunlight = new THREE.PointLight(0xffffff);
  sunlight.position
    .set( 1000,1000,-1000
      // SCENEDATA.camera.position.x,
      // SCENEDATA.camera.position.y + 500,
      // SCENEDATA.camera.position.z + 500
    )
  // sunlight.castShadow = true;
    // .normalize();
  // SCENEDATA.add("sunlight", sunlight);
  // console.log(sunlight.color);

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
  // console.log(sun.position);
  //SCENEDATA.add("sun_pivot", sun_pivot);

  const hemiLight = new THREE.HemisphereLight(
    0xffffff,
    0xffffff,
    lightParams.HEMI_LIGHT_INTENSITY
  );
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  //SCENEDATA.add("hemiLight", hemiLight);
}

export function updateSun() {
  sun_pivot.rotateOnAxis(sunParams.SUN_AXIS, sunParams.ORBIT_SPEED);
}
