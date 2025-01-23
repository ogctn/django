import { AmbientLight, Box3, Clock, Object3D, WebGLRenderer } from "three";
import { CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";
import { CustomFlyControls } from "../controls/CustomFlyControls.js";
import { WrapperCamera } from "./Camera.js";
import { WrapperScene } from "./Scene.js";

export const OtherMixin = {
  getShipBB() {
    const ship = this.getShip();

    const bb = new Box3();
    bb.setFromObject(ship, true);
    return bb;
  }
}

export const ThreeMixin = {

  initThree() {
    this.three = {
      Clock: new Clock( true ),
      WebGLRenderer: null,
      CSS3DRenderer: null,
      Scene: null,
      Camera: null,
      CustomFlyControls: null,
      CameraPivot: null
    };
  },

  /**
   * 
   * @param {"Clock" | "WebGLRenderer" | "CSS3DRenderer" | "Scene" | "Camera" | "CustomFlyControls" | "CameraPivot"} key 
   * 
   * @return {Clock | WebGLRenderer | CSS3DRenderer | WrapperScene | WrapperCamera | CustomFlyControls | Object3D}
   */
  getThree( key ) {
    return this.three[key];
  },

  setupThree() {
    this.setupRenderer();
    this.setupScene();
    this.setupCamera( this.three.Scene );
    this.setupControls( this.three.Camera, this.three.WebGLRenderer.domElement );

    window.addEventListener( "resize", this.updateSizes.bind( this ) );
    window.addEventListener( "DOMContentLoaded", this.updateSizes.bind( this ), { once: true } );
  },

  updateSizes() {
    const { width, height } = this.element.getBoundingClientRect();
    const { WebGLRenderer, CSS3DRenderer, Camera } = this.three;

    Camera.aspect = width / height;
    Camera.updateProjectionMatrix();

    WebGLRenderer.setSize( width, height );
    CSS3DRenderer.setSize( width, height );

    WebGLRenderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
  },

  setupRenderer() {
    const webglRenderer = new WebGLRenderer( { powerPreference: "high-performance" } );
    const cssRenderer = new CSS3DRenderer();

    this.three.WebGLRenderer = webglRenderer;
    this.three.CSS3DRenderer = cssRenderer;

    cssRenderer.domElement.style.position = "absolute";
    cssRenderer.domElement.style.zIndex = 1;
    cssRenderer.domElement.style.pointerEvents = "none";

    webglRenderer.setClearColor( 0x000000 );

    this.element.appendChild( webglRenderer.domElement );
    this.element.appendChild( cssRenderer.domElement );
  },

  setupCamera( scene ) {
    const camera = new WrapperCamera();
    const cameraPivot = new Object3D();

    this.three.Camera = camera;
    this.three.CameraPivot = cameraPivot;

    cameraPivot.add( camera );

    camera.position.set( 0, 2, 4 );
    camera.lookAt( 0, 0, 0 );


    scene.add( cameraPivot );
  },

  setupControls( camera, domElement ) {
    const cameraControls = new CustomFlyControls( camera, domElement );

    this.three.CustomFlyControls = cameraControls;

    cameraControls.enabled = true;
    cameraControls.domElement = domElement;
  },

  setupScene() {
    const scene = new WrapperScene();

    this.three.Scene = scene;

    const ambientLight = new AmbientLight( 0xffffff, 1 );

    scene.add( ambientLight );
  },

  /**
   * @method setInteractionCanvas
   * 
   * @param {"webgl" | "css3d"} renderer
   */
  setInteractionCanvas( renderer ) {
    const { CSS3DRenderer, WebGLRenderer } = this.three;
    const element = CSS3DRenderer.domElement;
    const transformerElement = element.children[0];
    const webglState = renderer == "webgl" ? "all" : "none";
    const css3dState = renderer == "css3d" ? "all" : "none";
    WebGLRenderer.domElement.style.pointerEvents = webglState;
    element.style.pointerEvents = css3dState;
    transformerElement.style.pointerEvents = css3dState;
  }
}
