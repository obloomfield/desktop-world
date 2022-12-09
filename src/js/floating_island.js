import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import "../public/style.css";
import {GrahamScan} from "./graham_scan_TEST.js";
import Delaunator from 'delaunator';
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

import {islandMaterial} from "./island_textures.js";


function sample2D(n, w, h) {
    const points = [];
    // while (points.length < n) {
    //     var x = Math.floor(Math.random() * w);
    //     var y = Math.floor(Math.random() * h);
    //     if (Math.pow(x/w,2) + Math.pow(y/h,2) < 1) {
    //         points.push([x,y])
    //     }
    // }
    const halfw = w/2;
    const halfh = h/2;
    for (var i = 0; i < n; i++) {
        var x = Math.floor(Math.random() * w) - halfw;
        var y = Math.floor(Math.random() * h) - halfh;
        points.push([x,y])
    }
    return points;
}

// return the outer hull for points
// 
function outerHull(points) {
    const grahamScan = new GrahamScan();
    grahamScan.setPoints(points);
    const hull = grahamScan.getHull();
    return hull;
}

function edgesOfTriangle(t) { return [3 * t, 3 * t + 1, 3 * t + 2]; }

function pointsOfTriangle(delaunay, t) {
    return edgesOfTriangle(t)
        .map(e => delaunay.triangles[e]);
}

function forEachTriangle(points, delaunay) {
    const vertices = [];
    // const vertices = new Float32Array(delaunay.triangles.length*3);
    for (let t = 0; t < delaunay.triangles.length / 3; t++) {
        var locs = pointsOfTriangle(delaunay, t).map(p => points[p]);
        // console.log(locs);
        vertices.push(locs[0][0]);
        vertices.push(locs[0][1]);
        vertices.push(0);
        vertices.push(locs[1][0]);
        vertices.push(locs[1][1]);
        vertices.push(0);
        vertices.push(locs[2][0]);
        vertices.push(locs[2][1]);
        vertices.push(0);
    }
    return new Float32Array(vertices);
}

function handleTriangle(t, points) {
    // console.log(points);
    // retu
}

export function generateBase(x, y, n, w, h) {

    // const x = 0, y = 0, z = 0;
    const base = new THREE.Shape();
    // const hull = outerHull(sample2D(n, w, h));

    const randPoints = sample2D(64*64, w, h);
    const coords = randPoints.flat();
    const delaunay = new Delaunator(coords);

    const hullSet = new Set();
    for (var i = 0; i < delaunay.hull.length; i++) {
        var randCoord = randPoints[delaunay.hull[i]];
        // console.log("RAND COORD " + randCoord);
        hullSet.add(randCoord[0].toString() + "," + randCoord[1].toString());
    }
    // console.log(hullSet);

    const vertices = forEachTriangle(randPoints, delaunay);
    
    var geometry = new THREE.BufferGeometry();
    var geometry2 = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry2.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    geometry = BufferGeometryUtils.mergeVertices(geometry);
    geometry2 = BufferGeometryUtils.mergeVertices(geometry2);

    augmentVerts(geometry, hullSet, true);
    augmentVerts(geometry2, hullSet, false);

    console.log(geometry, geometry2);
    var merged = BufferGeometryUtils.mergeBufferGeometries([geometry, geometry2]);

    var material = new THREE.MeshStandardMaterial({
        color: 0xff3951,
        side: THREE.DoubleSide,
      });
      
    const mesh = new THREE.Mesh( merged, islandMaterial );
    mesh.rotation.x = -Math.PI / 2;
    mesh.translateZ(100);
    return mesh; // scene.add( mesh );
}

// const simplexNoise = new SimplexNoise(this.seed);
    // this.getPerlin = (x, y) => {
    //   return (simplexNoise.noise2D(x,y) + 1.0) / 2; // normalize to between 0 and 1
    // };
const NOISE2D = createNoise2D();
function perlin(amp, freq, v_i, v_i2) {
    // return amp * NOISE2D(v_i / freq, v_i2 / freq);
    let perlin = (NOISE2D(v_i * 100,v_i2 * 100) + 1.0) / 2;
    perlin = Math.min(Math.max(perlin, 0.5), 1);
    return perlin;
  }
  
function falloff(point, rad) {
    const len = point.length();
    if (len > rad) {
        return 0;
    }
    let x = len / rad;
    return -Math.pow(x, 20) + 1;
}

function augmentVerts(geometry, hull, positive) {
    const ORIGIN = new THREE.Vector2(0, 0);
    const PEAK = 15;
    const RAD = 50;
    var verts = geometry.attributes.position.array;
    const zVals = [];
    for (var i = 0; i < verts.length; i += 3) {
        let pt = new THREE.Vector2(verts[i], verts[i + 1]);
        let pt_len = pt.length();
        if (pt_len > RAD) {
            verts[i] *= RAD / pt_len;
            verts[i + 1] *= RAD / pt_len;
            verts[i + 2] = 0;
            continue;
        }
        // console.log("VERTS, " + verts[i] + " " + verts[i+1]);
        var testStr = verts[i].toString() + "," + verts[i+1].toString();
        
        if (hull.has(testStr)) {
            continue;
        }
        // var newZ = Math.floor(Math.random() * 30);
        let r = pt.addScaledVector(ORIGIN, -1);
        var newZ = Math.abs(PEAK *
        // (2 / (r.length())) *
        falloff(pt, RAD) *
        (perlin(1, 2, verts[i], verts[i + 1]) + 0));
        //   perlin(1 / 2, 40, verts[i], verts[i + 1]) +
        //   perlin(1, 100, verts[i], verts[i + 1])));
        newZ *= positive ? 1 : -3;
        
        verts[i + 2] = newZ;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
}
