import { AmbientLight } from "three";
import Engine from "../Engine.js";
import { WrapperScene } from "../Scene.js";
import { AssetManager } from "./AssetManager.js";

export class EnvironmentManager {
  /**
   * 
   * @param {Engine} engine
   * @param {AssetManager} assetManager 
   * 
   * @property {Map<string, WrapperScene>} scenes
   * @property {WrapperScene} activeScene
   */
  constructor( engine ) {
    this.scenes = new Map();
    this.engine = engine;
    this.activeScene = null;
    this.assetManager = this.engine.getManager( AssetManager );
  }

  async loadScenes( scenes ) {
    scenes.map( ( sceneConfig ) => new Promise( resolve => {
      const scene = this.createSceneFromConfig( sceneConfig );
      this.addScene( scene );
      resolve();
    } ) );
  }

  createSceneFromConfig( config ) {
    const scene = new WrapperScene();

    if ( config.lights ) {
      config.lights.forEach( ( lightConfig ) => {
        const light = this.assetManager.createLight( lightConfig );
        scene.add( light );
      } );
    } else {
      const defaultLight = new AmbientLight( 0xffffff, 1 );
      scene.add( defaultLight );
    }

    if ( config.assets ) {
      config.assets.forEach( ( assetConfig ) => {
        const asset = this.assetManager.get( assetConfig.key, assetConfig.type );
        if ( !asset ) {
          this.assetManager.load( assetConfig.key, assetConfig.type, assetConfig.url )
        }
      } );
    }

    if ( config.children ) {
      config.children.forEach( ( childConfig ) => {
        this.assetManager.parse( childConfig ).then( ( child ) =>
          scene.add( child ) );
      } );
    }

    scene.name = config.name;

    return scene;
  }

  addScene( scene ) {
    this.scenes.set( scene.name, scene );
  }

  removeScene( name ) {
    this.scenes.delete( name );
  }

  getScene( name ) {
    return this.scenes.get( name );
  }

  setActiveScene( name ) {
    if ( this.activeScene ) {
      this.cleanupScene( this.activeScene );
    }
    this.activeScene = this.scenes.get( name );
    if ( !this.activeScene ) {
      throw new Error( `Scene "${name}" does not exist.` );
    }
    this.setupScene( this.activeScene );
  }

  setupScene( scene ) {
    this.engine.three.Scene = scene;
    scene.add( this.engine.three.CameraPivot );
    // const testBox = new Mesh( new BoxGeometry( 1, 1, 1 ), new MeshBasicMaterial( { color: 0x0000ff } ) );
    // scene.add( testBox );
  }

  cleanupScene( scene ) {
    scene.children.forEach( ( child ) => scene.remove( child ) );
  }
}
