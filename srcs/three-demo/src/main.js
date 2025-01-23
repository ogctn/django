import { Game } from "./Game.js";

export class App extends HTMLElement {
  constructor() {
    super();
    this._game = new Game( this );

    this._createMenus()
  }

  _createMenus() {
    return ([
      
    ])
  }
}

customElements.define( "ft-transcendence", App );
