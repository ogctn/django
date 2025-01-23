import { createLoginForm } from "../UIComponents/LoginComponent.js";
import { createRegisterForm } from "../UIComponents/RegisterComponent.js";

export const testProcedure = {
  name: "Test Procedure",
  requirements: {
    managers: ["MenuManager"],
    engine: ["setInteractionCanvas"]
  },
  start: ( { managers, engine } ) => {
    const { MenuManager } = managers;
    const { setInteractionCanvas } = engine;

    const menu = createLoginForm();

    MenuManager.addMenu( menu );
    MenuManager.switchMenu( menu.id );
    setInteractionCanvas( "css3d" );
  },
  end: ( { managers, engine } ) => {
    const { MenuManager } = managers;
    const { setInteractionCanvas } = engine;

    MenuManager.setActiveMenu( null );
    setInteractionCanvas( "webgl" );
  }
}

export const testProcedure2 = {
  name: "Test Procedure",
  requirements: {
    managers: ["MenuManager"],
    engine: ["setInteractionCanvas"]
  },
  start: ( { managers, engine } ) => {
    const { MenuManager } = managers;
    const { setInteractionCanvas } = engine;

    const menu = createRegisterForm();

    MenuManager.addMenu( menu );
    MenuManager.switchMenu( menu.id );
    setInteractionCanvas( "css3d" );
  },
  end: ( { managers, engine } ) => {
    const { MenuManager } = managers;
    const { setInteractionCanvas } = engine;

    MenuManager.setActiveMenu( null );
    setInteractionCanvas( "webgl" );
  }
}