import Engine from "../Engine.js";
import { Events, EventSystem } from "../systems/EventSystem.js";

export class WebSocketManager {

  /**
   * 
   * @param {Engine} engine
   * 
   */
  constructor( engine ) {
    this.engine = engine;
    this.url = engine.config.wssUrl;
    console.log( "trying ws" );
    this.websocket = new WebSocket( engine.config.wssUrl );
    this.websocket.onopen = () => console.log( 'Connected to server via WSS' );
    this.websocket.onmessage = this.onMessage;
    this.websocket.onerror = ( event ) => console.error( 'WebSocket error:', event );
    this.websocket.onclose = () => console.log( 'Disconnected from server' );
  }

  onMessage( event ) {
    try {
      const data = JSON.parse( event.data );
      EventSystem.emit( Events.SERVER_UPDATE, data );
      this.messageHandlers[data.type]( data );
    } catch ( err ) {
      console.error( 'Error parsing server message:', err );
    }
  }

  send( data ) {
    if ( this.websocket.readyState === WebSocket.OPEN ) {
      this.websocket.send( JSON.stringify( data ) );
    } else {
      console.warn( 'WebSocket is not open. Unable to send data.' );
    }
  }

  reconnect() {
    console.log( 'Attempting to reconnect...' );
    this.websocket = new WebSocket( this.url );
    this.websocket.onopen = () => console.log( 'Reconnected to server via WSS' );
    this.websocket.onmessage = ( event ) => this.onMessage( event );
    this.websocket.onerror = ( event ) => console.error( 'WebSocket error:', event );
    this.websocket.onclose = () => setTimeout( () => this.reconnect(), 500 );
  }
}
