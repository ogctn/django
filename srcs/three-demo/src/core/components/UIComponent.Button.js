import UIComponent from "./UIComponent.js";

export class ButtonComponent extends UIComponent {
  constructor( id, props = {} ) {
    super( id, props.styles, props.class);
    this.label = props.label;
    this.styles = props.styles;
    this.attributes = props.attributes;
    this.class = props.class || '';

    this.expectedListeners = () => ({
      click: this.onClick,
      mouseenter: this.onMouseEnter,
      mouseleave: this.onMouseLeave,
    });
  }

  render() {
    if ( this.element ) {
      return this.element;
    }

    const buttonElement = document.createElement( "button" );

    this.element = buttonElement;

    buttonElement.id = this.id;
    buttonElement.innerText = this.label;

    this.applyStyles( buttonElement );
    this.applyClasses(buttonElement);
    this.applyAttributes(buttonElement);

    if ( this.transitionIn ) {
      this.transitionIn( buttonElement );
    }

    this.addEventListeners( buttonElement, this.expectedListeners() );

    return buttonElement;
  }

}
