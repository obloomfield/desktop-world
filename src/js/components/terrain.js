import * as THREE from "three";
import { perlin, perlinParams } from "./perlin.js";

import { SCENEDATA } from "../setup.js";
import { circle_constraint_material } from "./shader.js";

export const DAY_TEXTURE = new THREE.TextureLoader().load(
  "/models/daytime2.png"
);
export const NIGHT_TEXTURE = new THREE.TextureLoader().load(
  "/models/nightime2.png"
);

function falloff(point, rad) {
  let x = point.length() / rad;
  return -Math.pow(x, 10) + 1;
}

export var terrainParams = new (function () {
  this.RAD = 499.5;
  this.PEAK = 350;
  this.ORIGIN = new THREE.Vector2(0, 0);
  this.FLAT_SHADING = true;
  this.SHOW_INTERSECTION = false;
})();

export function addTerrain() {
  var geometry = new THREE.PlaneGeometry(1000, 1000, 128, 128);
  // var material = new THREE.MeshStandardMaterial({
  //   color: 0x00ff00,
  //   side: THREE.Side,
  // });
  var terrain = new THREE.Mesh(
    geometry,
    // new THREE.MeshToonMaterial({
    //   color: new THREE.Color("green"),
    // })
    circle_constraint_material(new THREE.Color("green"), true)
  );

  if (terrainParams.FLAT_SHADING) {
    // terrain.geometry = terrain.geometry.toNonIndexed();
  }
  terrain.rotation.x = -Math.PI / 2;
  terrain.layers.enable(1);
  SCENEDATA.addObstacle("terrain", terrain);
}

function sampleTreesTerrrain(geometry, prob) {
  const norms = geometry.attributes.normal.array;
  const verts = geometry.attributes.position.array;
  const vert = [0, 0, 1];
  const locs = [];
  for (var i = 0; i < norms.length; i += 3) {
    const vec = new THREE.Vector3(verts[i], verts[i + 1], verts[i + 2]);
    if (
      vec.length() < terrainParams.RAD &&
      norms[i + 2] > 0.8 &&
      verts[i + 2] > 30 &&
      verts[i + 2] < 250
    ) {
      if (Math.random() > prob) {
        locs.push(i);
      }
    }
  }
  return locs;
}

export function sampleTreesTerrain(terrain) {
  // var terrain = SCENEDATA.get("terrain");
  var positions = terrain.geometry.attributes.position.array;
  const treeLocs = sampleTreesTerrrain(terrain.geometry, 0.8);
  // const treeLoaded =  //await loadObj("../models/lowPolyTree.mtl", "../models/lowPolyTree.obj");
  const tree = SCENEDATA.treeObj; // treeLoaded[0];
  const rotAxis = new THREE.Vector3(0, 1, 0);
  // newTree.scale.set(scale, scale, scale);

  // console.log("Sampling trees!");

  for (let i = 0; i < treeLocs.length; i++) {
    const idx = treeLocs[i];
    const dir = new THREE.Vector3(
      positions[idx],
      positions[idx + 1],
      positions[idx + 2]
    );
    const newTree = new THREE.Object3D();
    newTree.copy(tree);
    dir.applyAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    const len = dir.length();
    newTree.translateOnAxis(dir.normalize(), len);
    newTree.rotateOnAxis(rotAxis, THREE.MathUtils.randFloat(0, 2 * Math.PI));
    const scale = THREE.MathUtils.randFloat(1, 3);
    newTree.scale.set(scale, scale, scale);

    const treeLabel = ["terrainTree-", i].join("");
    if (SCENEDATA.objects.has(treeLabel)) {
      SCENEDATA.scene.remove(SCENEDATA.get(treeLabel));
      SCENEDATA.add(treeLabel, newTree);
    } else {
      SCENEDATA.add(treeLabel, newTree);
    }
  }
}

export function updateTerrain() {
  if (!SCENEDATA.updateTerrain) {
    return;
  }
  var terrain = SCENEDATA.get("terrain");
  var verts = terrain.geometry.attributes.position.array;
  for (var i = 0; i <= verts.length; i += 3) {
    let pt = new THREE.Vector2(verts[i], verts[i + 1]);
    let pt_len = pt.length();
    let r = pt.addScaledVector(terrainParams.ORIGIN, -1);
    // if (terrainParams.ORIGIN.distanceTo(pt) > terrainParams.RAD) {
    //   verts[i] *= terrainParams.RAD / pt_len;
    //   verts[i +z 1] *= terrainParams.RAD / pt_len;
    //   verts[i + 2] = 0;
    // }
    verts[i + 2] =
      terrainParams.PEAK *
      //(300 / (r.length() + 50)) *
      falloff(pt, terrainParams.RAD) *
      perlin(perlinParams, verts[i], verts[i + 1]);
  }
  terrain.geometry.attributes.position.needsUpdate = true;
  // terrain.geometry.attributes.normal.needsUpdate = true;

  // no way back from flat shading !! loss of info !!
  terrain.geometry.computeVertexNormals();
  sampleTreesTerrain(terrain);
  SCENEDATA.updateTerrain = false;
}

var intersect_cubes = [];
export function modifyTerrain(terrain, intersect, scene) {
  // var verts = terrain.geometry.attributes.position.array;

  let x = intersect.point.x;
  let z = intersect.point.z;
  let y =
    Math.sqrt(Math.abs(Math.pow(terrainParams.RAD, 2) - x * x - z * z)) / 2;
  const target = new THREE.Vector3(x, y, z);
  SCENEDATA.boidHandler.updateTarget(target);

  if (terrainParams.SHOW_INTERSECTION) {
    var cube = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ color: 0xff00000 })
    );

    cube.position.set(x, y, z);
    scene.add(cube);
    intersect_cubes.push(cube);
  } else {
    intersect_cubes.forEach((cube) => scene.remove(cube));
  }

  // const i = intersect.faceIndex * 3;
  // console.log(i);

  // verts[i + 2] += 10;
  // console.log(intersect.index);
  // console.log(terrain.geometry);

  // console.log(terrain.geometry.vertices[intersect.index]);
}
