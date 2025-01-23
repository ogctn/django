export class MenuManager {
  constructor( camera ) {
    this.menus = new Map();
    this.previousMenu = null;
    this.activeMenu = null;
    this.camera = camera;
  }

  addMenu( menu ) {
    this.menus.set( menu.id, menu );
  }

  getActiveMenu() {
    return this.menus.get( this.activeMenu );
  }

  setActiveMenu( menuId ) {
    this.activeMenu = menuId;

    this.menus.forEach( ( menu, id ) => {
      if ( id === menuId ) {
        menu.active = true;
        this.camera.add( menu.object );
        menu.object.position.set( 0, 0, -500 );
      } else {
        menu.active = false;
        this.camera.remove( menu.object );
      }
    } );
  }

  previous() {
    if ( this.previousMenu ) {
      this.switchMenu( this.previousMenu );
    }
  }

  switchMenu( menuId ) {
    if ( this.activeMenu ) {
      const currentMenu = this.menus.get( this.activeMenu );

      if ( currentMenu.transitionOut ) {
        currentMenu.transitionOut();
      }

      currentMenu.active = false;

      this.camera.remove( currentMenu.object );
      this.previousMenu = this.activeMenu;
    }

    const newMenu = this.menus.get( menuId );
    if ( newMenu ) {

      this.activeMenu = menuId;
      newMenu.active = true;

      if ( newMenu.transitionIn ) {
        newMenu.transitionIn();
      }

      this.camera.add( newMenu.object );

    }
  }

  removeMenu( menuId ) {
    const menu = this.menus.get( menuId );

    if ( menu ) {
      this.menus.delete( menuId );
      this.camera.remove( menu.object );
    }
  }

  clearMenus() {
    this.menus.forEach( menu => {
      this.camera.remove( menu.object );
    } );
    this.menus.clear();
  }
}
