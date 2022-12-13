import * as THREE from "three";
import { Scene, Vector3 } from "three";

import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { BufferGeometry, Object3D } from "three";

import { SCENEDATA } from "../setup";

const map = (val, smin, smax, emin, emax) =>
  ((emax - emin) * (val - smin)) / (smax - smin) + emin;

var clouds = [];
var geos = [];
var bobbing = [];
var raining = false;
var cloudPos = [];
var rainDrops = [];
var rainDropPoses = [];
var rainDropSpeeds = [];

export function buildClouds() {
  var numClouds = THREE.MathUtils.randInt(5, 30);
  for (let i = 0; i < numClouds; i++) {
    var height = THREE.MathUtils.randFloat(200, 300);
    var pos = new THREE.Vector3(
      THREE.MathUtils.randFloat(-300, 300),
      height,
      THREE.MathUtils.randFloat(-300, 300)
    );
    var rotation = THREE.MathUtils.randFloat(0, 2 * Math.PI);
    cloudPos.push(pos);
    buildCloud(
      THREE.MathUtils.randFloat(10, 20),
      THREE.MathUtils.randFloat(200, 300),
      pos,
      rotation
    );
  }
}

function buildCloud(size, height, pos, rotationY) {
  const tuft1 = new THREE.SphereGeometry(1.5 * size, 7, 8);
  tuft1.translate(-2.0 * size + pos.x, height, pos.z);

  const tuft2 = new THREE.SphereGeometry(1.5 * size, 7, 8);
  tuft2.translate(2.0 * size + pos.x, height, pos.z);

  const tuft3 = new THREE.SphereGeometry(2.0 * size, 7, 8);
  tuft3.translate(0 + pos.x, height, pos.z);
  let geo = BufferGeometryUtils.mergeBufferGeometries([tuft1, tuft2, tuft3]);

  var verts = geo.attributes.position.array;
  var per = 1;
  var bottom = height - 10;
  for (var i = 0; i < verts.length; i += 3) {
    verts[i + 1] = Math.max(verts[i + 1], bottom);
  }
  geo.rotateY(rotationY);
  geo.attributes.position.needsUpdate = true;
  geo.computeVertexNormals();

  // geo.toNonIndexed();

  let cloud = new THREE.Mesh(
    geo,
    // new THREE.MeshLambertMaterial({
    //   color: "white",
    //   flatShading: true,
    //   side: THREE.FrontSide,
    // })
    new THREE.MeshToonMaterial({ color: new THREE.Color("white") })
  );
  clouds.push(cloud);
  geos.push(geo);
  bobbing.push(THREE.MathUtils.randFloatSpread(5, 10))
  cloud.layers.enable(1);
  SCENEDATA.scene.add(cloud);
}

export function makeRain() {
  const map = new THREE.TextureLoader().load("public/models/raindrop2.png");

  raining = Math.random() <= 0.5;
  for (let i = 0; i < clouds.length; i++) {
    let cloudposition = cloudPos[i];
    for (let j = 0; j < 5; j++) {
      let rainDropPos = new THREE.Vector3(
        cloudposition.x,
        cloudposition.y,
        cloudposition.z
      );
      rainDropPos.x = cloudposition.x + THREE.MathUtils.randFloat(0, 10);
      rainDropPos.z = cloudposition.z + THREE.MathUtils.randFloat(0, 10);

      const material = new THREE.SpriteMaterial({ map: map });
      let particle = new THREE.Sprite(material);
      particle.scale.set(5, 5, 5);
      particle.position.set(rainDropPos.x, rainDropPos.y, rainDropPos.z);
      rainDrops.push(particle);
      particle.position.y = -100;
      SCENEDATA.scene.add(particle);
      rainDropPoses.push(rainDropPos);
      rainDropSpeeds.push(THREE.MathUtils.randFloat(1, 3));
    }
  }
}

export function updateRain() {}

export function updateClouds(elapsed) {
  for (let i = 0; i < clouds.length; i++) {
    let cloud = clouds[i];
    cloud.translateY(0.09 * Math.sin(elapsed / bobbing[i]));
  }
}

export function updateWeather() {
  console.log(raining);
  if (raining) {
    raining = Math.random() <= 0.9993;
  } else {
    raining = Math.random() <= 0.0007;
  }
  if (raining) {
    for (let i = 0; i < rainDrops.length; i++) {
      var rainDrop = rainDrops[i];

      if (rainDrop.position.y < -20) {
        rainDrop.position.y = rainDropPoses[i].y - 10;
      }

      rainDrop.position.y = rainDrop.position.y - rainDropSpeeds[i];
    }
  } else {
    for (let i = 0; i < rainDrops.length; i++) {
      var rainDrop = rainDrops[i];

      if (rainDrop.position.y > -100) {
        rainDrop.position.y = rainDrop.position.y - rainDropSpeeds[i];
      } else {
      }
    }
  }
}
