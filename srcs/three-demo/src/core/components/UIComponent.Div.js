import UIComponent from "./UIComponent.js";

export class DivComponent extends UIComponent {
  constructor( id, props = {} ) {
    super( id, props.styles, props.object, props.class );
    this.class = props.class || '';
    this.styles = props.styles || {};
    this._elements = props.elements || [];

    this.expectedListeners = () => ( {
      click: this.onClick,
      mouseenter: this.onMouseEnter,
      mouseleave: this.onMouseLeave,
    } );
  }

  /**
   * @param {UIComponent[]} elements
   */
  set elements( elements ) {
    this._elements = elements;
    this._rendered = false;
  }

  get elements() {
    return this._elements;
  }

  render() {
    if ( this._rendered ) {
      return this.element;
    }

    this.element = this.createMenuElement();

    if ( this._object )
      this._object.element = this.element;

    const menuElement = this.element

    this.applyStyles( menuElement );
    this.applyClasses( menuElement );

    menuElement.innerHTML = '';

    this._elements.forEach( ( child ) => {
      menuElement.appendChild( child.render() );
    } );

    if ( this.transitionIn ) {
      this.transitionIn( menuElement );
    }

    this.addEventListeners( menuElement, this.expectedListeners() );

    this._rendered = true;

    return menuElement;
  }

  createMenuElement() {
    const menuElement = document.createElement( "div" );
    menuElement.id = this.id;
    return menuElement;
  }

  addElement( element ) {
    this._elements.push( element );
  }

  removeElement( element ) {
    this._elements = this._elements?.filter( ( e ) => e !== element );
  }
}
