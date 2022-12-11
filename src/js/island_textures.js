import * as THREE from "three";

const vShader = `

varying vec3 v_Normal;
varying vec3 v_Pos;
varying vec2 vertexUV;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_Normal = normal;
    v_Pos = position;
    vertexUV = uv;
}
`

const fShader = `

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
`

export const islandMaterial = new THREE.ShaderMaterial({
    uniforms: {
        islandTexture : {
            value : new THREE.TextureLoader().load('../models/texturetest.jpeg')
        }
    },
    vertexShader: vShader,
    fragmentShader: fShader
});
islandMaterial.opacity = 0;
islandMaterial.transparent = 1;
islandMaterial.side = THREE.DoubleSide;
islandMaterial.depthWrite = true;
// islandMaterial.depthTest = 