import { CSS3DObject } from "../../lib/three/examples/jsm/renderers/CSS3DRenderer.js";
import { useApi } from '../api/Api.js';
import { ButtonComponent, DivComponent, FormComponent, InputComponent, LabelComponent, TextComponent } from '../core/components/Type.Component.js';
import { withEventHandlers } from '../core/components/UIComponent.Util.js';


function loginFormComponent() {
  const loginForm = new FormComponent( "loginForm", { class: "active" } );

  const header = new TextComponent( "loginHeader", { text: "Login", class: "loginRegisterHeader" } );

  // Email input group
  const emailGroup = new DivComponent( "emailGroup", { class: "input-group" } );
  const emailInput = new InputComponent( "loginEmail", { type: "email", required: true, placeholder: " " } );
  const emailLabel = new LabelComponent( "loginEmail", { text: "Email", for: "loginEmail" } );
  emailGroup.elements = [
    emailInput,
    emailLabel
  ]

  // Password input group
  const passwordGroup = new DivComponent( "passwordGroup", { class: "input-group" } );
  const passwordInput = new InputComponent( "loginPassword", { type: "password", required: true, placeholder: " " } );
  const passwordLabel = new LabelComponent( "loginPassword", { text: "Password", for: "loginPassword" } );
  passwordGroup.elements = [
    passwordInput,
    passwordLabel
  ]

  // Submit button
  const submitButton = new ButtonComponent( "submitBtn", { attributes: { type: "button" }, class: "submit-btn", label: "Login" } );

  withEventHandlers( submitButton, {
    onClick: () => {
      useApi().login( emailInput.value, passwordInput.value )
    }
  } );

  loginForm.elements = [
    header,
    emailGroup,
    passwordGroup,
    submitButton
  ]

  return loginForm;
}

export function createLoginForm() {
  const menuContainer = new DivComponent( "loginMenu", { object: new CSS3DObject(), class: "menu" } );

  const logo = new TextComponent( "42", { text: "42", class: "logo" } );

  // Swicht form
  const modeSwitch = new DivComponent( "modeSwitch", { class: "mode-switch" } );
  const loginButton = new ButtonComponent( "loginBtn", { class: "active", label: "Login" } );
  modeSwitch.elements = [
    loginButton,
  ]

  // hexagon
  const loginFrom = loginFormComponent();
  const octagon = new DivComponent( "octagon", { class: "octagon" } );
  const octagonInner = new DivComponent( "octagonInner", {
    class: "octagon-inner", elements: [
      loginFrom
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

  withEventHandlers( loginButton, {
    onClick: () => {
      octagonInner.elements = [
        loginFrom
      ]
      octagonInner.render();
    }
  } );

  menuContainer.transitionIn = () => {
    menuContainer._object.position.set( 0, 0, -500 );
  }

  menuContainer.transitionOut = () => {
    menuContainer._object.position.set( 0, 0, -300 );
  }

  return menuContainer;
}
