import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import "../public/style.css";
import {GrahamScan} from "./graham_scan_TEST.js";
import Delaunator from 'delaunator';
import NormalDistribuion from 'normal-distribution';
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { generateBase } from "./floating_island";

function euclideanDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1[0]-p2[0], 2) + Math.pow(p1[1]-p2[1], 2));
}

function normPdf(val, mean, std) {
    const pdf = (1/(std*Math.sqrt(2*Math.PI)))*Math.exp(-0.5 * Math.pow((val-mean)/std,2));
    // console.log(pdf);
    return pdf;
}

export class FloatingIsland {
    constructor () {
        this.islandMeshes = [];
        this.NOISE2D = createNoise2D();
        this.ORIGIN = new THREE.Vector2(0, 0);
        this.PEAK = 15;
        this.RAD = 50;

        this.width = 0;
        this.height = 0;
    }

    IsPointInPolygon(poly_array, test_point) {
        var inside = false;
        var test_x = test_point[0];
        var test_y = test_point[1];
        for(var i=0; i<(poly_array.length-1); i++) {
            var p1_x = poly_array[i][0];
            var p1_y = poly_array[i][1];
            var p2_x = poly_array[i+1][0];
            var p2_y = poly_array[i+1][1];
            if((p1_y<test_y && p2_y>=test_y) || (p2_y<test_y && p1_y>=test_y)) { // this edge is crossing the horizontal ray of testpoint
                if((p1_x+(test_y-p1_y)/(p2_y-p1_y)*(p2_x-p1_x)) < test_x) { // checking special cases (holes, self-crossings, self-overlapping, horizontal edges, etc.)
                    inside=!inside;
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
        this.RAD = w+h;
        // this.normW = new NormalDistribution(w, w/3);
        // this.normH = new NormalDistribuion(h, h/3);
        const wRad = w/2;
        const hRad = h/2;

        const max = 1.00;
        const min = 0.8;
        const coords = [];
        for (var i = 0; i < 2*Math.PI; i += this.randomInRange(Math.PI/n, 2*Math.PI/n)) {
            var cosT = Math.cos(i);
            var sinT = Math.sin(i);
            var rad =  this.randomInRange(min, max) * Math.sqrt(Math.pow((wRad*hRad),2) / (hRad*hRad*cosT*cosT + wRad*wRad*sinT*sinT)); //Math.abs(perlin(0.1, 10, 100*cosT, 100*sinT));
            var x = Math.floor(rad * cosT);
            var y = Math.floor(rad * sinT);
            coords.push([x,y]);
        }
        coords.push(coords[0]);
        console.log(coords.length);
        return coords;
    }
    

    
    findClosest(point, hull) {
        var hullClone = hull.slice();
        hullClone.sort(function(p1, p2) {
            return euclideanDistance(p1, point) - euclideanDistance(p2, point);
        });
        return hullClone[0];
    }
    
    falloff(point, rad) {
        const pt = new THREE.Vector2(point[0], point[1]);
        const len = pt.length();
        // console.log(point);
        if (point[0] == 0) {
            return 1;
        }
        const theta = Math.atan(point[1] / point[0]);
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        
        const wRad = this.width/2;
        const hRad = this.height/2;

        const myRad =  Math.sqrt(Math.pow((wRad*hRad),2) / (hRad*hRad*cosT*cosT + wRad*wRad*sinT*sinT)); //Math.max(this.height, this.width); 
        // console.log(myRad);
        if (len > myRad) {
            return 0;
        }
        let x = len / myRad;
        return -Math.pow(x, 10) + 1;
    }

    generateIslandBase(x, y, z, w, h) {
        // Instantiating plane mesh
        var geometry = new THREE.PlaneGeometry(150, 150, 256, 256);
        var geometry2 = new THREE.PlaneGeometry(150, 150, 256, 256);
    
        const hull = this.polarSample(50, w, h);
        
        this.augmentVerts(geometry, hull, true);
        this.augmentVerts(geometry2, hull, false);
    
        const merged = BufferGeometryUtils.mergeBufferGeometries([geometry, geometry2]);
    
        var material = new THREE.MeshStandardMaterial({
        color: 0x836582,
        side: THREE.DoubleSide,
        });
        var terrain = new THREE.Mesh(merged, material);
    
        terrain.rotation.x = -Math.PI / 2;
        terrain.translateX(x);
        terrain.translateY(y);
        terrain.translateZ(z);
        return terrain;
    }
    
    augmentVerts(geometry, hull, positive) {
        
        var verts = geometry.attributes.position.array;
        for (var i = 0; i < verts.length; i += 3) {
            let pt = [verts[i], verts[i + 1]];
            if (!this.IsPointInPolygon(hull, pt)) {
                // outside of the hull
                var closest = this.findClosest(pt, hull);
                verts[i] = closest[0];
                verts[i+1] = closest[1];
                // verts[i+2] = -10;
                continue;
            }
    
            var newZ = Math.abs(this.PEAK * 
                (-(2/(this.width)) * Math.abs(verts[i]) + 1.5) *
                (-(2/(this.height)) * Math.abs(verts[i+1]) + 1.5) *
                // (50 / (euclideanDistance(pt, [0,0]) + 10)) *
                this.falloff(pt, this.RAD) * 
                (this.perlin(1 / 8, 10, verts[i], verts[i + 1]) +
                this.perlin(1 / 4, 40, verts[i], verts[i + 1]) + 
                this.perlin(1, 400, verts[i], verts[i + 1])));
            verts[i+2] = positive ? newZ*1.5 : -4 * newZ;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }
}




