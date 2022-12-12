import NormalDistribuion from "normal-distribution";
import { createNoise2D } from "simplex-noise";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
// import { GrahamScan } from "../graham_scan_TEST.js";
import "../../public/style.css";

import { BufferGeometry, Object3D } from "three";
import { SCENEDATA } from "../setup";
import { loadObj } from "./models";
import { islandMaterial } from "./shader";

function euclideanDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}

function normPdf(val, mean, std) {
  const pdf =
    (1 / (std * Math.sqrt(2 * Math.PI))) *
    Math.exp(-0.5 * Math.pow((val - mean) / std, 2));
  // console.log(pdf);
  return pdf;
}

export async function addIslands() {
  // const islandBase = generateBase(0,0,50,100,100);
  const islandGenerator = new FloatingIsland();

  const islandLocs = [[200, 150, 150]]; //, [-200,140,100], [75, 76, 85], [-150, -190, 125], [-145, 160, 104]];
  const islandSize = [
    [100, 150],
    [30, 50],
    [60, 90],
    [100, 70],
    [45, 36],
  ];
  for (var i = 0; i < islandLocs.length; i++) {
    var islandLoc = islandLocs[i];
    var islandDim = islandSize[i];
    var islandBase = await islandGenerator.generateIslandBase(
      islandLoc[0],
      islandLoc[1],
      islandLoc[2],
      islandDim[0],
      islandDim[1]
    );
    SCENEDATA.islands.push(islandBase);
    // scene.add(islandBase.islandTerrain);
    SCENEDATA.add(["island", "terrain", i].join("-"), islandBase.islandTerrain);
    // console.log("")
    for (var j = 0; j < islandBase.islandTrees.length; j++) {
      // console.log(islandBase.islandTrees[j]);
      SCENEDATA.add(
        ["island", "trees", i, j].join("-"),
        islandBase.islandTrees[j]
      );
    }
  }
}

const times = [0, Math.PI / 3, -Math.PI / 4, Math.PI / 6, Math.PI / 5];
export function updateIslands() {
  // island update code
  // console.log(SCENEDATA.islands.length);
  for (var i = 0; i < SCENEDATA.islands.length; i++) {
    SCENEDATA.get(["island", "terrain", i].join("-")).position.y +=
      0.15 * Math.sin(times[i]);
    for (var j = 0; j < SCENEDATA.islands[i].islandTrees.length; j++) {
      SCENEDATA.get(["island", "trees", i, j].join("-")).translateY(
        0.15 * Math.sin(times[i])
      );
    }
  }
}

export class FloatingIsland {
  constructor() {
    this.islandMeshes = [];
    this.NOISE2D = createNoise2D();
    this.ORIGIN = new THREE.Vector2(0, 0);
    this.PEAK = 15;
    this.RAD = 50;

    this.width = 0;
    this.height = 0;
    this.ellipseHeight = 20;

    this.treeGeometry = null;
  }

  IsPointInPolygon(poly_array, test_point) {
    var inside = false;
    var test_x = test_point[0];
    var test_y = test_point[1];
    for (var i = 0; i < poly_array.length - 1; i++) {
      var p1_x = poly_array[i][0];
      var p1_y = poly_array[i][1];
      var p2_x = poly_array[i + 1][0];
      var p2_y = poly_array[i + 1][1];
      if (
        (p1_y < test_y && p2_y >= test_y) ||
        (p2_y < test_y && p1_y >= test_y)
      ) {
        // this edge is crossing the horizontal ray of testpoint
        if (p1_x + ((test_y - p1_y) / (p2_y - p1_y)) * (p2_x - p1_x) < test_x) {
          // checking special cases (holes, self-crossings, self-overlapping, horizontal edges, etc.)
          inside = !inside;
        }
      }
    }
    return inside;
  }

  perlin(amp, freq, v_i, v_i2) {
    v_i += 20;
    v_i2 += 20;
    return amp * this.NOISE2D(v_i / freq, v_i2 / freq);
  }

  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  polarSample(n, w, h) {
    this.width = w;
    this.height = h;
    this.RAD = w + h;
    // this.normW = new NormalDistribution(w, w/3);
    // this.normH = new NormalDistribuion(h, h/3);
    const wRad = w / 2;
    const hRad = h / 2;

    const max = 1.0;
    const min = 0.8;
    const coords = [];
    for (
      var i = 0;
      i < 2 * Math.PI;
      i += this.randomInRange(Math.PI / n, (2 * Math.PI) / n)
    ) {
      var cosT = Math.cos(i);
      var sinT = Math.sin(i);
      var rad =
        this.randomInRange(min, max) *
        Math.sqrt(
          Math.pow(wRad * hRad, 2) /
            (hRad * hRad * cosT * cosT + wRad * wRad * sinT * sinT)
        ); //Math.abs(perlin(0.1, 10, 100*cosT, 100*sinT));
      var x = Math.floor(rad * cosT);
      var y = Math.floor(rad * sinT);
      coords.push([x, y]);
    }
    coords.push(coords[0]);
    console.log(coords.length);
    return coords;
  }

  findClosest(point, hull) {
    var hullClone = hull.slice();
    hullClone.sort(function (p1, p2) {
      return euclideanDistance(p1, point) - euclideanDistance(p2, point);
    });
    return hullClone[0];
  }

  ellipsoid(x, y) {
    const a = this.width / 2;
    const b = this.height / 2;
    const xyComp = Math.abs(1 - (x * x) / (a * a) - (y * y) / (b * b));
    const c2 = this.ellipseHeight * this.ellipseHeight;
    return Math.sqrt(c2 * xyComp);
  }

  falloff(point, rad) {
    const pt = new THREE.Vector2(point[0], point[1]);
    const len = pt.length();
    // console.log(point);
    if (point[0] == 0) {
      return 1;
    }
    // const theta = Math.atan(point[1] / point[0]);
    // const cosT = Math.cos(theta);
    // const sinT = Math.sin(theta);

    // const wRad = this.width/2;
    // const hRad = this.height/2;

    // const myRad =  Math.sqrt(Math.pow((wRad*hRad),2) / (hRad*hRad*cosT*cosT + wRad*wRad*sinT*sinT)); //Math.max(this.height, this.width);
    // console.log(myRad);
    const myRad = Math.max(2 * this.width, 2 * this.height);
    if (len > myRad) {
      return 0;
    }
    let x = len / myRad;
    return -Math.pow(x, 10) + 1;
  }

  augmentVerts(geometry, hull, positive) {
    var verts = geometry.attributes.position.array;
    for (var i = 0; i < verts.length; i += 3) {
      let pt = [verts[i], verts[i + 1]];
      if (!this.IsPointInPolygon(hull, pt)) {
        continue;
      }
      var eHeight = this.ellipsoid(pt[0], pt[1]);
      // eHeight *= positive ? 1.5 : 3;
      var newZ =
        eHeight +
        Math.abs(
          this.PEAK *
            (-(1.5 / (this.width / 2)) * Math.abs(verts[i]) + 1.5) *
            (-(1.5 / (this.height / 2)) * Math.abs(verts[i + 1]) + 1.5) *
            this.falloff(pt, this.RAD) *
            (this.perlin(1 / 8, 10, verts[i], verts[i + 1]) +
              this.perlin(1 / 4, 40, verts[i], verts[i + 1]) +
              this.perlin(1, 400, verts[i], verts[i + 1]))
        );
      verts[i + 2] = positive ? 1.5 * newZ : -3 * newZ;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  sampleTrees(geometry) {
    const norms = geometry.attributes.normal.array;
    const verts = geometry.attributes.position.array;
    const vert = [0, 0, 1];
    const locs = [];
    for (var i = 0; i < norms.length; i += 3) {
      // const curr = norms[i];
      // console.log(curr);
      // const dot = curr[2];
      if (norms[i + 2] > 0.8 && verts[i + 2] > 10) {
        // console.log("VALID");
        if (Math.random() > 0.995) {
          locs.push(i);
        }
      }
    }
    return locs;
  }

  cloneAttribute(attr) {
    return new Float32Array(attr);
  }

  async loadAlienTree() {
    const result = await loadObj(
      "../models/lowpolytree.mtl",
      "../models/lowpolytree.obj"
    );
    return result[0];
  }

  async loadVine() {
    const result = await loadObj();
    return result[0];
  }

  async generateIslandBase(x, y, z, w, h) {
    // Instantiating plane mesh
    var geometry = new THREE.PlaneGeometry(200, 200, 512, 512);
    var geometry2 = new THREE.PlaneGeometry(200, 200, 512, 512);

    const hull = this.polarSample(30, w, h);

    this.augmentVerts(geometry, hull, true);
    this.augmentVerts(geometry2, hull, false);

    // var treeGeo = new THREE.BufferGeometry();

    const treeOBJ = await this.loadAlienTree();
    console.log("TREE OBJ", treeOBJ);

    const geos = [geometry, geometry2];
    const trees = [];
    // const geos = [];
    let mergedGeos = BufferGeometryUtils.mergeBufferGeometries(geos);
    // merged.rotateY(-Math.PI/2);
    const merged = BufferGeometryUtils.mergeVertices(mergedGeos);
    const posArr = merged.attributes.position.array;
    const treeLocs = this.sampleTrees(merged);

    const islandLoc = new THREE.Vector3(x, y, z);
    const islandLocLen = islandLoc.length();
    islandLoc.normalize();
    islandLoc.applyAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

    for (var i = 0; i < treeLocs.length; i++) {
      const idx = treeLocs[i];
      const newTree = new Object3D();
      newTree.copy(treeOBJ);
      const dir = new THREE.Vector3(
        posArr[idx],
        posArr[idx + 1],
        posArr[idx + 2]
      );
      dir.applyAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
      const len = dir.length();
      // console.log(dir.normalize(), dir.length());
      // newTree.translateY(-10);
      // const rotAxis = new THREE.Vector3(0,1,0);
      // newTree.rotateOnAxis(rotAxis, this.randomInRange(0,2*Math.PI));
      // console.log("POST ROTATION", newTree.position);
      newTree.translateOnAxis(islandLoc, islandLocLen);
      newTree.translateOnAxis(dir.normalize(), len);
      // console.log("new pos", newTree.position);

      trees.push(newTree);
    }
    // console.log(trees);

    var material = new THREE.MeshStandardMaterial({
      color: 0x836582,
      side: THREE.DoubleSide,
      emissive: 0xffffff,
      emissiveIntensity: 1,
    });

    var terrain = new THREE.Mesh(merged, islandMaterial);

    terrain.rotation.x = -Math.PI / 2;
    terrain.translateX(x);
    terrain.translateY(y);
    terrain.translateZ(z);

    return {
      islandTerrain: terrain,
      islandTrees: trees,
    };
  }
}
