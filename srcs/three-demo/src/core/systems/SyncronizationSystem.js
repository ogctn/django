import Engine from "../../core/Engine.js";
import System from "../System.js";
import { Events, EventSystem } from "./EventSystem.js";

export class SynchronizationSystem extends System {
  /**
   * 
   * @param {Engine} engine
   */
  constructor( config, engine ) {
    // super( SystemConfig.SynchronizationSystem );
    super( config );

    this.engine = engine;
    this.positionManager = engine.getManager( "PositionComponent" );
    this.velocityManager = engine.getManager( "VelocityComponent" );
    EventSystem.on( Events.SERVER_UPDATE, this.update.bind( this ) )
  }

  update( serverState ) {

    if ( !serverState ) {
      return;
    }

    for ( const entity of Object.keys( serverState ) ) {
      const state = serverState[entity];
      const position = this.positionManager.getComponent( parseInt( entity ) );
      const velocity = this.velocityManager.getComponent( parseInt( entity ) );

      if ( position ) {
        position.x = state.position.x;
        position.y = state.position.y;
        position.z = state.position.z;
      }

      if ( velocity ) {
        velocity.vx = state.velocity.vx;
        velocity.vy = state.velocity.vy;
        velocity.vz = state.velocity.vz;
      }
    }
  }
}
