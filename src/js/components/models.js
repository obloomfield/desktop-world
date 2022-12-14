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

export var lampParam = new (function () {
  this.lampOn = true;
})();

export function updateButton() {
  if (lampParam.lampOn) {
    SCENEDATA.get("button").translateY(-10);
    SCENEDATA.get("lightCone").visible = true;
    SCENEDATA.get("spotlight").intensity = 1.0;
  } else {
    SCENEDATA.get("button").translateY(10);
    SCENEDATA.get("lightCone").visible = false;
    SCENEDATA.get("spotlight").intensity = 0.2;
  }
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

  const desk = await loadObj(
    "public/models/toonDesk.mtl",
    "public/models/toonDesk.obj"
  );
  const deskObj = desk[0];
  console.log(deskObj);

  deskObj.scale.set(5000, 5000, 5000);
  deskObj.translateY(-2400);
  deskObj.translateZ(-1000);
  deskObj.translateX(1000);
  deskObj.castShadow = true;

  // const desk = await load_model("public/models/simple_dirty_desk.glb", "desk");
  // desk.scale.set(2000,2000,2000);
  // desk.position.y = -2100; //.translate(0,-500,0);
  SCENEDATA.add("desk", deskObj);

  // const lamp = await load_model("public/models/desk_lamp.glb", "lamp");
  // lamp.scale.set(650,650,650);
  // lamp.position.y = -500;
  // lamp.position.x = 800;
  // lamp.rotation.y = -Math.PI;
  const lamp = await loadObj(
    "public/models/toonLamp.mtl",
    "public/models/toonLamp.obj"
  );
  const lampObj = lamp[0];
  console.log(lampObj);
  lampObj.scale.set(2500, 2500, 2500);

  lampObj.rotateY(Math.PI / 4);

  lampObj.translateX(-10300);
  lampObj.translateY(-2450);
  lampObj.translateZ(-600);
  // lampObj.translateZ(3000);

  SCENEDATA.add("lamp", lampObj);

  const corkModels = await loadObj(
    "public/models/flask.mtl",
    "public/models/flask.obj"
  );
  const cork = corkModels[0];
  cork.scale.set(100, 100, 100);
  cork.translateY(450);
  cork.translateX(300);
  cork.rotateZ(-Math.PI / 5);
  SCENEDATA.add("cork", cork);

  const buttonChamfergeometry = new THREE.TorusGeometry(50, 15, 3, 100);
  const buttonChamfermaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
  });
  const buttonChamferTorus = new THREE.Mesh(
    buttonChamfergeometry,
    buttonChamfermaterial
  );
  buttonChamferTorus.translateX(-1620);
  buttonChamferTorus.translateY(-395);
  buttonChamferTorus.translateZ(-110);
  buttonChamferTorus.rotateX(Math.PI / 2);
  SCENEDATA.add("buttonChamfer", buttonChamferTorus);

  const buttonGeometry = new THREE.CylinderGeometry(50, 50, 70, 40);
  const buttonMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff });
  const buttonCylinder = new THREE.Mesh(buttonGeometry, buttonMaterial);
  buttonCylinder.translateX(-1620);
  buttonCylinder.translateY(-400);
  buttonCylinder.translateZ(-110);
  buttonCylinder.layers.enable(1);
  SCENEDATA.add("button", buttonCylinder);

  var buttonLight = new THREE.PointLight({
    color: 0xffffff,
    position: new THREE.Vector3(-1620, -410, -110),
    distance: 0.1,
    decay: 10.0,
  });

  //SCENEDATA.add("buttonLight", buttonLight);

  const lGeometry = new THREE.BoxGeometry(500, 6000, 6000);
  const lMaterial = new THREE.MeshStandardMaterial({ color: 0xbea7b9 });
  const lWall = new THREE.Mesh(lGeometry, lMaterial);
  lWall.translateX(3000);
  lWall.translateY(600);
  SCENEDATA.add("lWall", lWall);

  const rGeometry = new THREE.BoxGeometry(6000, 6000, 500);
  const rMaterial = new THREE.MeshStandardMaterial({ color: 0xa2acc3 });
  const rWall = new THREE.Mesh(rGeometry, rMaterial);
  rWall.translateZ(3000);
  rWall.translateY(600);

  SCENEDATA.add("rWall", rWall);

  const floorGeometry = new THREE.BoxGeometry(6000, 500, 6000);

  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xc3ada2 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);

  floor.translateY(-2400);
  floor.receiveShadow = true;
  SCENEDATA.add("floor", floor);

  const floorBox = new THREE.BoxGeometry();

  const lightCone = new THREE.ConeGeometry(
    1600,
    3800,
    500,
    100,
    true,
    0,
    2 * Math.PI
  );

  var bottom = 1400;
  var verts = lightCone.attributes.position.array;
  for (var i = 0; i < verts.length; i += 3) {
    verts[i + 1] = Math.min(verts[i + 1], bottom);
  }

  const material = new THREE.MeshStandardMaterial({
    color: "white",
    opacity: 0.1,
    transparent: true,
    wireframe: false,
    emissiveIntensity: 0,
  });

  // var axesHelper = new THREE.AxesHelper( 5 );
  // scene.add( axesHelper );
  const alphaloader = new THREE.TextureLoader();
  const material2 = new THREE.MeshBasicMaterial({
    color: "white",
    opacity: 0.2,
    transparent: true,
    wireframe: false,
    emissiveIntensity: 0,
    alphaMap: alphaloader.load("/public/models/alphalightcone.png"),
  });

  let o = new THREE.Mesh(lightCone, material2);
  o.translateX(-0);
  o.translateY(170);
  o.translateZ(-100);
  o.rotateZ(Math.PI / 2.7);

  o.layers.enable(1);

  SCENEDATA.add("lightCone", o);

  const waterGeometry = new THREE.SphereGeometry(
    550,
    100,
    100,
    0,
    2 * Math.PI,
    0,
    Math.PI
  );
  let o2 = new THREE.Mesh(waterGeometry, material);

  o2.layers.enable(1);
  o.layers.enable(1);
  SCENEDATA.scene.add(o2);
}
