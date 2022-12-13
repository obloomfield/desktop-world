import { GUI } from "dat.gui";
import Stats from "stats.js";
import { SCENEDATA } from "../setup";
import { bloomParam } from "./bloom";
import { lightParams, sunParams } from "./lighting";
import { lampParam } from "./models";
import { fireflyParams } from "./particles";
import { perlinParams } from "./perlin";
import { terrainParams } from "./terrain";
import { waterParams } from "./water";

export var stats = new Stats();

export function makeGUI() {
  const gui = new GUI();
  const generalFolder = gui.addFolder("General");
  generalFolder.add(SCENEDATA.controls, "enableZoom");
  // generalFolder.add(terrainParams, "FLAT_SHADING");
  // const centerFolder = gui.addFolder("Center");
  // centerFolder.add(terrainParams.ORIGIN, "x", -50, 50);
  // centerFolder.add(terrainParams.ORIGIN, "y", -50, 50);
  // const sunFolder = gui.addFolder("Sun");
  // sunFolder.add(sunParams, "ORBIT_SPEED", 0.0001, 0.1);
  // sunFolder.add(sunParams.SUN_AXIS, "x", 0, 1);
  // sunFolder.add(sunParams.SUN_AXIS, "y", 0, 1);
  // sunFolder.add(sunParams.SUN_AXIS, "z", 0, 1);
  // lightFolder.add(lightParams, "HEMI_LIGHT_INTENSITY", 0, 1);
  const terrainFolder = gui.addFolder("Terrain");
  terrainFolder.add(terrainParams, "PEAK", 0, 500);
  terrainFolder.add(terrainParams, "RAD", 200, 1000);
  terrainFolder.add(terrainParams, "SHOW_INTERSECTION");
  const perlinFolder = gui.addFolder("Perlin");
  perlinFolder.add(perlinParams, "OCTAVECNT", 1, 10);
  perlinFolder.add(perlinParams, "LACUNARITY", 1, 10);
  perlinFolder.add(perlinParams, "PERSISTANCE", 0, 1);
  perlinFolder.add(perlinParams, "SMOOTHING", 1, 1000);
  const particleFolder = gui.addFolder("Particles");
  particleFolder.add(fireflyParams, "SPREAD", 1, 50);
  particleFolder.add(fireflyParams, "NUMCLUSTERS", 1, 5);
  const waterFolder = gui.addFolder("Water");
  waterFolder.add(waterParams, "FREQUENCY", 1, 100);
  waterFolder.add(waterParams, "AMPLITUDE", 1, 100);
  waterFolder.add(waterParams, "PHASE", 1, 100);

  const bloomFolder = gui.addFolder("Bloom");
  bloomFolder.add(bloomParam, "bloomEnabled");

  // const buttonFolder = gui.addFolder("Lamp");
  // buttonFolder.add(lampParam, "lampOn");
}

export function makeStats() {
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}
