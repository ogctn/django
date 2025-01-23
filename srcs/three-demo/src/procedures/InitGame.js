import { MeshPhysicalMaterial } from "three";

let start = performance.now();

/**
 * @type {import("../core/managers/ProcedureManager.js").ProcedureConfig}
 */
export const gameProcedure = {
  name: "Match",
  interval: 1000 / 120,
  requirements: {
    engine: [
      "getShip",
      "setShip"
    ],
    managers: [
      "MenuManager",
      "EnvironmentManager",
      "AssetManager",
      "InputManager",
      "WebSocketManager"
    ],
    three: [
      "CustomFlyControls",
      "CameraPivot",
      "Camera",
      "Scene"
    ]
  },
  start: ( { managers, three, engine } ) => {
    const {
      MenuManager,
      EnvironmentManager,
      AssetManager,
      InputManager,
      WebSocketManager
    } = managers;

    const {
      CustomFlyControls,
      CameraPivot,
      Camera,
      Scene
    } = three;

    const {
      setShip,
      getShip
    } = engine;

    // EnvironmentManager.setActiveScene( "Match" );

    const shipModel = AssetManager.get( "luminaris_model", "model" );

    const shipRoughness = AssetManager.get( "luminaris_roughness", "texture" );
    const shipNormal = AssetManager.get( "luminaris_normal", "texture" );
    const shipDiffuse = AssetManager.get( "luminaris_diffuse", "texture" );
    const shipEmissive = AssetManager.get( "luminaris_emissive", "texture" );
    const shipSpecular = AssetManager.get( "luminaris_specular", "texture" );

    const physicalMaterial = new MeshPhysicalMaterial( {
      map: shipDiffuse,
      roughnessMap: shipRoughness,
      normalMap: shipNormal,
      emissiveMap: shipEmissive,
      specularColorMap: shipSpecular,
      roughness: 0.4,
      metalness: 0.3,
    } );

    shipModel.traverse( ( child ) => {
      if ( child.isMesh ) {
        child.material = physicalMaterial;
      }
    } );

    Scene.add( shipModel );
    setShip( shipModel );

    CustomFlyControls.control( getShip() );
  },
  update: ( { engine, three } ) => {
    const { CameraPivot } = three;
    const { getShip } = engine;

    const interpFactor = 0.1;
    CameraPivot.position.lerp( getShip()?.position, interpFactor );
    const desiredQuat = getShip().quaternion.clone();
    CameraPivot.quaternion.slerp( desiredQuat, 1 );
  },
  end: ( { managers, three } ) => { },
}