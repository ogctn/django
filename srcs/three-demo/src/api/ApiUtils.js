export function createRequestHandler( baseUrl, baseHeaders = {} ) {
  if ( !baseUrl ) {
    throw new Error( 'baseUrl is required' );
  }

  async function handleResponse( response ) {
    if ( !response.ok ) {
      const error = await response.text();
      throw new Error( `HTTP Error: ${response.status} - ${error}` );
    }
    return response.json();
  }

  class RequestBuilder {
    #method;
    #url;
    #headers;
    #body;

    constructor( method, endpoint ) {
      this.#method = method;
      this.#url = new URL( endpoint, baseUrl );
    }

    withHeaders( headers ) {
      this.#headers = headers;
      return this;
    }

    withParams( params ) {
      this.#url.search = new URLSearchParams( params );
      return this;
    }

    withBody( body ) {
      this.#body = body;
      return this;
    }

    async send() {
      const response = await fetch( this.#url, {
        method: this.#method,
        headers: {
          ...baseHeaders,
          ...this.#headers
        },
        body: JSON.stringify( this.#body ),
        credentials: 'include'
      } );
      return handleResponse( response );
    }

  }

  return {
    get( endpoint ) {
      return new RequestBuilder( 'GET', endpoint );
    },
    post( endpoint ) {
      return new RequestBuilder( 'POST', endpoint );
    },
    patch( endpoint ) {
      return new RequestBuilder( 'PATCH', endpoint );
    },
    put( endpoint ) {
      return new RequestBuilder( 'PUT', endpoint );
    },
    delete( endpoint ) {
      return new RequestBuilder( 'DELETE', endpoint );
    }
  };

}

export function getCookie( name ) {
  const value = `; ${document.cookie}`;
  const parts = value.split( `; ${name}=` );
  if ( parts.length === 2 ) return parts.pop().split( ';' ).shift();
}
