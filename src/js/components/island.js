import NormalDistribuion from "normal-distribution";
import { createNoise2D } from "simplex-noise";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
// import { GrahamScan } from "../graham_scan_TEST.js";
import "../../public/style.css";

import { BufferGeometry, Object3D, Vector2 } from "three";
import { SCENEDATA } from "../setup";
import { loadObj } from "./models";
import { ParticleSystem } from "./particleSystem";
import { islandMaterial } from "./shader";
import {perlin, perlinParams} from "./perlin";

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

  const islandLocs = [[
    THREE.MathUtils.randFloat(-250,250), 
    THREE.MathUtils.randFloat(-250,250), 
    THREE.MathUtils.randFloat(250, 400)
  ],
  [
    THREE.MathUtils.randFloat(-250,250), 
    THREE.MathUtils.randFloat(-250,250), 
    THREE.MathUtils.randFloat(250, 400)
  ]]; //, [-200,140,100], [75, 76, 85]];// [-150, -190, 125], [-145, 160, 104]];
  const islandSize = [
    [300, 250],
    [100, 150],
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
    const islandLabel = ["island", "terrain", i].join("-")
    SCENEDATA.add(islandLabel, islandBase.islandTerrain);
    SCENEDATA.get(islandLabel).layers.enable(1);
    // console.log("")
    for (var j = 0; j < islandBase.islandTrees.length; j++) {
      SCENEDATA.add(
        ["island", "trees", i, j].join("-"),
        islandBase.islandTrees[j]
      );
    }
    for (var j = 0; j < islandBase.islandVines.length; j++) {
      SCENEDATA.add(
        ["island", "vines", i, j].join("-"),
        islandBase.islandVines[j]
      );
    }
    console.log(islandBase.islandWaterfall);
    SCENEDATA.add(
      ["waterfall", i].join("-"),
      islandBase.islandWaterfall.points
    );
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

export function sampleTrees(geometry, prob) {
  const norms = geometry.attributes.normal.array;
  const verts = geometry.attributes.position.array;
  const vert = [0, 0, 1];
  const locs = [];
  for (var i = 0; i < norms.length; i += 3) {
    if (norms[i + 2] > 0.8 && verts[i + 2] > 10) {
      if (Math.random() > prob) {
        locs.push(i);
      }
    }
  }
  return locs;
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
    this.waterfallLoc = [];
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

    const max = 1;
    const min = 0.85;
    const coords = [];
    for (
      var i = 0;
      i < 2 * Math.PI;
      i += this.randomInRange(Math.PI / n, (2 * Math.PI) / n)
    ) {
      var cosT = Math.cos(i);
      var sinT = Math.sin(i);
      var rad =
        // perlin(perlinParams, 20 * cosT, 20*sinT) *
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
    // console.log(coords);
    this.waterfallLoc = coords[Math.floor(Math.random() * coords.length)];
    console.log("waterfall loc", this.waterfallLoc);

    return coords;
  }

  distToEdge(p, p1, p2) {
    const x1 = p1[0];
    const x2 = p2[0];
    const y1 = p1[1];
    const y2 = p2[1];
    const x = p[0];
    const y = p[1];

    const x2x1 = x2 - x1;
    const y2y1 = y2 - y1;
    const u = ((x - x1) * x2x1 + (y - y1) * y2y1) / (x2x1 * x2x1 + y2y1 * y2y1);

    const xu = x1 + u * (x2 - x1);
    const yu = y1 + u * (y2 - y1);

    var pc = [];
    if (u < 0) {
      pc = p1;
    } else if (u > 1) {
      pc = p2;
    } else {
      pc = [xu, yu];
    }

    // sqrt((x3 - xc)^2 + (y3 - yc)^2)
    const x_xc = p[0] - pc[0];
    const y_yc = p[1] - pc[1];
    return Math.sqrt(x_xc * x_xc + y_yc * y_yc);

    // const top = Math.abs((p2[0]-p1[0])*(p1[1]-pt[1]) - (p1[0]-pt[0])*(p2[1]-p1[1]));
    // const bot = Math.sqrt(Math.pow(p2[0]-p1[0],2) + Math.pow(p2[1]-p1[1],2));
    // return top/bot;
  }

  findClosest(point, hull) {
    var minDist = Number.POSITIVE_INFINITY;
    var closestPt = [];
    for (var i = 0; i < hull.length; i++) {
      const dist = this.distToEdge(point, hull[(i + 1) % hull.length], hull[i]);
      if (dist < minDist) {
        minDist = dist;
        // const pt = new Vector2(point[0], point[1]);
        // const pt1 = new Vector2(hull[i][0], hull[i][1]);
        // const pt2 = new Vector2(hull[i+1][0], hull[i+1][1]);
        // const dir = (pt2-pt1).normalize();
        // const norm = new Vector2(-dir[1], dir[0]);
        // closestPt = pt + dist*norm;
      }
      // minDist = Math.min(minDist, dist);
    }
    return minDist; //[minDist, closestPt];

    // var hullClone = hull.slice();
    // hullClone.sort(function (p1, p2) {
    //   return euclideanDistance(p1, point) - euclideanDistance(p2, point);
    // });
    // return hullClone[0];
  }

  ellipsoid(x, y) {
    const a = this.width / 2;
    const b = this.height / 2;
    const hypotenuse = Math.sqrt(x * x + y * y);
    const cosT = x / hypotenuse;
    const sinT = y / hypotenuse;

    var rad = Math.sqrt(
      Math.pow(a * b, 2) / (b * b * cosT * cosT + a * a * sinT * sinT)
    );

    if (hypotenuse > rad) {
      return 0;
    }

    const xyComp = Math.abs(1 - (x * x) / (a * a) - (y * y) / (b * b));
    const c2 = this.ellipseHeight * this.ellipseHeight;
    return Math.sqrt(c2 * xyComp);
  }

  falloff(point, rad, hull) {
    const minDist = this.findClosest(point, hull);
    if (minDist < 15) {
      return -Math.pow((15 - minDist) / 15, 20) + 1;
    }
    return 1;
    // const pt = new THREE.Vector2(point[0], point[1]);
    // const len = pt.length();
    // // console.log(point);
    // if (point[0] == 0) {
    //   return 1;
    // }
    // const x = point[0];
    // const y = point[1];
    // const a = this.width / 2;
    // const b = this.height / 2;
    // const hypotenuse = Math.sqrt(x*x + y*y);
    // const cosT = x / hypotenuse;
    // const sinT = y / hypotenuse;

    // var rad =
    //     Math.sqrt(
    //       Math.pow(a * b, 2) /
    //         (b * b * cosT * cosT + a * a * sinT * sinT)
    //     );

    // if (hypotenuse > rad) {
    //   return 0;
    // }
    // const myRad = Math.max(2 * this.width, 2 * this.height);
    // if (len > myRad) {
    //   return 0;
    // }
    // let rat = len / myRad;
    // return -Math.pow(rat, 10) + 1;
  }

  augmentVerts(geometry, hull, positive) {
    var verts = geometry.attributes.position.array;
    for (var i = 0; i < verts.length; i += 3) {
      let pt = [verts[i], verts[i + 1]];
      if (!this.IsPointInPolygon(hull, pt)) {
        // const res = this.findClosest;
        // if (res[0] < 2) {
        //   verts[i] = res[1][0];
        //   verts[i+1] = res[1][1];
        // }
        continue;
      }
      var eHeight = this.ellipsoid(pt[0], pt[1]);
      // eHeight *= positive ? 1.5 : 3;
      var newZ =
        eHeight +
        Math.abs(
          this.PEAK *
            (-(1.5 / ((this.width * 0.9) / 2)) * Math.abs(verts[i]) + 1.5) *
            (-(1.5 / ((this.height * 0.9) / 2)) * Math.abs(verts[i + 1]) +
              1.5) *
            // this.falloff(pt, this.RAD, hull) *
            // perlin(perlinParams, verts[i], verts[i + 1])
            (this.perlin(1 / 4, 20, verts[i], verts[i + 1]) +
              // this.perlin(1 / 2, 10, verts[i], verts[i + 1]) +
              this.perlin(1, 40, verts[i], verts[i + 1]) +
              this.perlin(2, 400, verts[i], verts[i + 1]))
        );
      newZ *= this.falloff(pt, this.RAD, hull);
      verts[i + 2] = positive ? newZ : -2 * newZ;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  sampleVines(geometry) {
    const norms = geometry.attributes.normal.array;
    const verts = geometry.attributes.position.array;
    const vert = [0, 0, 1];
    const locs = [];
    for (var i = 0; i < norms.length; i += 3) {
      if (norms[i + 2] > 0.9 && verts[i + 2] < -10) {
        if (Math.random() > 0.95) {
          locs.push(i);
        }
      }
    }
    return locs;
  }

  

  cloneAttribute(attr) {
    return new Float32Array(attr);
  }

  async loadVine() {
    const result = await loadObj("../models/ivy.mtl", "../models/ivy.obj");
    return result[0];
  }

  async loadAlienTree() {
    const result = await loadObj(
      "../models/lowpolytree.mtl",
      "../models/lowpolytree.obj"
    );
    SCENEDATA.treeObj = result[0];
    return result[0];
  }

  getSamples(
    treeLocs,
    posArr,
    sampleObj,
    islandLoc,
    islandLocLen,
    scale = 1,
    type
  ) {
    const samples = [];
    for (var i = 0; i < treeLocs.length; i++) {
      const idx = treeLocs[i];
      const newObj = new Object3D();
      newObj.copy(sampleObj);
      const dir = new THREE.Vector3(
        posArr[idx],
        posArr[idx + 1],
        posArr[idx + 2]
      );
      dir.applyAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
      const len = dir.length();
      const rotAxis = new THREE.Vector3(0, 1, 0);
      newObj.translateOnAxis(islandLoc, islandLocLen);
      newObj.translateOnAxis(dir.normalize(), len);
      newObj.rotateOnAxis(rotAxis, this.randomInRange(0, 2 * Math.PI));
      const scaleVal = THREE.MathUtils.randFloat(scale, scale+2);
      newObj.scale.set(scaleVal, scaleVal, scaleVal);
      samples.push(newObj);
    }
    return samples;
  }

  async generateIslandBase(x, y, z, w, h) {
    // Instantiating plane mesh
    var geometry = new THREE.PlaneGeometry(w, h, 512, 512);
    var geometry2 = new THREE.PlaneGeometry(w, h, 512, 512);

    const hull = this.polarSample(40, w, h);

    this.augmentVerts(geometry, hull, true);
    this.augmentVerts(geometry2, hull, false);

    // var treeGeo = new THREE.BufferGeometry();

    const treeOBJ = await this.loadAlienTree();
    console.log("TREE OBJ", treeOBJ);

    const geos = [geometry, geometry2];
    // const geos = [];
    let mergedGeos = BufferGeometryUtils.mergeBufferGeometries(geos);
    // merged.rotateY(-Math.PI/2);
    const merged = BufferGeometryUtils.mergeVertices(mergedGeos);
    merged.computeVertexNormals();
    const posArr = merged.attributes.position.array;
    const treeLocs = sampleTrees(merged, .999);

    const vineLocs = this.sampleVines(merged);
    const vineObj = await this.loadVine();

    const islandLoc = new THREE.Vector3(x, y, z);
    const islandLocLen = islandLoc.length();
    islandLoc.normalize();
    islandLoc.applyAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

    const trees = this.getSamples(
      treeLocs,
      posArr,
      treeOBJ,
      islandLoc,
      islandLocLen,
      1
    );
    const vines = this.getSamples(
      vineLocs,
      posArr,
      vineObj,
      islandLoc,
      islandLocLen,
      2
    );

    console.log(trees.length);
    console.log(vines.length);

    var material = new THREE.MeshStandardMaterial({
      color: 0x836582,
      side: THREE.DoubleSide,
    });

    var terrain = new THREE.Mesh(merged, islandMaterial());

    terrain.rotation.x = -Math.PI / 2;
    terrain.translateX(x);
    terrain.translateY(y);
    terrain.translateZ(z);

    return {
      islandTerrain: terrain,
      islandTrees: trees,
      islandVines: vines,
      islandWaterfall: new ParticleSystem({
        parent: SCENEDATA.scene,
        camera: SCENEDATA.camera,
        location: new THREE.Vector3(
          x + this.waterfallLoc[0],
          z,
          -y - this.waterfallLoc[1]
        ),
      }),
    };
  }
}
