import * as THREE from "three";

export function addSky() {
  var back = new THREE.SphereGeometry(
    500,
    100,
    100,
    0,
    2 * Math.PI,
    0,
    Math.PI
  );
  let m = new THREE.MeshStandardMaterial({
    color: "pink",
    roughness: 1.0,
  });
  m.side = THREE.BackSide;
  let o = new THREE.Mesh(back, m);
   //o.layers.enable(1);
  //SCENEDATA.add("sky", o);

  


    
}
