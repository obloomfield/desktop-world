import * as THREE from "three";

const STANDARD_VERTEX_SHADER = `
varying vec3 v_Normal;
varying vec3 v_Pos;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_Normal = normal;
    v_Pos = position;
}
`;

const CIRCULAR_CONSTRAINT_FRAGMENT_SHADER = `
varying vec3 v_Normal;
varying vec3 v_Pos;

uniform float RADIUS;
uniform vec4 COLOR;

void main() {
  if (distance(v_Pos,vec3(0,0,0)) > RADIUS) {
    discard;
  }
  gl_FragColor = COLOR;
}
`;

export const circle_constraint_material = function (color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      RADIUS: {
        value: 500,
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
