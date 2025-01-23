export class InputManager {
  constructor() {
    this.inputs = [];
  }

  getInputs() {
    const result = [...this.inputs];
    this.inputs = [];
    return result;
  }

  addInput( input ) {
    this.inputs.push( { timestamp: performance.now(), input } );
  }

  flush() {
    this.inputs = [];
  }
}
