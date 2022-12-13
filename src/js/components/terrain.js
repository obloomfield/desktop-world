import * as THREE from "three";
import { perlin, perlinParams } from "./perlin";

import { SCENEDATA } from "../setup";
import { circle_constraint_material } from "./shader";

function falloff(point, rad) {
  let x = point.length() / rad;
  return -Math.pow(x, 10) + 1;
}

export var terrainParams = new (function () {
  this.PEAK = 100;
  this.RAD = 400;
  this.ORIGIN = new THREE.Vector2(0, 0);
  this.FLAT_SHADING = true;
  this.SHOW_INTERSECTION = true;
})();

export function addTerrain() {
  var geometry = new THREE.PlaneGeometry(1000, 1000, 20, 20);
  // var material = new THREE.MeshStandardMaterial({
  //   color: 0x00ff00,
  //   side: THREE.Side,
  // });
  var terrain = new THREE.Mesh(
    geometry,
    // new THREE.MeshToonMaterial({
    //   color: new THREE.Color("green"),
    // })
    circle_constraint_material(new THREE.Vector4(0, 1, 0, 1))
  );

  if (terrainParams.FLAT_SHADING) {
    terrain.geometry = terrain.geometry.toNonIndexed();
  }
  terrain.rotation.x = -Math.PI / 2;
   terrain.layers.enable(1);
  SCENEDATA.add("terrain", terrain);
}

export function updateTerrain() {
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
      //falloff(pt, terrainParams.RAD) *
      perlin(perlinParams, verts[i], verts[i + 1]);
  }
  terrain.geometry.attributes.position.needsUpdate = true;

  // no way back from flat shading !! loss of info !!
  terrain.geometry.computeVertexNormals();
}

var intersect_cubes = [];
export function modifyTerrain(terrain, intersect, scene) {
  var verts = terrain.geometry.attributes.position.array;

  if (terrainParams.SHOW_INTERSECTION) {
    var cube = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ color: 0xff00000 })
    );
    cube.position.set(intersect.point.x, intersect.point.y, intersect.point.z);
    scene.add(cube);
    intersect_cubes.push(cube);
  } else {
    intersect_cubes.forEach((cube) => scene.remove(cube));
  }
  const i = intersect.faceIndex * 3;
  console.log(i);

  verts[i + 2] += 10;
  console.log(intersect.index);
  console.log(terrain.geometry);

  // console.log(terrain.geometry.vertices[intersect.index]);
}
