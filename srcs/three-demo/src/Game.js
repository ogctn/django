import { gameConfig } from "./config/GameConfig.js";
import Engine from "./core/Engine.js";
import { EnvironmentManager } from "./core/managers/EnvironmentManager.js";
import { MenuManager } from "./core/managers/MenuManager.js";
import { Procedure, ProcedureManager } from "./core/managers/ProcedureManager.js";
import { gameProcedure } from "./procedures/InitGame.js";
import { testProcedure, testProcedure2 } from "./procedures/TestProcedure.js";

/**
 * @class Game
 * 
 * @typedef {Object} GameConfig
 * 
 */
export class Game {

  /**
   * @param {HtmlElement} element
   * 
   * @property {HTMLElement} element
   * @property {Engine} engine
   * @property {ProcedureManager} procedureManager
   */
  constructor( element ) {
    this.engine = new Engine( { element, config: gameConfig } );
    document.addEventListener( "DOMContentLoaded", this.start.bind( this ) );
  }

  start() {
    this.engine.setup();
    this.engine.march();

    const procedure = new Procedure( testProcedure );
    const procedure2 = new Procedure( testProcedure2 );

    this.engine.getManager( EnvironmentManager ).setActiveScene( "Match" );

    this.procedureManager = this.engine.getManager( ProcedureManager );

    const proc = new Procedure( gameProcedure );
    this.procedureManager.addProcedure( proc );
    // setTimeout( () => {
    //   this.procedureManager.addProcedure( procedure, true );

    // }, 2000 );
  }

  addMenu( menu ) {
    this.engine.getManager( MenuManager )?.menuManager.addMenu( menu );
  }


}
