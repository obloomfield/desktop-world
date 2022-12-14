import * as THREE from "three";
import { ShaderMaterial } from "three";

import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { STANDARD_PALLETE } from "./colors";

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

const TERRAIN_VERTEX_SHADER = `

varying vec3 v_Normal;
varying vec3 v_Pos;
varying vec2 vertexUV;

uniform float RADIUS;

float falloff(float x) {
  if (x > RADIUS) {
    return 0.0;
  }
  // if (RADIUS - x > 1.0) {
  //   return 1.0;
  // }
  float diff = (RADIUS - x)/RADIUS;
  return pow(diff, 10.0);
}

void main() {
    v_Pos = position;
    // if (distance(v_Pos, vec3(0,0,0)) > RADIUS) {
    //   v_Pos = RADIUS * 1.1 * normalize(v_Pos);
    // }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(v_Pos, 1.0);
    v_Normal = normal;
    vertexUV = uv;
}
`;

////////////////////////////////////////////////////////

const TOON_VERTEX_SHADER = `
#include <common>
#include <shadowmap_pars_vertex>

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>

    #include <begin_vertex>

    #include <worldpos_vertex>
    #include <shadowmap_vertex>

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 clipPosition = projectionMatrix * viewPosition;

    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-viewPosition.xyz);

    gl_Position = clipPosition;
}
`;

////////////////////////////////////////////////////////

const TOON_FRAGMENT_SHADER = `
#include <common>
#include <packing>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uColor;
uniform float uGlossiness;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
    // shadow map
    DirectionalLightShadow directionalLight = directionalLightShadows[0];

    float shadow = getShadow(
        directionalShadowMap[0],
        directionalLight.shadowMapSize,
        directionalLight.shadowBias,
        directionalLight.shadowRadius,
        vDirectionalShadowCoord[0]
    );

    // directional light
    float NdotL = dot(vNormal, directionalLights[0].direction);
    float lightIntensity = smoothstep(0.0, 0.01, NdotL * shadow);
    vec3 light = directionalLights[0].color * lightIntensity;

    // specular light
    vec3 halfVector = normalize(directionalLights[0].direction + vViewDir);
    float NdotH = dot(vNormal, halfVector);

    float specularIntensity = pow(NdotH * lightIntensity, uGlossiness * uGlossiness);
    float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);

    vec3 specular = specularIntensitySmooth * directionalLights[0].color;

    // rim lighting
    float rimDot = 1.0 - dot(vViewDir, vNormal);
    float rimAmount = 0.6;

    float rimThreshold = 0.2;
    float rimIntensity = rimDot * pow(NdotL, rimThreshold);
    rimIntensity = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);

    vec3 rim = rimIntensity * directionalLights[0].color;

    gl_FragColor = vec4(uColor * (ambientLightColor + light + specular + rim), 1.0);
    `;

////////////////////////////////////////////////////////

const CIRCULAR_CONSTRAINT_FRAGMENT_SHADER = `
varying vec3 v_Normal;
varying vec3 v_Pos;
varying vec2 vertexUV;

uniform float RADIUS;
uniform vec3 COLOR;

void main() {
  float lum = (abs(v_Normal[0]) + abs(v_Normal[1]) + abs(v_Normal[2]))/3.0;

  if (distance(v_Pos,vec3(0,0,0)) > RADIUS) {
    discard;
  }
  gl_FragColor = vec4(COLOR*lum,1);
}
`;

////////////////////////////////////////////////////////

const TERRAIN_CONSTRAINT_FRAGMENT_SHADER = `
varying vec3 v_Normal;
varying vec3 v_Pos;
varying vec2 vertexUV;

uniform float RADIUS;
uniform vec3 COLOR;
uniform sampler2D terrainTexture;

float falloff(float z) {
  return pow((300.0 - z)/300.0, 2.0);
}

void main() {
  vec3 green = vec3(0,1,0);
  float lum = (abs(v_Normal[0]) + abs(v_Normal[1]) + abs(v_Normal[2]))/3.0;

  vec4 color;
  if (distance(v_Pos, vec3(0,0,0)) > RADIUS) {
    discard;
  } else {
    vec3 terrainColor = texture2D(terrainTexture, vec2(0, v_Pos.z/300.0)).rgb;
    color = vec4(terrainColor * lum, 1); //vec4(COLOR*lum,1);
  }

  // if (v_Normal[2] > 0.55) { 
  //   color = vec4(mix(color.rgb, green, falloff(v_Pos[2])),1.0);
  // } 
  gl_FragColor = color;
}
`;

////////////////////////////////////////////////////////

const ISLAND_FRAGMENT_SHADER = `

varying vec3 v_Normal;
varying vec3 v_Pos;
varying vec2 vertexUV;

uniform vec3 uGreen;
uniform vec3 uBlue;

uniform sampler2D islandTexture;
uniform sampler2D islandStoneTexture;

const float _TRI_SCALE = 100.0;

void main() {
    vec3 color;

    vec3 n = v_Normal;
    float R = n[0];
    float G = n[1];
    float B = n[2];
    float lum = (abs(R) + abs(G) + abs(B))/3.0;
    // float dotProd = dot(v_Normal, uBlue);

    if (v_Pos[2] == 0.0) {
        discard;
    }

    if (n[0] == 0.0 && n[1] == 0.0 && n[2] == 1.0 && v_Pos[2] == 0.0) {
        discard;
    } 
    // else if (v_Pos[2] > 2.0) {
    //   color = texture2D(islandTexture, vec2(0, v_Pos[2]/50.0)).rgb;

    //   // if (n[2] < 0.55) { 
    //   //   gl_FragColor = texture2D(islandTexture, vec2(0, v_Pos[2]/100.0)); //vec4(uGreen * lum, 1);
    //   // } 
    //   // else {
    //   //   gl_FragColor = vec4(uGreen * lum, 1);
    //   // }
    // } else {
    //   color = texture2D(islandStoneTexture, vec2(0, v_Pos[2]/50.0)).rgb; //vec4(uBlue*lum, 1);
    // }
    float zpos = (v_Pos[2] + 50.0) / 150.0;
    color = texture2D(islandTexture, vec2(0, zpos)).rgb;
    gl_FragColor = vec4(color * lum, 1);
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

export const circle_constraint_material = function (color, isTerrain) {
  return new THREE.ShaderMaterial({
    uniforms: {
      RADIUS: {
        value: 499.5,
      },
      COLOR: {
        value: color,
      },
      terrainTexture: {
        value: new THREE.TextureLoader().load(
          "../../../public/models/daytime2.png"
        ),
      },
    },
    vertexShader: isTerrain ? TERRAIN_VERTEX_SHADER : STANDARD_VERTEX_SHADER,
    fragmentShader: isTerrain
      ? TERRAIN_CONSTRAINT_FRAGMENT_SHADER
      : CIRCULAR_CONSTRAINT_FRAGMENT_SHADER,
    side: THREE.DoubleSide,
    transparent: 1,
    depthWrite: true,
    flatShading: true,
  });
};

export const islandMaterial = new THREE.ShaderMaterial({
  uniforms: {
    islandTexture: {
      value: new THREE.TextureLoader().load(
        "../../../public/models/daytime2.png"
      ),
    },
    islandStoneTexture: {
      value: new THREE.TextureLoader().load(
        "../../../public/models/dirtTexture.png"
      ),
    },
    uGreen: {
      type: "c",
      value: STANDARD_PALLETE.terrain,
    },
    uBlue: {
      type: "c",
      value: STANDARD_PALLETE.water,

    }
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

export const toonShader = function (uniformInfo) {
  return new ShaderMaterial({
    lights: true,
    uniforms: { uniformInfo, ...THREE.UniformsLib.lights },
    vertexShader: TOON_VERTEX_SHADER,
    fragmentShader: TOON_FRAGMENT_SHADER,
  });
};
