import * as THREE from "three";
import { updateIslands } from "./components/island";
import { updateSun } from "./components/lighting";
import { updateParticles } from "./components/particles";
import { updateTerrain } from "./components/terrain";
import { stats } from "./components/ui";
import { updateWater2 } from "./components/water";
import { SCENEDATA } from "./setup";

var clock = new THREE.Clock();
var times = [0, Math.PI / 3, -Math.PI / 4, Math.PI / 6, Math.PI / 5];

var i = 0;
function update() {
  var delta = clock.getDelta();
  var elapsed = clock.elapsedTime;
  // terrain.position.z += SPEED * delta;
  // camera.position.z += SPEED * delta;
  /* Moving the terrain forward. */
  updateSun();

  updateParticles(elapsed);
  updateTerrain(SCENEDATA.terrain);

  updateIslands();
  //updateWater(water, sun_pivot.position);
  updateWater2(elapsed);
  i++;
}

function render() {
  SCENEDATA.controls.update();
  SCENEDATA.renderer.render(SCENEDATA.scene, SCENEDATA.camera);
}

export function loop() {
  stats.begin();
  update();
  render();
  stats.end();
  requestAnimationFrame(loop);
}
