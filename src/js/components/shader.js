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

const float _TRI_SCALE = 100.0;

// vec4 texture_UV(in sampler2DArray srcTexture, in vec3 x) {
//   float k = texture(noiseMap, 0.0025*x.xy).x; // cheap (cache friendly) lookup
//   float l = k*8.0;
//   float f = fract(l);
  
//   float ia = floor(l+0.5); // suslik's method (see comments)
//   float ib = floor(l);
//   f = min(f, 1.0-f)*2.0;
//   vec2 offa = sin(vec2(3.0,7.0)*ia); // can replace with any other hash
//   vec2 offb = sin(vec2(3.0,7.0)*ib); // can replace with any other hash
//   vec4 cola = texture(srcTexture, vec3(x.xy + offa, x.z));
//   vec4 colb = texture(srcTexture, vec3(x.xy + offb, x.z));
//   return mix(cola, colb, smoothstep(0.2,0.8,f-0.1*sum(cola.xyz-colb.xyz)));
// }

vec4 _Triplanar_UV(vec3 pos, vec3 normal) {
  vec4 dx = texture(islandTexture, pos.zy); //texture_UV(tex, vec3(pos.zy / _TRI_SCALE, texSlice));
  vec4 dy = texture(islandTexture, pos.xz); //texture_UV(tex, vec3(pos.xz / _TRI_SCALE, texSlice));
  vec4 dz = texture(islandTexture, pos.xy); //texture_UV(tex, vec3(pos.xy / _TRI_SCALE, texSlice));
  vec3 weights = abs(normal.xyz);
  weights = weights / (weights.x + weights.y + weights.z);
  return dx * weights.x + dy * weights.y + dz * weights.z;
}

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
    } 
    else if (v_Pos[2] > 2.0) {
      if (n[2] < 0.55) { 
        gl_FragColor = vec4(lum,lum,lum, 1);
      } else {
        gl_FragColor = vec4(vec3(0,1,0) * lum, 1);
      }
    } else {
      gl_FragColor = vec4(lum,lum,lum, 1);
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
islandMaterial.flatShading = true;
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
