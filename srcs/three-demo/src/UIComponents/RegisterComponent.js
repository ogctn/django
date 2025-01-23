import { CSS3DObject } from "../../lib/three/examples/jsm/renderers/CSS3DRenderer.js";
import { ButtonComponent, DivComponent, FormComponent, InputComponent, LabelComponent, TextComponent } from '../core/components/Type.Component.js';
import { withEventHandlers } from '../core/components/UIComponent.Util.js';

function registerFormComponent() {
  const registerForm = new FormComponent( "registerForm" );

  const header = new TextComponent( "registerHeader", { text: "Register", class: "loginRegisterHeader" } );

  // Username input group
  const usernameGroup = new DivComponent( "usernameGroup", { class: "input-group" } );
  const usernameInput = new InputComponent( "registerUsername", { type: "text", required: true, placeholder: " " } );
  const usernameLabel = new LabelComponent( "registerUsernameLabel", { text: "Username", for: "registerUsername" } );
  usernameGroup.elements = [
    usernameInput,
    usernameLabel
  ]

  // Email input group
  const emailGroup = new DivComponent( "emailGroup", { class: "input-group" } );
  const emailInput = new InputComponent( "registerEmail", { type: "email", required: true, placeholder: " " } );
  const emailLabel = new LabelComponent( "registerEmailLabel", { text: "Email", for: "registerEmail" } );
  emailGroup.elements = [
    emailInput,
    emailLabel
  ]

  // Password input group
  const passwordGroup = new DivComponent( "passwordGroup", { class: "input-group" } );
  const passwordInput = new InputComponent( "registerPassword", { type: "password", required: true, placeholder: " " } );
  const passwordLabel = new LabelComponent( "label", { text: "Password", for: "registerPassword" } );
  passwordGroup.elements = [
    passwordInput,
    passwordLabel
  ]

  // Submit button
  const submitButton = new ButtonComponent( "submitBtn", { attributes: { type: "button" }, class: "submit-btn", label: "Register" } );

  withEventHandlers( submitButton, {
    onClick: () => {
      useApi().register( emailInput.value, "email@gmail.com", passwordInput.value )
    }
  } );

  registerForm.elements = [
    header,
    usernameGroup,
    emailGroup,
    passwordGroup,
    submitButton
  ]

  return registerForm;
}

export function createRegisterForm() {

  const menuContainer = new DivComponent( "registerMenu", { object: new CSS3DObject(), class: "menu" } );

  const logo = new TextComponent( "42", { text: "42", class: "logo" } );

  // Swicht form
  const modeSwitch = new DivComponent( "modeSwitch", { class: "mode-switch" } );
  const registerButton = new ButtonComponent( "registerBtn", { label: "Register" } );
  modeSwitch.elements = [
    registerButton
  ]

  // hexagon
  const registerForm = registerFormComponent();
  const octagon = new DivComponent( "octagon", { class: "octagon" } );
  const octagonInner = new DivComponent( "octagonInner", {
    class: "octagon-inner", elements: [
      registerForm
    ]
  } );

  octagon.elements = [
    octagonInner
  ];

  menuContainer.elements = [
    logo,
    modeSwitch,
    octagon,
    new DivComponent( "authStatus", { class: "auth-status" } )
  ]

  withEventHandlers( registerButton, {
    onClick: () => {
      octagonInner.elements = [
        registerForm
      ]
      octagonInner.render();
    }
  } );

  menuContainer.transitionIn = () => {
    menuContainer._object.position.set( 0, 0, -500 );
  }

  menuContainer.transitionOut = () => {
    menuContainer._object.position.set( 0, 0, -1000 );
  }

  return menuContainer;
}








