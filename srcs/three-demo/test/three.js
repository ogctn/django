import { FlyControls } from "../lib/three/examples/jsm/controls/FlyControls.js";
import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from "../lib/three/three.module.min.js";

export function initThree() {
  const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  const renderer = new WebGLRenderer( { precision: "highp" } );
  const controls = new FlyControls( camera, renderer.domElement );
  const scene = new Scene();

  const clock = new Clock();

  window.addEventListener( "resize", () => updateSizes( camera, renderer ) );

  camera.far = 1000000;
  camera.near = 0.00001;
  camera.lookAt( 0, 0, 0 );

  controls.enabled = true;
  controls.autoForward = false;
  controls.domElement = renderer.domElement;
  controls.dragToLook = true;
  controls.movementSpeed = 5000;
  controls.rollSpeed = Math.PI / 6;
  scene.add( camera );

  clock.start();

  // const composer = initComposer( renderer, scene, camera );

  return { camera, renderer, controls, scene, clock, composer: null };
}

export function updateSizes( camera, renderer ) {
  const { width, height } = document.body.getBoundingClientRect();

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );
  renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
}

// function initComposer( renderer, scene, camera ) {
//   const composer = new EffectComposer( renderer );

//   // Render the scene normally
//   const renderPass = new RenderPass( scene, camera );
//   composer.addPass( renderPass );

//   const lensingShader = {
//     vertexShader: vertex,
//     fragmentShader: fragment,
//     uniforms: {
//       tDiffuse: { value: null },
//       blackHoleCenter: { value: new Vector2( 0.5, 0.5 ) },
//       lensStrength: { value: 0.05 },
//     },
//   };

//   // Apply the lensing effect
//   const lensPass = new ShaderPass( lensingShader );
//   composer.addPass( lensPass );

//   // Adjust lens center dynamically in the animation loop
//   lensPass.uniforms.blackHoleCenter.value.set( 0.5, 0.5 ); // Centered by default

//   return composer;
// }
