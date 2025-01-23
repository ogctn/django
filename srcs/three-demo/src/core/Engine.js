import { ManagersMixin } from "./Engine.ManagersMixin.js";
import { SystemsMixin } from "./Engine.SystemsMixin.js";
import { OtherMixin, ThreeMixin } from "./Engine.ThreeMixin.js";
import { EnvironmentManager } from "./managers/EnvironmentManager.js";

/**
 * @class Engine
 * @classdesc The core engine of the game.
 * 
 * @mixes ThreeMixin
 * @mixes ManagersMixin
 * @mixes SystemsMixin
 */
export default class Engine {
  /**
   * 
   * @param {object} engineConfig - The configuration for the engine.
   * @param {string} engineConfig.socket - WebSocket connection string.
   * @param {object} engineConfig.systems - The HTML element to render the engine.
   * @param {HTMLElement} engineConfig.element - The HTML element to render the engine.
   * 
   * @property {HTMLElement} element
   * @property {Map<string, Function>} updateTasks
   * 
   */
  constructor( { element, config } ) {
    this.config = config;
    this.element = element;
    this.updateTasks = new Map();
    this.initThree();
    this.initManagers();
    this.initSystems();
    window.engine = this;
  }

  march() {
    this.loadConfig( this.config );
    const animate = () => {
      requestAnimationFrame( animate );
      this.#update();
    };

    this.activateAllSystems();
    animate();
  }

  setShip( ship ) {
    this.ship = ship;
  }

  getShip() {
    return this.ship;
  }

  /**
   * Updates active systems in order of priority.
   * @private
   */
  #update() {
    Object.values( this.systems )
      .filter( s => s.state === "active" )
      .sort( ( a, b ) => a.order - b.order )
      .forEach( ( system ) => system.update() );

    this.updateTasks.forEach( async ( task, key ) => task() );
  }

  setup() {
    this.setupThree();
    this.setupManagers();
    this.setupSystems();
  }

  loadConfig( config ) {

    if ( !config ) {
      throw Error( `Engine: The config is ${config}. You joking?` );
    }
    const envmgr = this.getManager( EnvironmentManager );
    envmgr.loadScenes( config.scenes );
  }
}

Object.assign( Engine.prototype, ThreeMixin, ManagersMixin, SystemsMixin, OtherMixin );
