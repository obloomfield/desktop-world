import { Vector2 } from "three";
import { perlin, perlinParams } from "./perlin";

function falloff(point, rad) {
  let x = point.length() / rad;
  return -Math.pow(x, 10) + 1;
}

export var terrainParams = new (function () {
  this.PEAK = 150;
  this.RAD = 400;
  this.ORIGIN = new Vector2(0, 0);
  this.FLAT_SHADING = true;
})();

export function updateTerrain(terrain) {
  var verts = terrain.geometry.attributes.position.array;
  for (var i = 0; i <= verts.length; i += 3) {
    let pt = new Vector2(verts[i], verts[i + 1]);
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
