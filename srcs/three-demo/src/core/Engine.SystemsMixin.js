import SystemConfig from "./config/SystemConfig.js";
import { MenuManager } from "./managers/MenuManager.js";
import InputSystem from "./systems/InputSystem.js";
import { MovementSystem } from "./systems/MovementSystem.js";
import { RenderingSystem } from "./systems/RenderingSystem.js";
import { SynchronizationSystem } from "./systems/SyncronizationSystem.js";
import { UISystem } from "./systems/UISystem.js";

export const SystemsMixin = {

  initSystems() {
    this.systems = {};
    this._systemConfigs = SystemConfig;
  },

  activateAllSystems() {
    Object.values( this.systems ).forEach( system => system.activate() );
  },

  addSystem( system ) {
    this.systems[system.constructor.name] = system;
  },

  removeSystem( system ) {
    delete this.systems[system.constructor.name];
  },

  getSystem( name ) {
    return this.systems[name instanceof Function ? name.name : name];
  },

  setupSystems() {
    this.addSystem( new UISystem( this._systemConfigs[UISystem.name], this.getManager( MenuManager ) ) );
    this.addSystem( new MovementSystem( this._systemConfigs[MovementSystem.name], this.getManager( "AssetComponent" ), this.getManager( "VelocityComponent" ) ) );
    this.addSystem( new RenderingSystem( this._systemConfigs[RenderingSystem.name], this ) );
    this.addSystem( new SynchronizationSystem( this._systemConfigs[SynchronizationSystem.name], this ) );
    this.addSystem( new InputSystem( this._systemConfigs[InputSystem.name], this ) )
  },
}