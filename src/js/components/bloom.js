import * as THREE from "three";


import { SCENEDATA } from "../setup";

export var bloomParam = {
  bloomEnabled: false
}

export function renderBloom() {
  // renderer.render( scene, camera );
  traverseBloom();
  SCENEDATA.finalComposer.render();
  

}

function traverseBloom() {
  SCENEDATA.scene.traverse( darkenNonBloomed );
  SCENEDATA.bloomComposer.render();
  SCENEDATA.scene.traverse( restoreMaterial );

//   camera.layers.set(1); //bloom
//   bloomComposer.render();
//   camera.layers.set(0); //eniter scene

}
function darkenNonBloomed( obj ) {
  
  if ( obj.isMesh && SCENEDATA.bloomLayer.test( obj.layers ) ) {
    console.log("bloooom");
    SCENEDATA.materials[ obj.uuid ] = obj.material;
    obj.material = new THREE.MeshStandardMaterial({color: "black"});

  }

}

function restoreMaterial( obj ) {

  if ( SCENEDATA.materials[ obj.uuid ] ) {

    obj.material = SCENEDATA.materials[ obj.uuid ];
    delete SCENEDATA.materials[ obj.uuid ];

  }

}
