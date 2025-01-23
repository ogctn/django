const INTERVAL_MIN = 1000 / 120;
const INTERVAL_MAX = 1000 / 0;

/**
 * @class ProcedureManager
 * 
 * @typedef {import("../Engine").default} Engine
 * 
 * @property {Engine} engine
 * @property {Map<number, {procedure: Procedure, collectedRequirements: any}>} procedures
 */
export class ProcedureManager {
  #nextProcedureId = 0;
  procedures;

  /**
   * @param {Engine} engine
   * @param {Map<number, {procedure: Procedure, collectedRequirements: any}>} procedures
   */
  constructor( engine, procedures = new Map() ) {
    this.engine = engine;
    this.procedures = procedures;
  }

  /**
   * @param {Procedure} procedure to add
   * @param {boolean} startOnAdd should the procedure start immediately
   */
  addProcedure( procedure, startOnAdd = false ) {

    const { requirements } = procedure;

    let collectedRequirements;

    try {
      console.log( `Collecting requirements for procedure: ${procedure.name}` );
      collectedRequirements = this.collectRequirements( requirements );
    } catch ( error ) {
      procedure.state = "error";
      console.error( `Error collecting requirements for procedure: ${procedure.name}` );
      console.error( error );

      return null;
    }

    try {
      procedure.id = this.#nextProcedureId++;
    } catch ( error ) {
      procedure.state = "error";
      console.error( `Error setting id for procedure: ${procedure.name}` );
      console.error( error );

      return null;
    }

    console.log( `Adding procedure: ${procedure.name}` );

    this.procedures.set( procedure.id, { procedure, collectedRequirements } );

    if ( startOnAdd ) {
      this.startProcedure( procedure.id );
    }
  }

  startProcedure( procedureId ) {

    const entry = this.procedures.get( procedureId );

    if ( entry ) {

      console.log( `Starting procedure: ${procedureId} with name ${entry.procedure.name}` );
      try {
        entry.procedure.state = "running";
        entry.procedure.start( entry.collectedRequirements );
      } catch ( error ) {
        entry.procedure.state = "error";
        console.error( `Error starting procedure: ${procedureId} with name ${entry.procedure.name}` );
        console.error( error );
      }

      if ( entry.procedure.update ) {
        this.engine.updateTasks.set( "Procedure_" + entry.procedure.name, this.updateProcedure.bind( this, procedureId ) );
      }
    }
  }

  updateProcedure( procedureId ) {
    const entry = this.procedures.get( procedureId );
    if ( entry ) {
      try {
        entry.procedure.update( entry.collectedRequirements );
      } catch ( error ) {
        entry.procedure.state = "error";
        console.error( `Error updating procedure: ${procedureId} with name ${entry.procedure.name}` );
        console.error( error );
      }
    }
  }

  endProcedure( procedureId ) {
    const entry = this.procedures.get( procedureId );
    if ( entry ) {

      console.log( `Ending procedure: ${procedureId} with name ${entry.procedure.name}` );

      try {
        entry.procedure.end( entry.collectedRequirements );
      } catch ( error ) {
        entry.procedure.state = "error";
        console.error( `Error ending procedure: ${procedureId} with name ${entry.procedure.name}` );
        console.error( error );
      }

      this.procedures.delete( entry );
      this.engine.updateTasks.delete( "Procedure_" + entry.procedure.name );
    }
  }

  collectRequirements( requirements ) {
    if ( !requirements )
      return {};
    return {
      managers: this.getRequiredItems( this.engine.managers, requirements.managers ),
      three: this.getRequiredItems( this.engine.three, requirements.three ),
      systems: this.getRequiredItems( this.engine.systems, requirements.systems ),
      engine: this.getRequiredItems( this.engine, requirements.engine )
    };
  }

  getRequiredItems( collection, keys ) {
    if ( !keys ) return {};
    return keys.reduce( ( acc, key ) => {
      if ( collection[key] ) {
        acc[key] = collection[key];
        if ( acc[key] instanceof Function ) {
          acc[key] = acc[key].bind( collection );
        }
      }
      return acc;
    }, {} );
  }
}

/**
 * @global
 * @typedef {{
 *   managers: string[],
 *   three: string[],
 *   systems: string[],
 *   engine: string[]
 * }} ProcedureRequirements
 * 
 * @global
 * @typedef {{
 *  name: string,
 *  requirements: ProcedureRequirements,
 *  start: () => void,
 *  update: () => void,
 *  end: () => void,
 *  timeout: number,
 *  interval: number
 * }} ProcedureConfig
 */
export class Procedure {
  #id = undefined;
  /**
   * @type {"idle" | "loading" | "running" | "ended" | "error"}
   */
  #state;
  #name;
  #requirements;
  #start;
  #update;
  #end;
  #timeout;
  #interval;
  #lastUpdate

  /**
   * 
   * @param {ProcedureConfig} param
   */
  constructor( {
    name = `unnamed-${crypto.randomUUID()}`,
    requirements,
    start,
    update,
    end,
    timeout,
    interval = 30
  } ) {
    this.#state = "idle";
    this.#name = name;
    this.#requirements = requirements;
    this.#start = start;
    this.#update = update;
    this.#end = end;
    this.#timeout = timeout;
    this.#interval = interval;
    this.#lastUpdate = 0;
  }

  get state() {
    return this.#state;
  }

  set state( val ) {
    this.#state = val;
  }

  get id() {
    return this.#id;
  }

  set id( val ) {
    if ( this.#id != undefined )
      throw new Error( "Procedure id has already been set" );
    this.#id = val;
  }

  /**
   * @param {string} val
   * @throws {Error} if process have already been loaded
   */
  set name( val ) {
    if ( this.#state != "idle" )
      throw new Error( "Procedure has already been loaded" );
    this.#name = val;
  }

  get name() {
    return this.#name;
  }

  /**
   * @param {ProcedureRequirements} val
   * @throws {Error} if process have already been loaded
   */
  set requirements( val ) {
    if ( this.#state != "idle" )
      throw new Error( "Procedure has already been loaded" );
    this.#requirements = val;
  }

  get requirements() {
    return Object.freeze( this.#requirements );
  }

  /**
   * @param {(requirements: ProcedureRequirements) => void} val
   * @throws {Error} if process have already been loaded
   */
  set start( val ) {
    if ( this.#state != "idle" )
      throw new Error( "Procedure has already been loaded" );
    this.#start = val;
  }

  get start() {
    return this.#start;
  }

  /**
   * @param {(requirements: ProcedureRequirements) => void} val
   * @throws {Error} if process have already been loaded
   */
  set update( val ) {
    if ( this.#state != "idle" )
      throw new Error( "Procedure has already been loaded" );
    this.#update = val;
  }

  get update() {
    return this._performUpdate.bind( this );
  }

  /**
   * @param {(requirements: ProcedureRequirements) => void} val
   * @throws {Error} if process have already been loaded
   */
  set end( val ) {
    if ( this.#state != "idle" )
      throw new Error( "Procedure has already been loaded" );
    this.#end = val;
  }

  get end() {
    return this.#end;
  }

  get timeout() {
    return this.#timeout;
  }

  /**
   * @param {number} val
   * @throws {Error} if process have already been loaded
   */
  set timeout( val ) {
    if ( this.#state != "idle" )
      throw new Error( "Procedure has already been loaded" );
    this.#timeout = val;
  }

  get interval() {
    return this.#interval;
  }

  set interval( val ) {
    if ( val < INTERVAL_MIN || val > INTERVAL_MAX )
      throw new Error( "Interval must be between ( 1000 / 0 ) and ( 1000 / 120 )" );
    this.#interval = val;
  }

  /**
   * 
   * @param {ProcedureRequirements} collectedRequirements 
   * @returns {void}
   */
  _performUpdate( collectedRequirements ) {
    if ( this.#state != "running" )
      return;
    const now = performance.now();
    if ( now - this.#lastUpdate >= this.#interval ) {
      this.#update( collectedRequirements );
      this.#lastUpdate = now;
    }
  }
}
