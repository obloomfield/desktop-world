import * as THREE from "three";
import { Vector3 } from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { sunParams } from "./lighting";
import { circle_constraint_material } from "./shader";

import { SCENEDATA } from "../setup";

export var waterParams = new (function () {
  this.FREQUENCY = 3;
  this.AMPLITUDE = 30;
  this.PHASE = Math.PI;
})();

var sunDirection = new THREE.Vector3(0, 50, 0);
export function buildWater() {
  const waterGeometry = new THREE.CircleGeometry(500, 100);

  const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "public/waternormals.jpeg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    alpha: 1.0,
    sunDirection: new THREE.Vector3(1, 1, 1),
    sunColor: 0xffffff,
    waterColor: 0xc4bdff,
    distortionScale: 0,
    fog: false,
  });
  water.rotation.x = -Math.PI / 2;
  SCENEDATA.add("water", water);

  // const waterUniforms = water.material.uniforms;
  // return water;
}

export function updateWater(water) {
  water.material.uniforms["time"].value += 1.0 / 60.0;
}
var vertData = [];
var g;
var bottom;
var rimData = [];

export function updateWater2(time) {
  vertData.forEach((vd, idx) => {
    let y =
      vd.initH + Math.sin((time + vd.phase) * vd.frequency) * vd.amplitude;
    g.attributes.position.setY(idx, y);
  });
  g.attributes.position.needsUpdate = true;
  g.computeVertexNormals();

  rimData.forEach((vd, idx) => {
    let y =
      vd.initH + Math.sin((time + vd.phase) * vd.frequency) * vd.amplitude;
    bottom.attributes.position.setY(idx, y);
  });
  bottom.attributes.position.needsUpdate = true;
  bottom.computeVertexNormals();
}

export function buildWater2() {
  g = new THREE.PlaneGeometry(1000, 1000, 15, 15);
  bottom = new THREE.SphereGeometry(
    500,
    100,
    100,
    0,
    2 * Math.PI,
    Math.PI / 2.1,
    Math.PI
  );
  g.rotateX(-Math.PI * 0.5);
  g.toNonIndexed(); // flat-shading?
  let v3 = new THREE.Vector3(); // for re-use
  for (let i = 0; i < g.attributes.position.count; i++) {
    v3.fromBufferAttribute(g.attributes.position, i);
    vertData.push({
      initH: v3.y,
      amplitude: THREE.MathUtils.randFloatSpread(waterParams.AMPLITUDE),
      phase: THREE.MathUtils.randFloat(0, waterParams.PHASE),
      frequency: THREE.MathUtils.randFloat(0, waterParams.FREQUENCY),
    });
  }
  for (let i = 0; i < bottom.attributes.position.count; i++) {
    v3.fromBufferAttribute(bottom.attributes.position, i);
    if (v3.y > 0) {
      rimData.push({
        initH: v3.y,
        amplitude: THREE.MathUtils.randFloatSpread(30),
        phase: THREE.MathUtils.randFloat(0, Math.PI),
        frequency: THREE.MathUtils.randFloat(0, 3),
      });
    }
  }
  let m = new THREE.MeshStandardMaterial({
    color: "blue",
    // alphaMap: alpha,
    side: THREE.Side,
    // transparent: true,
    roughness: 1.0,
  });
  let m2 = new THREE.MeshStandardMaterial({
    color: "blue",
    roughness: 1.0,
    side: THREE.FrontSide,
    emissive: new THREE.Color("blue"),
    emissiveIntensity: 0.2,
    emissiveMap: new THREE.TextureLoader().load(
      "/public/models/watergradient3.png"
    ),
  });
  let o = new THREE.Mesh(
    g,
    circle_constraint_material(new THREE.Color("blue"), false)
  );
  o.position.y = -0;
  SCENEDATA.add("water_top", o);
  o.layers.enable(1);
  let o2 = new THREE.Mesh(bottom, m2);
  // o2.layers.enable(1);
  SCENEDATA.add("water_bowl", o2);
}

export function updateClickedWater(intersect) {
  intersect.object.material.color.value = new THREE.Color("red");
}
