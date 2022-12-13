import * as THREE from "three";
import { updateButton } from "./components/models";
import { modifyTerrain } from "./components/terrain";
import { SCENEDATA } from "./setup";
import { lampParam } from "./components/models"
import { bloomParam } from "./components/bloom";

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

export function setupEvents() {
  SCENEDATA.get("terrain").callback = function (intersect) {
    console.log("clicked the plane!");
    modifyTerrain(intersect.object, intersect, SCENEDATA.scene);
  };
  SCENEDATA.get("button").callback = function () {
    lampParam.lampOn = !lampParam.lampOn;
    bloomParam.bloomEnabled = !bloomParam.bloomEnabled;
    updateButton();
  }

  SCENEDATA.renderer.domElement.addEventListener(
    "pointerdown",
    onDocumentPointerDown,
    false
  );
}

function onDocumentPointerDown(event) {
  console.log("raycast!!");
  event.preventDefault();

  mouse.x = (event.clientX / SCENEDATA.renderer.domElement.clientWidth) * 2 - 1;
  mouse.y =
    -(event.clientY / SCENEDATA.renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, SCENEDATA.camera);

  var intersect_terrain = raycaster.intersectObject(SCENEDATA.get("terrain"));
  // console.log(intersects);

  if (intersect_terrain.length > 0) {
    console.log("INTERSECT FOUND!");
    console.log(intersect_terrain);
    intersect_terrain[0].object.callback(intersect_terrain[0]);
  } else {
    console.log("no intersect found...");
  }

  var intersect_button = raycaster.intersectObject(SCENEDATA.get("button"));

  if (intersect_button.length > 0) {
    console.log("BUTTON PRESS");
    intersect_button[0].object.callback();
  }
  // console.log(intersects);
}
