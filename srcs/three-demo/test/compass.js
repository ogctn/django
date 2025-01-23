import { AxesHelper, OrthographicCamera, Scene } from "three";

export function initCompassScene() {
  const compassScene = new Scene();

  // Orthographic camera for a simple HUD-like overlay
  const compassCamera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  compassCamera.position.z = 5;

  // AxesHelper for a simple directional compass
  const compassAxes = new AxesHelper(1);
  compassScene.add(compassAxes);

  return { compassScene, compassCamera, compassAxes };
}