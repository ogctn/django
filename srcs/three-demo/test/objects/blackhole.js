import { AdditiveBlending, Color, DoubleSide, Group, Mesh, MeshBasicMaterial, RingGeometry, ShaderMaterial, SphereGeometry, Vector3 } from "three";
import * as ADSH from "./shaders/accretion.glsl";

// const blackholeMaterial = ( radius ) => new ShaderMaterial( {
//   vertexShader: BSH.vertex,
//   fragmentShader: BSH.fragment,
//   uniforms: {
//     blackHoleColor: { value: new Color( 0x000000 ) },
//     radius: { value: radius },
//   },
// } );

const accretionDiskMaterial = ( innerRadius = .2, outerRadius = .5 ) => new ShaderMaterial( {
  vertexShader: ADSH.vertex,
  fragmentShader: ADSH.fragment,
  uniforms: {
    time: { value: 0 },
    blackHoleColor: { value: new Color( 0x000000 ) },
    diskColor: { value: new Color( 0xff8800 ) },
    innerRadius: { value: innerRadius },
    outerRadius: { value: outerRadius },
  },
  transparent: true,
  blending: AdditiveBlending,
  side: DoubleSide,
} );

// export function createMassiveBlackHole(position, radius = 500) {
//   const blackHole = createBlendedBlackHole(position, radius);
//   blackHole.mass = 1e6;
//   return blackHole;
// }

export function createAccretionDisk( innerRadius, outerRadius ) {
  const geometry = new RingGeometry( innerRadius, outerRadius, 64 );
  return new Mesh( geometry, accretionDiskMaterial( innerRadius, outerRadius ) );
}

export function createBlendedBlackHole( position, radius = 200, mass = 1e6 ) {

  const blackHoleCore = new Mesh(
    new SphereGeometry( radius, 32, 32 ),
    new MeshBasicMaterial( { color: 0x000000 } )
  );

  const diskMaterial = accretionDiskMaterial();
  const accretionDisk = new Mesh(
    new RingGeometry( radius * 1.2, radius * 2, 64 ),
    diskMaterial
  );

  // accretionDisk.rotation.x = Math.PI / 2;

  const blackHole = new Group();
  blackHole.add( blackHoleCore );
  blackHole.add( accretionDisk );

  blackHole.position.copy( position );
  blackHole.accretionDiskMaterial = diskMaterial;

  blackHole.mass = mass;
  blackHole.influenceRadius = 9.81 * mass;
  console.log( blackHole.influenceRadius );

  return blackHole;
}

export function applyOrbitalMechanics( blackHole, starPositions, deltaTime ) {

  const bhPosition = blackHole.position;

  const deltaP = new Float32Array( starPositions.length );
  for ( let i = 0; i < starPositions.length; i += 3 ) {
    const starPosition = new Vector3(
      starPositions[i],
      starPositions[i + 1],
      starPositions[i + 2]
    );

    const direction = new Vector3().subVectors( bhPosition, starPosition );
    const distance = direction.length();

    const gravitationalForce = blackHole.mass / ( distance * distance );
    const forceVector = direction.normalize().multiplyScalar( gravitationalForce * deltaTime );

    const tangentialDirection = new Vector3( -direction.y, direction.x, 0 ).normalize();
    const angularMomentum = tangentialDirection.multiplyScalar( .1 ); // Adjust for rotation speed

    starPosition.add( forceVector ).add( angularMomentum );

    deltaP[i] = starPositions[i] - starPosition.x;
    deltaP[i + 1] = starPositions[i + 1] - starPosition.y;
    deltaP[i + 2] = starPositions[i + 2] - starPosition.z;
  }

  return deltaP;
}

// export function updateBlackHoleCenter(blackHole, camera, renderer, lensPass) {
//   const screenPosition = new Vector3();
//   blackHole.position.project(camera);

//   screenPosition.set(
//       (blackHole.position.x * 0.5 + 0.5) * renderer.domElement.width,
//       (blackHole.position.y * -0.5 + 0.5) * renderer.domElement.height
//   );

//   lensPass.uniforms.blackHoleCenter.value.set(
//       screenPosition.x / renderer.domElement.width,
//       screenPosition.y / renderer.domElement.height
//   );
// }
