/**
 * System class
 * 
 * @class System
 */
export default class System {

  /**
   * 
   * @param {{order: number, interval: number}} config
   * 
   * @property {"passive" | "active" | "crashed"} state
   * 
   */
  constructor( config ) {
    this.order = config.order;
    this.interval = config.interval;
    this.lastUpdate = 0;
    this.state = "passive";
  }

  set update( fn ) {
    this._update = fn;
  }

  get update() {
    return this.performUpdate.bind( this );
  }

  activate() {
    this.state = "active";
  }

  performUpdate() {
    if ( this.state != "active" ) return;
    const now = performance.now();
    if ( now - this.lastUpdate >= this.interval ) {
      this._update( this.interval );
      this.lastUpdate = now;
    }
  }
}
