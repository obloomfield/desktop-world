import * as THREE from "three";
import { bloomParam, renderBloom } from "./components/bloom";
import { updateClouds, updateWeather } from "./components/clouds";
import { updateColors } from "./components/colors";
import { updateIslands } from "./components/island";
import { updateSun } from "./components/lighting";
import { lampParam, updateButton } from "./components/models";
import { updateParticles } from "./components/particles";
import { updateParticleSystem } from "./components/particleSystem";
import { perlinParams } from "./components/perlin";
import { terrainParams, updateTerrain } from "./components/terrain";
import { stats } from "./components/ui";
import { updateWater2 } from "./components/water";
import { SCENEDATA } from "./setup";

var clock = new THREE.Clock();
var times = [0, Math.PI / 3, -Math.PI / 4, Math.PI / 6, Math.PI / 5];

var i = 0;

var buttonState = false;

var oldPeak = terrainParams.PEAK;
var oldLac = perlinParams.LACUNARITY;

function update() {
  var delta = clock.getDelta();
  var elapsed = clock.elapsedTime;
  // terrain.position.z += SPEED * delta;
  // camera.position.z += SPEED * delta;
  /* Moving the terrain forward. */

  // if (buttonState != lampParam.lampOn) {
  //   updateButton();
  //   buttonState = lampParam.lampOn
  // }

  updateParticleSystem(delta);

  // updateSun();

  // updateParticles(elapsed);
  SCENEDATA.boidHandler.updateBoids(delta, elapsed);

  if (oldPeak != terrainParams.PEAK) {
    oldPeak = terrainParams.PEAK;
    updateTerrain();
  }

  // updateIslands();
  updateClouds(elapsed);
  updateWeather();
  // updateWater(water, sun_pivot.position);
  updateWater2(elapsed);
  updateColors();
  i++;
}

function render() {
  SCENEDATA.controls.update();
  if (bloomParam.bloomEnabled) {
    renderBloom();
  } else {
    SCENEDATA.renderer.render(SCENEDATA.scene, SCENEDATA.camera);
  }
}

export function loop() {
  stats.begin();
  update();
  render();
  stats.end();
  requestAnimationFrame(loop);
}
