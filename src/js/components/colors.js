
import * as THREE from "three";
import { lampParam } from "./models";
import { SCENEDATA } from "../setup";


export const STANDARD_PALLETE  = {
    water: new THREE.Color(0x2794CF), //baby blueish
    terrain: new THREE.Color(0x81C69B), //pastel green
    rock: new THREE.Color(0xC9C4C3), //grey
    trees: new THREE.Color(0xCC9C4C3) //tree green

    
}
export const BLOOM_PALLETE  = {
    water: new THREE.Color(0x001eff), //cyan
    terrain: new THREE.Color(0x00ff9f), //cyber green
    rock: new THREE.Color(0xC9C4C3), //grey
    trees: new THREE.Color(0xbd00ff) //purple 
}

export function updateColors() {
    if (lampParam.lampOn) {
        SCENEDATA.get("water_top").material.uniforms.COLOR.value = STANDARD_PALLETE.water;
        SCENEDATA.get("terrain").material.uniforms.COLOR.value = STANDARD_PALLETE.terrain;
        


    }
    else {
        SCENEDATA.get("water_top").material.uniforms.COLOR.value = BLOOM_PALLETE.trees;
        SCENEDATA.get("terrain").material.uniforms.COLOR.value = BLOOM_PALLETE.terrain;
    }
    

}