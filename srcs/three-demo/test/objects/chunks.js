import {
  BoxGeometry,
  BoxHelper,
  Mesh,
  MeshBasicMaterial,
  Vector3
} from "three";

import {
  createBlendedBlackHole
} from "./blackhole";

import { clamp } from "three/src/math/MathUtils.js";
import {
  createStarfield
} from "./stars";

//////////////////////////
// GLOBAL DATA
//////////////////////////

export const CHUNK_SIZE = 1000;
export const RENDER_DISTANCE = 5;
export const BLACKHOLE_DISTRIBUTION = 500;

export const blackHoles = {};

export const visibleChunks = {};

const chunkHelpers = {};

//////////////////////////
// SHARED MATERIALS / GEOMETRIES
//////////////////////////

const chunkHelperProperties = {
  geometry: new BoxGeometry( CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE ),
  material: new MeshBasicMaterial( { color: 0xff0000, wireframe: true } ),
};

function createChunkHelper( chunkX, chunkY, chunkZ, chunkSize ) {
  const mesh = new Mesh(
    chunkHelperProperties.geometry,
    chunkHelperProperties.material
  );

  mesh.position.set(
    chunkX * chunkSize + chunkSize / 2,
    chunkY * chunkSize + chunkSize / 2,
    chunkZ * chunkSize + chunkSize / 2
  );

  return new BoxHelper( mesh, 0x00ff00 );
}

//////////////////////////
// BLACK HOLE MANAGEMENT
//////////////////////////

function generateBlackHolesForChunks( chunkX, chunkY, chunkZ, scene ) {
  const ownerChunkX = Math.floor( chunkX / BLACKHOLE_DISTRIBUTION ) * BLACKHOLE_DISTRIBUTION;
  const ownerChunkY = Math.floor( chunkY / BLACKHOLE_DISTRIBUTION ) * BLACKHOLE_DISTRIBUTION;
  const ownerChunkZ = Math.floor( chunkZ / BLACKHOLE_DISTRIBUTION ) * BLACKHOLE_DISTRIBUTION;

  const key = `${ownerChunkX},${ownerChunkY},${ownerChunkZ}`;

  if ( !blackHoles[key] ) {
    const position = new Vector3(
      ownerChunkX * CHUNK_SIZE + Math.random() * CHUNK_SIZE * BLACKHOLE_DISTRIBUTION,
      ownerChunkY * CHUNK_SIZE + Math.random() * CHUNK_SIZE * BLACKHOLE_DISTRIBUTION,
      ownerChunkZ * CHUNK_SIZE + Math.random() * CHUNK_SIZE * BLACKHOLE_DISTRIBUTION
    );

    const rad = clamp( Math.random() * 5000, 100, 5000 );

    const bh = createBlendedBlackHole( position, rad, 1e6 );
    blackHoles[key] = bh;
    scene.add( bh );
  }
}

//////////////////////////
// PHYSICS - MULTI BH PASS
//////////////////////////

function applyOrbitalForcesToChunk( chunk, blackHoleList, deltaTime ) {
  if ( !chunk || !chunk.starfield || !chunk.starfield.geometry ) return;

  const positions = chunk.starfield.geometry.attributes.position.array;
  const deltaP = new Float32Array( positions.length );

  const tmpStarPos = new Vector3();
  const bhDirection = new Vector3();
  const tangential = new Vector3();

  for ( let i = 0; i < positions.length; i += 3 ) {
    tmpStarPos.set(
      positions[i],
      positions[i + 1],
      positions[i + 2]
    );

    blackHoleList.forEach( ( bh ) => {
      bhDirection.copy( bh.position ).sub( tmpStarPos );
      const dist = bhDirection.length();

      if ( dist === 0 ) return;

      const gravitationalForce = bh.mass / ( dist * dist );
      bhDirection.normalize().multiplyScalar( gravitationalForce * deltaTime );

      tangential.set( -bhDirection.y, bhDirection.x, 0 ).normalize().multiplyScalar( 0.1 );

      tmpStarPos.add( bhDirection ).add( tangential );
    } );

    deltaP[i] = positions[i] - tmpStarPos.x;
    deltaP[i + 1] = positions[i + 1] - tmpStarPos.y;
    deltaP[i + 2] = positions[i + 2] - tmpStarPos.z;
  }

  for ( let i = 0; i < deltaP.length; i += 3 ) {
    positions[i] += deltaP[i];
    positions[i + 1] += deltaP[i + 1];
    positions[i + 2] += deltaP[i + 2];
  }

  chunk.starfield.geometry.attributes.position.needsUpdate = true;
}

function getRelevantBlackHolesForChunk( chunk ) {
  // You can refine with distance checks. For now, we just gather all black holes
  // that are within their influence radius from the chunk center
  const center = chunk.center;
  return Object.values( blackHoles ).filter( ( bh ) => {
    const distToBH = center.distanceTo( bh.position );
    return distToBH < ( bh.influenceRadius || 2000 );
  } );
}

//////////////////////////
// CHUNK VISIBILITY & UPDATE
//////////////////////////

export function updateVisibleChunks( camera, scene, clock ) {
  const cameraPosition = camera.position;
  const chunkX = Math.floor( cameraPosition.x / CHUNK_SIZE );
  const chunkY = Math.floor( cameraPosition.y / CHUNK_SIZE );
  const chunkZ = Math.floor( cameraPosition.z / CHUNK_SIZE );

  for ( let cx = chunkX - RENDER_DISTANCE; cx <= chunkX + RENDER_DISTANCE; cx++ ) {
    for ( let cy = chunkY - RENDER_DISTANCE; cy <= chunkY + RENDER_DISTANCE; cy++ ) {
      for ( let cz = chunkZ - RENDER_DISTANCE; cz <= chunkZ + RENDER_DISTANCE; cz++ ) {
        const chunkKey = `${cx},${cy},${cz}`;
        if ( !visibleChunks[chunkKey] ) {
          const starfield = createStarfield( cx, cy, cz );

          const center = new Vector3(
            cx * CHUNK_SIZE + CHUNK_SIZE / 2,
            cy * CHUNK_SIZE + CHUNK_SIZE / 2,
            cz * CHUNK_SIZE + CHUNK_SIZE / 2
          );

          visibleChunks[chunkKey] = {
            starfield,
            x: cx,
            y: cy,
            z: cz,
            center
          };
          scene.add( starfield );

          generateBlackHolesForChunks( cx, cy, cz, scene );

          // (Optional) debug helper
          const helper = createChunkHelper(cx, cy, cz, CHUNK_SIZE);
          chunkHelpers[chunkKey] = helper;
          scene.add(helper);
        }
      }
    }
  }

  // 2) Accrete + Apply forces from black holes in a single pass per chunk
  const deltaTime = clock.getDelta();

  Object.values( blackHoles ).forEach( ( bh ) => {
    if ( bh.accretionDiskMaterial && bh.accretionDiskMaterial.uniforms.time ) {
      bh.accretionDiskMaterial.uniforms.time.value += deltaTime;
    }
  } );

  Object.entries( visibleChunks ).forEach( ( [key, chunk] ) => {
    const relevantBHs = getRelevantBlackHolesForChunk( chunk );
    if ( relevantBHs.length > 0 ) {
      applyOrbitalForcesToChunk( chunk, relevantBHs, deltaTime );
    }
  } );

  for ( const key in visibleChunks ) {
    const chunk = visibleChunks[key];
    if (
      Math.abs( chunk.x - chunkX ) > RENDER_DISTANCE ||
      Math.abs( chunk.y - chunkY ) > RENDER_DISTANCE ||
      Math.abs( chunk.z - chunkZ ) > RENDER_DISTANCE
    ) {
      // remove from scene
      scene.remove( chunk.starfield );

      if ( chunkHelpers[key] ) {
        scene.remove( chunkHelpers[key] );
        delete chunkHelpers[key];
      }

      delete visibleChunks[key];
    }
  }
}

