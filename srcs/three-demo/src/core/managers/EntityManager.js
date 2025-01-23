import Entity from "../Entity.js";

export class EntityManager {
  constructor() {
    this.nextId = 0;
    this.entities = new Map();
  }

  createEntity() {
    const entity = new Entity( this.nextId++ );
    this.entities.set( entity.id, entity );
    return entity;
  }

  removeEntity( entity ) {
    this.entities.delete( entity.id );
  }

  getEntity( id ) {
    return this.entities.get( id );
  }
}
