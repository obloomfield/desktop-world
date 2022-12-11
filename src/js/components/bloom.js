import * as THREE from "three";


import { SCENEDATA } from "../setup";



export function renderBloom() {
  // renderer.render( scene, camera );
  traverseBloom();
  SCENEDATA.finalComposer.render();

}

function traverseBloom() {
  SCENEDATA.scene.traverse( darkenNonBloomed );
  SCENEDATA.bloomComposer.render();
  SCENEDATA.scene.traverse( restoreMaterial );

  // camera.layers.set( BLOOM_SCENE );
  // bloomComposer.render();
  // camera.layers.set( ENTIRE_SCENE );

}
function darkenNonBloomed( obj ) {
  console.log(SCENEDATA.bloomLayer);
  if ( obj.isMesh && SCENEDATA.bloomLayer.test( obj.layers ) === false ) {

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
