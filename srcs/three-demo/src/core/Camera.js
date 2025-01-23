import { PerspectiveCamera } from "three";

export class WrapperCamera extends PerspectiveCamera {
  constructor(fov = 75, aspect = window.innerWidth / window.innerHeight, near = 0.1, far = 2000) {
    super(fov, aspect, near, far);
    this.position.set(0, 0, 5);
    this.lookAt(0, 0, 0);
  }
}
