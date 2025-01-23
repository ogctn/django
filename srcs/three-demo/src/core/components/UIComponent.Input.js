import UIComponent from "./UIComponent.js";

export class InputComponent extends UIComponent {
  constructor( id, props = {} ) {
    super( id, props.styles, props.class );
    this.placeholder = props.placeholder || "";
    this.value = props.value || "";
    this.type = props.type || "text";

    this.expectedListeners = {
      change: this.onChange.bind( this ),
      focus: this.onFocus,
      blur: this.onBlur,
    };
  }

  onChange( event ) {
    this._value = event.target.value;
  }

  set value( value ) {
    this._value = value;
    if ( this._element ) {
      this._element.value = value;
    }
  }

  get value() {
    return this._value;
  }

  render() {
    if ( this._element ) {
      return this._element;
    }

    const inputElement = document.createElement( "input" );

    this._element = inputElement;

    inputElement.id = this.id;
    inputElement.type = this.type;
    inputElement.placeholder = this.placeholder;
    inputElement._value = this._value;

    this.applyStyles( inputElement );
    this.applyClasses( inputElement );

    if ( this.transitionIn ) {
      this.transitionIn( inputElement );
    }

    this.addEventListeners( inputElement, this.expectedListeners );

    return inputElement;
  }
}
