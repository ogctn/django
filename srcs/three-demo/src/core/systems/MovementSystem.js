import System from "../System.js";

export class MovementSystem extends System {
  constructor( config, positions, velocities ) {
    super( config );

    this.positions = positions;
    this.velocities = velocities;

    this.update = ( deltaTime ) => {
      for ( const [entityId, position] of this.positions.entries ) {
        const velocity = this.velocities.getComponent( entityId );
        if ( velocity ) {
          position.x += velocity.vx * deltaTime;
          position.y += velocity.vy * deltaTime;
        }
      }
    }
  }
}
