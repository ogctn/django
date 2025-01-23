export default class Router {

  constructor() {
    this._routes = {};
    window.addEventListener( "popstate", () =>
      this.handleRoute( window.location.pathname ),
    );

    if ( !this._routes[window.location.pathname] ) {
      this.navigate( "/" );
    } else {
      this.handleRoute( window.location.pathname );
    }

    document.body.addEventListener( "click", ( event ) => {
      const target = event.target;

      if ( target.tagName === "A" ) {
        const link = target;
        if ( link.href && link.href.startsWith( window.location.origin ) ) {
          event.preventDefault();
          const path = link.getAttribute( "href" );
          if ( path ) {
            this.navigate( path );
          } else {
            console.warn( "Link has no href attribute." );
          }
        }
      }
    } );
  }

  addRoute( path, handler ) {
    if ( this._routes[path] ) {
      console.warn( `Route already exists: ${path}` );
      return;
    }
    this._routes[path] = handler;
  }

  navigate( path ) {
    if ( this._routes[path] ) {
      window.history.pushState( {}, "", path );
      this.handleRoute( path );
    }
  }

  get routes() {
    return this._routes;
  }

  handleRoute( path ) {
    const handler = this._routes[path];
    if ( handler ) {
      handler();
    } else {
      console.warn( `No handler for route: ${path}` );
      if ( this._routes["/404"] ) {
        this._routes["/404"]();
      }
    }
  }
}

export const router = new Router();