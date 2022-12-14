import * as THREE from "three";
import { bloomParam } from "./components/bloom";
import { lampParam, updateButton } from "./components/models";
import { modifyTerrain } from "./components/terrain";
import { SCENEDATA } from "./setup";

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var event_cnt = 0;
export var eventParams = new (function () {
  this.MOUSE_CAST_FREQUENCY = 20;
})();

export function setupEvents() {
  // SCENEDATA.get("terrain").callback = function (intersect) {
  //   console.log("clicked the plane!");
  //   modifyTerrain(intersect.object, intersect, SCENEDATA.scene);
  // };
  SCENEDATA.get("water_top").callback = function (intersect) {
    console.log("clicked the water!");
    modifyTerrain(intersect.object, intersect, SCENEDATA.scene);
  };
  SCENEDATA.get("button").callback = function () {
    lampParam.lampOn = !lampParam.lampOn;
    bloomParam.bloomEnabled = !bloomParam.bloomEnabled;
    updateButton();
  };

  SCENEDATA.renderer.domElement.addEventListener(
    "pointerdown",
    onDocumentPointerDown,
    false
  );
  SCENEDATA.renderer.domElement.addEventListener(
    "mousemove",
    onDocumentMouseMove,
    false
  );
}

function onDocumentPointerDown(event) {
  event.preventDefault();

  mouse.x = (event.clientX / SCENEDATA.renderer.domElement.clientWidth) * 2 - 1;
  mouse.y =
    -(event.clientY / SCENEDATA.renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, SCENEDATA.camera);

  // var intersect_terrain = raycaster.intersectObject(SCENEDATA.get("terrain"));
  // // console.log(intersects);

  // if (intersect_terrain.length > 0) {
  //   console.log("INTERSECT FOUND!");
  //   console.log(intersect_terrain);
  //   intersect_terrain[0].object.callback(intersect_terrain[0]);
  // } else {
  //   console.log("no intersect found...");
  // }

  var intersect_water = raycaster.intersectObject(SCENEDATA.get("water_top"));
  // console.log(intersects);

  if (intersect_water.length > 0) {
    console.log("INTERSECT FOUND!");
    console.log(intersect_water);
    intersect_water[0].object.callback(intersect_water[0]);
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

function onDocumentMouseMove(event) {
  // console.log(event_cnt);
  event.preventDefault();
  event_cnt++;
  if (event_cnt % eventParams.MOUSE_CAST_FREQUENCY !== 0) return;
  console.log("raycast of terrain!!");

  mouse.x = (event.clientX / SCENEDATA.renderer.domElement.clientWidth) * 2 - 1;
  mouse.y =
    -(event.clientY / SCENEDATA.renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, SCENEDATA.camera);

  // var intersect_terrain = raycaster.intersectObject(SCENEDATA.get("terrain"));
  // // console.log(intersects);

  // if (intersect_terrain.length > 0) {
  //   console.log("INTERSECT FOUND!");
  //   console.log(intersect_terrain);
  //   intersect_terrain[0].object.callback(intersect_terrain[0]);
  // } else {
  //   console.log("no intersect found...");
  // }
  var intersect_water = raycaster.intersectObject(SCENEDATA.get("water_top"));
  // console.log(intersects);

  if (intersect_water.length > 0) {
    console.log("INTERSECT FOUND!");
    console.log(intersect_water);
    intersect_water[0].object.callback(intersect_water[0]);
  } else {
    console.log("no intersect found...");
  }
}
