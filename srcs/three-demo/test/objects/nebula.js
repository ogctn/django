import { BackSide, Mesh, ShaderMaterial, SphereGeometry } from "three";

export function initNebula() {
  const nebulaMaterial = new ShaderMaterial( {
    vertexShader: `
        varying vec3 vPosition;
        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec3 vPosition;

        // Simple noise function
        float noise(vec3 p) {
            return fract(sin(dot(p, vec3(12.9898, 78.233, 128.852))) * 43758.5453);
        }

        void main() {
            vec3 pos = vPosition + vec3(0.0, 0.0, -time);
            float nebula = noise(pos * 0.1) * 0.5; // Nebula noise
            vec3 nebulaColor = mix(vec3(0.1, 0.0, 0.2), vec3(0.8, 0.4, 1.0), nebula);

            gl_FragColor = vec4(nebulaColor, nebula);
        }
    `,
    uniforms: {
      time: { value: 0 }
    },
    side: BackSide,
    transparent: true
  } );

  const nebulaGeometry = new SphereGeometry( 500, 64, 64 );
  return new Mesh( nebulaGeometry, nebulaMaterial );

}