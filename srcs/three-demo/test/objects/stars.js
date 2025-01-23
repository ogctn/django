import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial } from "three";
import { fragment } from "./shaders/star.fragment.glsl";
import { vertex } from "./shaders/star.vertex.glsl";
import { seededRandom } from "./util";

export function generateStarsInChunk( chunkX, chunkY, chunkZ, starCount = 10 ) {
  const positions = [];
  const seed = chunkX * 73856093 ^ chunkY * 19349663 ^ chunkZ * 83492791;

  for ( let i = 0; i < starCount; i++ ) {
    const rand = seededRandom( seed + i );
    const x = ( chunkX + rand * 2 - 1 ) * 1000 + seededRandom( seed + i + 1 ) * 1000;
    const y = ( chunkY + rand * 2 - 1 ) * 1000 + seededRandom( seed + i + 2 ) * 1000;
    const z = ( chunkZ + rand * 2 - 1 ) * 1000 + seededRandom( seed + i + 3 ) * 1000;
    positions.push( x, y, z );
  }

  return new Float32Array( positions );
}

export const starMaterial = new ShaderMaterial( {
  vertexShader: vertex,
  fragmentShader: fragment,
  transparent: true,
  blending: AdditiveBlending,
  depthTest: true,
} );

export function createStarfield( chunkX, chunkY, chunkZ ) {
  const geometry = new BufferGeometry();
  const positions = generateStarsInChunk( chunkX, chunkY, chunkZ );

  geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );

  const points = new Points( geometry, starMaterial );

  return points;
}
