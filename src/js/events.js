import * as THREE from "three";
import { modifyTerrain } from "./components/terrain";
import { SCENEDATA } from "./setup";

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

export function setupEvents() {
  SCENEDATA.get("terrain").callback = function (intersect) {
    console.log("clicked the plane!");
    modifyTerrain(intersect.object, intersect, SCENEDATA.scene);
  };
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

  var intersects = raycaster.intersectObject(SCENEDATA.get("terrain"));
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
