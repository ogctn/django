export default class Entity {
  constructor( id ) {
    this.id = id;
    this.components = new Map();
  }
}