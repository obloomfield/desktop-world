import * as THREE from "three";
import { TetrahedronGeometry } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { SCENEDATA } from "../setup";

const loader = new GLTFLoader();

function load_model(model_filepath, model_name) {
  return new Promise((resolve, reject) => {
    loader.load(
      model_filepath,
      function (gltf) {
        // gltf.scene.traverse(function (child) {
        //     if ((child as THREE.Mesh).isMesh) {
        //         const m = (child as THREE.Mesh)
        //         m.receiveShadow = true
        //         m.castShadow = true
        //     }
        //     if (((child as THREE.Light)).isLight) {
        //         const l = (child as THREE.Light)
        //         l.castShadow = true
        //         l.shadow.bias = -.003
        //         l.shadow.mapSize.width = 2048
        //         l.shadow.mapSize.height = 2048
        //     }
        // })
        resolve(gltf.scene); //.scale.set(1000,1000,1000);
        // SCENEDATA.add(model_name, gltf.scene);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log(error);
      }
    );
  });
  
}

export function loadObj(matFile, objFile) {
  return new Promise((resolve, reject) => {
    var matLoader = new MTLLoader();
    matLoader.load(matFile, function (materials) {
      console.log("MATERIALS", materials);
      materials.preload();

      var loader = new OBJLoader();
      loader.setMaterials(materials);
      const objs = [];
      loader.load(objFile, function (object) {
        objs.push(object);
        resolve(objs);
      });
    });
  });
}

export async function addModels() {
  //const desk = await load_model("public/models/simple_dirty_desk.glb", "desk");
  //desk.scale.set(2000,2000,2000);
  //desk.position.y = -2100; //.translate(0,-500,0);
  //desk.layers.enable(1);
  //SCENEDATA.add("desk", desk);
  
  //const lamp = await load_model("public/models/desk_lamp.glb", "lamp");
  //lamp.scale.set(650,650,650);
  //lamp.position.y = -500;
  //lamp.position.x = 800;
  // lamp.rotation.y = -Math.PI;
  // SCENEDATA.add("lamp", lamp);
  
  const desk = await loadObj("public/models/toonDesk.mtl", "public/models/toonDesk.obj");
  const deskObj = desk[0];
  console.log(deskObj);

  deskObj.scale.set(5000,5000,5000);
  deskObj.translateY(-2400);
  deskObj.translateZ(-1000);
  deskObj.translateX(1000);

  // const desk = await load_model("public/models/simple_dirty_desk.glb", "desk");
  // desk.scale.set(2000,2000,2000);
  // desk.position.y = -2100; //.translate(0,-500,0);
  SCENEDATA.add("desk", deskObj);

  // const lamp = await load_model("public/models/desk_lamp.glb", "lamp");
  // lamp.scale.set(650,650,650);
  // lamp.position.y = -500;
  // lamp.position.x = 800;
  // lamp.rotation.y = -Math.PI;
  const lamp = await loadObj("public/models/toonLamp.mtl", "public/models/toonLamp.obj");
  const lampObj = lamp[0];
  console.log(lampObj);
  lampObj.scale.set(2500,2500,2500);

  lampObj.rotateY(Math.PI/4);
  
  lampObj.translateX(-10300);
  lampObj.translateY(-2450);
  lampObj.translateZ(-600);
  // lampObj.translateZ(3000);

  SCENEDATA.add("lamp", lampObj);

  const lGeometry = new THREE.BoxGeometry( 50, 8000, 10000 );
  const lMaterial = new THREE.MeshStandardMaterial( {color: 0x453341} );
  const lWall = new THREE.Mesh( lGeometry, lMaterial );
  lWall.translateX(5000);
  lWall.translateY(1600);
  SCENEDATA.add("lWall", lWall);

  const rGeometry = new THREE.BoxGeometry( 10000, 8000, 50 );
  const rMaterial = new THREE.MeshStandardMaterial( {color: 0x2d3547} );
  const rWall = new THREE.Mesh( rGeometry, rMaterial );
  rWall.translateZ(5000);
  rWall.translateY(1600);

  SCENEDATA.add("rWall", rWall);

  const floorGeometry = new THREE.BoxGeometry( 10000, 50, 10000 );
  const floorMaterial = new THREE.MeshStandardMaterial( {color: 0x5e483d} );
  const floor = new THREE.Mesh( floorGeometry, floorMaterial );
  floor.translateY(-2400);
  SCENEDATA.add("floor", floor);

  const floorBox = new THREE.BoxGeometry();


  const lightCone = new THREE.ConeGeometry(750, 2000, 500, 100, true, 0, 2 * Math.PI)

  const material = new THREE.MeshStandardMaterial({  
      color: "white",
      opacity: 0.1, 
    transparent: true, 
  wireframe:false,
  emissiveIntensity: 0});

  const material2 = new THREE.MeshBasicMaterial({  
    color: "white",
    opacity: 0.1, 
  transparent: true, 
wireframe:false,
emissiveIntensity: 0});

 

  let o = new THREE.Mesh(lightCone, material2);

  o.translateX(-50);
  o.translateY(50);
  o.rotateZ(Math.PI/6);

  o.layers.enable(1);
  SCENEDATA.scene.add(o)

  const waterGeometry = new THREE.SphereGeometry(
    550,
    100,
    100,
    0,
    2 * Math.PI,
    0,
    Math.PI
  );
  let o2 = new THREE.Mesh(waterGeometry, material)

  o2.layers.enable(1);
  o.layers.enable(1);
  SCENEDATA.scene.add(o2)
  
  

}
