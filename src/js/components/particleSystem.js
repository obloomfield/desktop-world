import * as THREE from "three";
import { SCENEDATA } from "../setup.js";

export function addParticleSystem(x,y,z) {
    SCENEDATA.particleSystem = new ParticleSystem({
        parent: SCENEDATA.scene,
        camera: SCENEDATA.camera,
        location: new THREE.Vector3(x,y,z)
    });
    // SCENEDATA.add("NEWPOINTS", system.points);
    // console.log("POINTMULTIPLIER", window.innerHeight / (2.0 * Math.tan(0.5 * 60 * Math.PI / 180.0)));
}

export function updateParticleSystem(elapsed) {
    for (let island of SCENEDATA.islands) {
        island.islandWaterfall.Step(elapsed);
    }
    // SCENEDATA.particleSystem.Step(elapsed);
}

const VS = `
uniform float pointMultiplier;
attribute float size;
attribute vec4 colour;
attribute float angle;
varying vec4 vColour;
varying vec2 vAngle;

uniform vec3 cameraPos; 

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    gl_Position = projectionMatrix * mvPosition;
    // gl_PointSize = size * pointMultiplier / gl_Position.w;

    gl_PointSize = 300.0 * size / length(vec3(gl_Position) - cameraPos); //clamp(size - length(vec3(gl_Position) - cameraPos)/size, 1.0, 35.0);
    vAngle = vec2(cos(angle), sin(angle));

    vColour = colour;
}
`;

const FS = `
uniform sampler2D diffuseTexture;
varying vec4 vColour;
varying vec2 vAngle;

void main() {
    vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
    gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
}
`

// linear spline from simondev
class LinearSpline {
    constructor(lerp) {
      this._points = [];
      this._lerp = lerp;
    }
  
    AddPoint(t, d) {
      this._points.push([t, d]);
    }
  
    Get(t) {
      let p1 = 0;
  
      for (let i = 0; i < this._points.length; i++) {
        if (this._points[i][0] >= t) {
          break;
        }
        p1 = i;
      }
  
      const p2 = Math.min(this._points.length - 1, p1 + 1);
  
      if (p1 == p2) {
        return this._points[p1][1];
      }
  
      return this._lerp(
          (t - this._points[p1][0]) / (
              this._points[p2][0] - this._points[p1][0]),
          this._points[p1][1], this._points[p2][1]);
    }
}

export class ParticleSystem {
    constructor (params) {
        const uniforms = {
            diffuseTexture: {
                value: new THREE.TextureLoader().load("../models/mist.png")
            },
            pointMultipllier: {
                value: window.innerHeight / (2.0 * Math.tan(0.5 * 45 * Math.PI / 180.0))
            },
            cameraPos: {
                value: SCENEDATA.camera.position
            }

        };
        this.material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: VS,
            fragmentShader: FS, 
            blending: THREE.NormalBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });

        this.location = params.location;

        this.camera = SCENEDATA.camera;

        this.particles = [];
        this.MAXLIFE = 2.0;
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([]), 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array([]), 1));
        this.geometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4));
        // this.geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));

        this.points = new THREE.Points(this.geometry, this.material);
        SCENEDATA.add("particlePoints", this.points);

        this.addParticles();
        this.updateGeometry();
        // console.log("POINT GEO", this.geometry);

        this.toRemove = [];
        // console.log(SCENEDATA.objects);

        this._sizeSpline = new LinearSpline((t, a, b) => {
            return a + t * (b - a);
          });
          this._sizeSpline.AddPoint(0.0, 1.0);
          this._sizeSpline.AddPoint(0.5, 2.0);
          this._sizeSpline.AddPoint(1.0, 3.0);

          this._alphaSpline = new LinearSpline((t, a, b) => {
            return a + t * (b - a);
          });
          this._alphaSpline.AddPoint(0.0, 1.0);
          this._alphaSpline.AddPoint(0.4, 0.5);
          this._alphaSpline.AddPoint(1.0, 0.0);

          this.veloSpline = new LinearSpline((t, a, b) => {
            return a + t * (b - a);
          });
          this.veloSpline.AddPoint(0.0, 1.0);
          this.veloSpline.AddPoint(0.5, 2.0);
          this.veloSpline.AddPoint(1.0, 5.0);
    }

    addParticles() {
        for (var i = 0; i < 10; i++) {
            this.particles.push({
                position: new THREE.Vector3(
                    (Math.random() * 2 - 1) * 1.0 + this.location.x,
                    (Math.random() * 2 - 1) * 1.0 + this.location.y,
                    (Math.random() * 2 - 1) * 1.0 + this.location.z,
                ),
                size: (Math.random() * 0.5 + 0.5) * 30.0,
                colour: new THREE.Color(),
                alpha: Math.random(),
                rotation: Math.random() * 2.0 * Math.PI,
                life: this.MAXLIFE,
                velocity: new THREE.Vector3(0,1,0)
            });
        }
    }

    updateGeometry() {
        const positions = [];
        const sizes = [];
        const colours = [];
        const angles = [];
        for (let p of this.particles) {
            positions.push(p.position.x, p.position.y, p.position.z);
            sizes.push(p.currentSize);
            colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
            angles.push(p.rotation);
        }
        // console.log(positions);
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(sizes),1));
        this.geometry.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4));
        this.geometry.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1));

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.colour.needsUpdate = true;
        this.geometry.attributes.angle.needsUpdate = true;
    }

    updateParticles(timeDelta) {
        for (let p of this.particles) {
            p.life -= timeDelta;
        }
      
        this.particles = this.particles.filter(p => {
        return p.life > 0.0;
        });

        for (let p of this.particles) {
            const t = 1.0-p.life/this.MAXLIFE;
            p.rotation += 0.05;

            p.position.sub(p.velocity.clone().multiplyScalar(this.veloSpline.Get(t))); //.multiplyScalar(timeElapsed*.05));
            p.currentSize = p.size * this._sizeSpline.Get(t);
            p.alpha = this._alphaSpline.Get(t);

            const drag = p.velocity.clone();
            drag.multiplyScalar(t * 0.0005);
            drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
            drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
            drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
            p.velocity.sub(drag);
        }

        this.particles.sort((a,b) => {
            const d1 = this.camera.position.distanceTo(a.position);
            const d2 = this.camera.position.distanceTo(b.position);
            if (d1 > d2) {
                return -1
            }
            if (d1 < d2) {
                return 1;
            }
            return 0;
        })
    }

    Step(timeElapsed) {
        this.addParticles();
        this.updateParticles(timeElapsed);
        this.updateGeometry();
    }
}