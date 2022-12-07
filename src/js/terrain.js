import * as THREE from "three";
import { perlin, perlinParams } from "./perlin";

function falloff(point, rad) {
  let x = point.length() / rad;
  return -Math.pow(x, 10) + 1;
}

export var terrainParams = new (function () {
  this.PEAK = 150;
  this.RAD = 400;
  this.ORIGIN = new THREE.Vector2(0, 0);
  this.FLAT_SHADING = true;
  this.SHOW_INTERSECTION = true;
})();

export function updateTerrain(terrain) {
  var verts = terrain.geometry.attributes.position.array;
  for (var i = 0; i <= verts.length; i += 3) {
    let pt = new THREE.Vector2(verts[i], verts[i + 1]);
    let pt_len = pt.length();
    let r = pt.addScaledVector(terrainParams.ORIGIN, -1);
    // if (terrainParams.ORIGIN.distanceTo(pt) > terrainParams.RAD) {
    //   verts[i] *= terrainParams.RAD / pt_len;
    //   verts[i + 1] *= terrainParams.RAD / pt_len;
    //   verts[i + 2] = 0;
    // }
    verts[i + 2] =
      terrainParams.PEAK *
      // (300 / (r.length() + 50)) *
      // falloff(pt, terrainParams.RAD) *
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

  console.log(terrain.geometry.vertices[intersect.index]);
}
