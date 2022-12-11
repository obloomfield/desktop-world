import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { SCENEDATA } from "../setup";

const loader = new GLTFLoader();

function load_model(model_filepath, model_name) {
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
      SCENEDATA.add(model_name, gltf.scene);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.log(error);
    }
  );
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

export function addModels() {
  load_model("public/models/simple_dirty_desk.glb", "desk");
  load_model("public/models/desk_lamp.glb", "lamp");
}
