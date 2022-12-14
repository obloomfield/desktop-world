import * as THREE from "three";
import { SCENEDATA } from "../setup";
import { lampParam } from "./models";
import { DAY_TEXTURE, NIGHT_TEXTURE } from "./terrain";

export const STANDARD_PALLETE = {
  water: new THREE.Color(0x2794cf), //baby blueish
  terrain: new THREE.Color(0x81c69b), //pastel green
  rock: new THREE.Color(0xc9c4c3), //grey
  trees: new THREE.Color(0x066537), //tree green
};
export const BLOOM_PALLETE = {
  water: new THREE.Color(0x48937a), //cyan
  terrain: new THREE.Color(0x00ff9f), //cyber green
  rock: new THREE.Color(0x3e4466), //grey #5d5473 #3e4466
  trees: new THREE.Color(0xbd00ff), //purple
};

export function updateColors() {
  if (lampParam.lampOn) {
    SCENEDATA.get("water_top").material.uniforms.COLOR.value =
      STANDARD_PALLETE.water;
    SCENEDATA.get("water_bowl").material.color.setHex(
      STANDARD_PALLETE.water.getHex()
    );
    SCENEDATA.get("water_bowl").material.emissive.setHex(
      STANDARD_PALLETE.water.getHex()
    );
    SCENEDATA.get("terrain").material.uniforms.terrainTexture.value =
      DAY_TEXTURE;

    SCENEDATA.get("island-terrain-0").material.uniforms.uGreen.value =
      STANDARD_PALLETE.trees;
    SCENEDATA.get("island-terrain-0").material.uniforms.uBlue.value =
      STANDARD_PALLETE.rock;
    SCENEDATA.get("island-terrain-1").material.uniforms.uGreen.value =
      STANDARD_PALLETE.trees;
    SCENEDATA.get("island-terrain-1").material.uniforms.uBlue.value =
      STANDARD_PALLETE.rock;
  } else {
    SCENEDATA.get("water_top").material.uniforms.COLOR.value =
      BLOOM_PALLETE.trees;
    SCENEDATA.get("water_bowl").material.color.setHex(
      BLOOM_PALLETE.trees.getHex()
    );
    SCENEDATA.get("water_bowl").material.emissive.setHex(
      BLOOM_PALLETE.trees.getHex()
    );
    SCENEDATA.get("terrain").material.uniforms.terrainTexture.value =
      NIGHT_TEXTURE;
    SCENEDATA.get("island-terrain-0").material.uniforms.uGreen.value =
      BLOOM_PALLETE.water;
    SCENEDATA.get("island-terrain-0").material.uniforms.uBlue.value =
      BLOOM_PALLETE.rock;
    SCENEDATA.get("island-terrain-1").material.uniforms.uGreen.value =
      BLOOM_PALLETE.water;
    SCENEDATA.get("island-terrain-1").material.uniforms.uBlue.value =
      BLOOM_PALLETE.rock;
  }
}
