import * as THREE from "three";
import { modifyTerrain } from "./terrain";

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var renderer;
var terrain;
var camera;
var scene;

export function setupEvents(
  renderer_main,
  terrain_main,
  camera_main,
  scene_main
) {
  renderer = renderer_main;
  terrain = terrain_main;
  camera = camera_main;
  scene = scene_main;

  terrain.callback = function (intersect) {
    console.log("clicked the plane!");
    modifyTerrain(intersect.object, intersect, scene);
  };
  renderer.domElement.addEventListener(
    "pointerdown",
    onDocumentPointerDown,
    false
  );
}

function onDocumentPointerDown(event) {
  console.log("raycast!!");
  event.preventDefault();

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObject(terrain);
  // console.log(intersects);

  if (intersects.length > 0) {
    console.log("INTERSECT FOUND!");
    console.log(intersects);
    intersects[0].object.callback(intersects[0]);
  } else {
    console.log("no intersect found...");
  }
  // console.log(intersects);
}
