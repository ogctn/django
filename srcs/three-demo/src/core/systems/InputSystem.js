import Engine from "../Engine.js";
import { InputManager } from "../managers/InputManager.js";
import { WebSocketManager } from "../managers/WebSocketManager.js";
import System from "../System.js";

/**
 * 
 * @property {InputManager} inputManager 
 */
class InputSystem extends System {

  /**
   * 
   * @param {object} config 
   * @param {Engine} engine
   * 
   */
  constructor( config, engine ) {
    super( config );
    this.state = "passive"
    this.engine = engine;
    this.inputManager = this.engine.getManager( InputManager );
    this.websocketManager = this.engine.getManager( WebSocketManager );

    this.update = () => {
      const input = this.inputManager.getInputs();
      if ( input ) {
        this.websocketManager.send( input )
      }
    }
  }

  activate() {
    this.inputManager.flush();
  }
}

export default InputSystem;