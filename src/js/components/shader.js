import * as THREE from "three";

import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const STANDARD_VERTEX_SHADER = `

varying vec3 v_Normal;
varying vec3 v_Pos;
varying vec2 vertexUV;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_Normal = normal;
    v_Pos = position;
    vertexUV = uv;
}
`;

////////////////////////////////////////////////////////

const CIRCULAR_CONSTRAINT_FRAGMENT_SHADER = `
varying vec3 v_Normal;
varying vec3 v_Pos;
varying vec2 vertexUV;

uniform float RADIUS;
uniform vec4 COLOR;

void main() {
  float lum = (abs(v_Normal[0]) + abs(v_Normal[1]) + abs(v_Normal[2]))/3.0;

  if (distance(v_Pos,vec3(0,0,0)) > RADIUS) {
    discard;
  }
  gl_FragColor = vec4(vec3(COLOR)*lum,1);
}
`;

////////////////////////////////////////////////////////

const ISLAND_FRAGMENT_SHADER = `

varying vec3 v_Normal;
varying vec3 v_Pos;
varying vec2 vertexUV;

uniform sampler2D islandTexture;

void main() {

    vec3 n = v_Normal;
    float R = n[0];
    float G = n[1];
    float B = n[2];
    float lum = (abs(R) + abs(G) + abs(B))/3.0;
    // float dotProd = dot(v_Normal, vec3(0,0,1));

    if (v_Pos[2] == 0.0) {
        discard;
    }

    if (n[0] == 0.0 && n[1] == 0.0 && n[2] == 1.0 && v_Pos[2] == 0.0) {
        discard;
        // gl_FragColor = vec4(0,0,0,0);
    } else if (v_Pos[2] >= 0.0) {
        gl_FragColor = vec4(vec3(0,1,0) * lum, 1);
    } else {
        if (abs(n[2]) < .12) {
            // gl_FragColor = texture2D(islandTexture, gl_PointCoord);
            gl_FragColor = vec4(vec3(0,1,0) * lum, 1);
        } else {
            gl_FragColor = vec4(vec3(.58,.24,0) * lum, 1);
        }
    }
}
`;

////////////////////////////////////////////////////////

const BLOOM_FRAGMENT_SHADER = `
varying vec3 v_Normal;
varying vec3 v_Pos;
varying vec2 vertexUV;

uniform float u_time;
uniform vec4 color_1;
uniform vec4 color_2;

uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

void main() {

  float alpha = sin(u_time);
  float red = clamp(color_1[0]*alpha + color_2[0]*(1.0-alpha),0.0,1.0);
  float green = clamp(color_1[1]*alpha + color_2[1]*(1.0-alpha),0.0,1.0);
  float blue = clamp(color_1[2]*alpha + color_2[2]*(1.0-alpha),0.0,1.0);
  
  gl_FragColor = ( texture2D( baseTexture, vertexUV ) + vec4( 1.0 ) * texture2D( bloomTexture, vertexUV ) );
}
`;

export const circle_constraint_material = function (color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      RADIUS: {
        value: 499.5,
      },
      COLOR: {
        value: color,
      },
    },
    vertexShader: STANDARD_VERTEX_SHADER,
    fragmentShader: CIRCULAR_CONSTRAINT_FRAGMENT_SHADER,
    side: THREE.DoubleSide,
  });
};

export const islandMaterial = new THREE.ShaderMaterial({
  uniforms: {
    islandTexture: {
      value: new THREE.TextureLoader().load(
        "../../../public/models/texturetest.jpeg"
      ),
    },
  },
  vertexShader: STANDARD_VERTEX_SHADER,
  fragmentShader: ISLAND_FRAGMENT_SHADER,
});
islandMaterial.opacity = 0;
islandMaterial.transparent = 1;
islandMaterial.side = THREE.DoubleSide;
islandMaterial.depthWrite = true;
// islandMaterial.depthTest =

export const bloomPass = function (bloomTexture) {
  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomTexture },
      },
      vertexShader: STANDARD_VERTEX_SHADER,
      fragmentShader: BLOOM_FRAGMENT_SHADER,
      defines: {},
    }),
    "baseTexture"
  );
  finalPass.needsSwap = true;
  return finalPass;
};
