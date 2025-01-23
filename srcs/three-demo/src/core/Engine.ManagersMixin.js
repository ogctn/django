import { AssetManager } from "./managers/AssetManager.js";
import { ComponentManager } from "./managers/ComponentManager.js";
import { EntityManager } from "./managers/EntityManager.js";
import { EnvironmentManager } from "./managers/EnvironmentManager.js";
import { InputManager } from "./managers/InputManager.js";
import { MenuManager } from "./managers/MenuManager.js";
import { ProcedureManager } from "./managers/ProcedureManager.js";
import { WebSocketManager } from "./managers/WebSocketManager.js";

export const ManagersMixin = {

  initManagers() {
    this.managers = {};
  },

  addManager( manager ) {
    const key = manager.componentType || manager.constructor.name;
    this.managers[key] = manager;
  },

  removeManager( manager ) {
    delete this.managers[manager.constructor.name];
  },

  getManager( name ) {
    return this.managers[name instanceof Function ? name.name : name];
  },

  setupManagers() {
    this.addManager( new EntityManager() );
    this.addManager( new MenuManager( this.three.Camera ) );
    this.addManager( new ProcedureManager( this ) );
    this.addManager( new InputManager() );
    this.addManager( new AssetManager() );
    this.addManager( new EnvironmentManager( this ) );
    this.addManager( new WebSocketManager( this ) );
    this.addManager( new ComponentManager( "AssetComponent" ) );
    this.addManager( new ComponentManager( "PositionComponent" ) );
    this.addManager( new ComponentManager( "VelocityComponent" ) );
  },
}
