export default class QuerySystem {

  static instance = new QuerySystem();

  constructor() {
    this.componentManagers = {};
  }

  static registerComponentManager( componentManager ) {
    this.instance.componentManagers[componentManager.componentType] = componentManager;
  }

  static getComponents( entityId, componentTypes ) {
    return componentTypes.reduce( ( result, type ) => {
      const manager = this.instance.componentManagers[type];
      if ( manager ) {
        result[type] = manager.getComponent( entityId );
      }
      return result;
    }, {} );
  }

  static getComponentsByTypes( componentTypes ) {
    return componentTypes.reduce( ( result, type ) => {
      const manager = this.instance.componentManagers[type];
      if ( manager ) {
        result[type] = manager.entries;
      }
      return result;
    }, {} );
  }
}
