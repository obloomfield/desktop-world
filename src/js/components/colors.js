import * as THREE from "three";
import { lampParam } from "./models";
import { SCENEDATA } from "../setup";
import { DAY_TEXTURE } from "./terrain";
import { NIGHT_TEXTURE } from "./terrain";


export const STANDARD_PALLETE  = {
    water: new THREE.Color(0x2794CF), //baby blueish
    terrain: new THREE.Color(0x81C69B), //pastel green
    rock: new THREE.Color(0xC9C4C3), //grey
    trees: new THREE.Color(0x066537) //tree green

    
}
export const BLOOM_PALLETE  = {
    water: new THREE.Color(0x48937A), //cyan
    terrain: new THREE.Color(0x00ff9f), //cyber green
    rock: new THREE.Color(0xC9C4C3), //grey
    trees: new THREE.Color(0xbd00ff) //purple 
}

export function updateColors() {
    if (lampParam.lampOn) {
        SCENEDATA.get("water_top").material.uniforms.COLOR.value = STANDARD_PALLETE.water;
        SCENEDATA.get("terrain").material.uniforms.terrainTexture.value = DAY_TEXTURE
        SCENEDATA.get("island-terrain-0").material.uniforms.uGreen.value = STANDARD_PALLETE.trees;
        SCENEDATA.get("island-terrain-0").material.uniforms.uBlue.value = STANDARD_PALLETE.rock;
    }
    else {
        SCENEDATA.get("water_top").material.uniforms.COLOR.value = BLOOM_PALLETE.trees;
        SCENEDATA.get("terrain").material.uniforms.terrainTexture.value = NIGHT_TEXTURE;
        SCENEDATA.get("island-terrain-0").material.uniforms.uGreen.value = BLOOM_PALLETE.water;
        SCENEDATA.get("island-terrain-0").material.uniforms.uBlue.value = BLOOM_PALLETE.trees;
    

}
}
    