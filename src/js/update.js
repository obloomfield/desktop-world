import * as THREE from "three";
import { updateSun } from "./components/lighting";
import { updateParticles } from "./components/particles";
import { updateTerrain } from "./components/terrain";
import { stats } from "./components/ui";
import { updateWater2 } from "./components/water";
import { SCENEDATA } from "./setup";

var clock = new THREE.Clock();

var i = 0;
function update() {
  var delta = clock.getDelta();
  var elapsed = clock.elapsedTime;
  // terrain.position.z += SPEED * delta;
  // camera.position.z += SPEED * delta;
  /* Moving the terrain forward. */
  updateSun();

  updateParticles(elapsed, SCENEDATA.scene);
  updateTerrain(SCENEDATA.terrain);
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
