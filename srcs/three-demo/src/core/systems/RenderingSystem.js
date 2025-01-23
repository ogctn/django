import Engine from "../Engine.js";
import System from "../System.js";

export class RenderingSystem extends System {

  /**
   * 
   * @param {Engine} engine 
   */
  constructor( config, engine ) {
    // super( SystemConfig.RenderingSystem );
    super( config );

    this.engine = engine;

    this.update = () => {
      const camera = this.engine.getThree( "Camera" );
      const scene = this.engine.getThree( "Scene" );
      this.engine.getThree( "CustomFlyControls" ).update( this.engine.getThree( "Clock" ).getDelta() );
      this.engine.getThree( "WebGLRenderer" ).render( scene, camera );
      this.engine.getThree( "CSS3DRenderer" ).render( scene, camera );
    }
  }
}
