import { GUI } from "dat.gui";
import Stats from "stats.js";
import { perlinParams } from "./perlin";
import { terrainParams } from "./terrain";

export var stats = new Stats();

export function makeGUI() {
  const gui = new GUI();
  const centerFolder = gui.addFolder("Center");
  centerFolder.add(terrainParams.ORIGIN, "x", -50, 50);
  centerFolder.add(terrainParams.ORIGIN, "y", -50, 50);
  const terrainFolder = gui.addFolder("Terrain");
  terrainFolder.add(terrainParams, "PEAK", 0, 100);
  terrainFolder.add(terrainParams, "RAD", 200, 1000);
  const perlinFolder = gui.addFolder("Perlin");
  perlinFolder.add(perlinParams, "OCTAVECNT", 1, 10);
  perlinFolder.add(perlinParams, "LACUNARITY", 1, 10);
  perlinFolder.add(perlinParams, "PERSISTANCE", 0, 1);
  perlinFolder.add(perlinParams, "SMOOTHING", 1, 1000);
}

export function makeStats() {
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}
