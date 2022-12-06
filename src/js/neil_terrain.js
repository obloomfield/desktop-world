import * as THREE from "three";
import "../public/style.css";
import {OrbitControls} from 'https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls';
import { Vector2 } from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000000);
//camera.position.set(-17, 31, 33);
camera.position.set(0, 10, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,0,0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const light = new THREE.DirectionalLight( 0xffffd9, 0.5 );
light.position.set(camera.position.x, camera.position.y+500, camera.position.z+500).normalize();
scene.add(light);

const geometry = new THREE.PlaneGeometry(500, 500, 128, 128);
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const groundPlane = new THREE.Mesh(
  geometry, material
);
groundPlane.rotation.x = -Math.PI / 2;
scene.add(groundPlane);


const origin = new Vector2(0,0);
const radius = 200;

function falloff(point, rad) {
    let x = point.length() / rad;
    return -Math.pow(x,10) + 1;
}

function generateVertices() {
    const peak = 100;
    const vertices = groundPlane.geometry.attributes.position.array;
    for (var i = 0; i <= vertices.length; i += 3) {
        let currPoint = new Vector2(vertices[i], vertices[i+1])
        if (origin.distanceTo(currPoint) > radius) {
            let vecLen = currPoint.length();
            vertices[i] *= radius /vecLen;
            vertices[i+1] *= radius /vecLen;
            vertices[i+2] = 0;
            continue;
        }
        vertices[i+2] = peak * Math.random() * falloff(currPoint, radius);
    }
    groundPlane.geometry.attributes.position.needsUpdate = true;
    groundPlane.geometry.computeVertexNormals();
}

// camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    // groundPlane.rotation.x += 0.01;
    // groundPlane.rotation.y += 0.01;
    renderer.render(scene, camera);
    controls.update();
  }
generateVertices();
renderer.render(scene, camera);

animate();
