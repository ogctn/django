import { initCompassScene } from "./compass";
import { updateVisibleChunks } from "./objects/chunks";
import { initThree, updateSizes } from "./three";

// const nebula = initNebula();

// scene.add( nebula );

function animate( opts ) {
  const { camera, renderer, controls, scene, clock, composer } = opts;
  const { compassScene, compassCamera, compassAxes } = opts;

  requestAnimationFrame( () => animate( opts ) );

  const delta = clock.getDelta();

  // nebula.material.uniforms.time.value += delta;
  updateVisibleChunks( camera, scene, clock );

  controls.update( delta );

  // 1) Render the MAIN scene over the full window
  renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
  renderer.setScissor( 0, 0, window.innerWidth, window.innerHeight );
  renderer.setScissorTest( true );
  renderer.render( scene, camera );

  // 2) Render the COMPASS scene in a small corner overlay
  const compassSize = 150;
  const offset = 10;
  const x = window.innerWidth - compassSize - offset;
  const y = offset;

  renderer.setViewport( x, y, compassSize, compassSize );
  renderer.setScissor( x, y, compassSize, compassSize );
  renderer.setScissorTest( true );

  // Align compass rotation to main camera (one simple way):
  compassAxes.quaternion.copy( camera.quaternion );

  renderer.render( compassScene, compassCamera );

  // Turn off scissor test to avoid messing up anything else
  renderer.setScissorTest( false );
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const { camera, renderer, controls, scene, clock, composer } = initThree();
    const { compassScene, compassCamera, compassAxes } = initCompassScene();

    animate( {
      camera, renderer, controls, scene, clock, composer,
      compassScene, compassCamera, compassAxes
    } );
    updateSizes( camera, renderer );
    document.body.appendChild( renderer.domElement );
  },
  { once: true }
);

