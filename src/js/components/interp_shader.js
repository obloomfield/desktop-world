import * as THREE from "three";

export function vertShader() {
    return `
    varying vec2 vUv;

    void main()	{
      // projectionMatrix, modelViewMatrix, position -> passed in from Three.js

      vUv = uv;
      gl_Position = projectionMatrix
        * modelViewMatrix
        * vec4(position.x, position.y, position.z, 1.0);
    }
    `
    
}



export function fragShader() {
    return `
    uniform float u_time;
    uniform vec4 color_1;
    uniform vec4 color_2;

    uniform sampler2D baseTexture;
		uniform sampler2D bloomTexture;

		varying vec2 vUv;

    void main() {

      float alpha = sin(u_time);
      float red = clamp(color_1[0]*alpha + color_2[0]*(1.0-alpha),0.0,1.0);
      float green = clamp(color_1[1]*alpha + color_2[1]*(1.0-alpha),0.0,1.0);
      float blue = clamp(color_1[2]*alpha + color_2[2]*(1.0-alpha),0.0,1.0);
      
      gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

      
    }
    `
}

//inter shader uniforms 
const clock = new THREE.Clock();
export const uniformData = {
  u_time: {
    type: 'f',
    value: clock.getElapsedTime(),

  },
  color_1: {
      value: new THREE.Vector4(0.25,0.69,0.86)
  },
  color_2: {
      value: new THREE.Vector4(0.34,0.47,0.91)
  },
  baseTexture: { value: null },
	bloomTexture: { value: null }
};






   