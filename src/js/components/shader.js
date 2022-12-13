import * as THREE from "three";
import { ShaderMaterial } from "three";

import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const STANDARD_VERTEX_SHADER = `

varying vec3 v_Normal;
varying vec3 v_Pos;
varying vec3 v_ViewDir;
varying vec2 vertexUV;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_Normal = normal;
    v_Pos = position;
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    v_ViewDir = normalize(-view.xyz);
    vertexUV = uv;
}
`;

////////////////////////////////////////////////////////

const TOON_VERTEX_SHADER = `
#include <common>
#include <shadowmap_pars_vertex>

varying vec3 v_Normal;
varying vec3 v_ViewDir;
varying vec3 v_Pos;

void main() {
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>

    #include <begin_vertex>

    #include <worldpos_vertex>
    #include <shadowmap_vertex>

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 clipPosition = projectionMatrix * viewPosition;

    v_Normal = normalize(normalMatrix * normal);
    v_Pos = position;
    v_ViewDir = normalize(-viewPosition.xyz);

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
uniform bool rad_constraint;
uniform float RADIUS;

varying vec3 v_Normal;
varying vec3 v_Pos;
varying vec2 vertexUV;
varying vec3 v_ViewDir;

// for spot lights: (NOT WORKING :( ))
// void main() {
// //     // shadow map
// //     // gl_FragColor = vec4(0,NUM_SPOT_LIGHTS,0,1);

//     SpotLightShadow spotLight = spotLightShadows[0];

//     float shadow = getShadow(
//         spotShadowMap[0],
//         spotLight.shadowMapSize,
//         spotLight.shadowBias,
//         spotLight.shadowRadius,
//         vSpotShadowCoord[0]
//     );

//     // spot light
//     // float NdotL = dot(v_Normal, spotLights[0].direction);
//     // float lightIntensity = smoothstep(0.0, 0.01, NdotL * shadow);
//     // vec3 light = spotLights[0].color * lightIntensity;

//     // // specular light
//     // vec3 halfVector = normalize(spotLights[0].direction + v_ViewDir);
//     // float NdotH = dot(v_Normal, halfVector);

//     // float specularIntensity = pow(NdotH * lightIntensity, uGlossiness * uGlossiness);
//     // float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);

//     // vec3 specular = specularIntensitySmooth * spotLights[0].color;

//     // // rim lighting
//     // float rimDot = 1.0 - dot(v_ViewDir, v_Normal);
//     // float rimAmount = 0.6;

//     // float rimThreshold = 0.2;
//     // float rimIntensity = rimDot * pow(NdotL, rimThreshold);
//     // rimIntensity = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);

//     // vec3 rim = rimIntensity * spotLights[0].color;

//     // gl_FragColor = vec4(uColor * (ambientLightColor + light + specular + rim), 1.0);
//     gl_FragColor = vec4(1,0,0,1);
//     }

    // DIRECTIONAL LIGHTS
    void main() {
      // shadow map

      gl_FragColor = vec4(1,0,0,1);
      if (distance(v_Pos,vec3(0,0,0)) > RADIUS) {
        discard;
      }

      DirectionalLightShadow directionalLight = directionalLightShadows[0];
  
      float shadow = getShadow(
          directionalShadowMap[0],
          directionalLight.shadowMapSize,
          directionalLight.shadowBias,
          directionalLight.shadowRadius,
          vDirectionalShadowCoord[0]
      );
  
      // directional light
      float NdotL = dot(v_Normal, directionalLights[0].direction);
      float lightIntensity = smoothstep(0.0, 0.01, NdotL * shadow);
      vec3 light = directionalLights[0].color * lightIntensity;
  
      // specular light
      vec3 halfVector = normalize(directionalLights[0].direction + v_ViewDir);
      float NdotH = dot(v_Normal, halfVector);
  
      float specularIntensity = pow(NdotH * lightIntensity, uGlossiness * uGlossiness);
      float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);
  
      vec3 specular = specularIntensitySmooth * directionalLights[0].color;
  
      // rim lighting
      float rimDot = 1.0 - dot(v_ViewDir, v_Normal);
      float rimAmount = 0.8;
  
      float rimThreshold = 0.2;
      float rimIntensity = rimDot * pow(NdotL, rimThreshold);
      rimIntensity = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);
  
      vec3 rim = rimIntensity * directionalLights[0].color;
  
      float dampening = (abs(v_Normal[0]) + abs(v_Normal[1]) + abs(v_Normal[2]))/3.0;
      // dampening = smoothstep(0.0, 0.5,lum);
      // dampening = 0.6;
      dampening = 1.0;

      gl_FragColor = vec4(dampening*uColor * (ambientLightColor + light + specular + rim), 1.0);
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
        // gl_FragColor = vec4(0,0,0,0);
    } else if (v_Pos[2] >= 0.0) {
        gl_FragColor = vec4(vec3(0,1,0) * lum, 1);
    } else {
        if (abs(n[2]) < .12) {
            // gl_FragColor = _Triplanar_UV(v_Pos, v_Normal); //texture2D(islandTexture, vertexUV);
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

export const toonShader = function (uniformInfo) {
  return new ShaderMaterial({
    lights: true,
    uniforms: {
      uniformInfo,
      ...THREE.UniformsLib.lights,
      uColor: { value: uniformInfo.color },
      uGlossiness: { value: 10 },
      RADIUS: { value: 499.5 },
    },
    vertexShader: TOON_VERTEX_SHADER,
    fragmentShader: TOON_FRAGMENT_SHADER,
  });
};
