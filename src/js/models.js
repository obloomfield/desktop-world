import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const loader = new GLTFLoader();

function load_model(model_filepath, scene) {
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
      scene.add(gltf.scene);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.log(error);
    }
  );
}

export function addModels(scene) {
  load_model("public/models/simple_dirty_desk.glb", scene);
  load_model("public/models/desk_lamp.glb", scene);
}
