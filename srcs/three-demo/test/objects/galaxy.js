import { BufferGeometry, Color, Float32BufferAttribute, Points } from "three";
import { starMaterial } from "./stars";

export function generateGalaxyStars( blackHole, armCount = 2, starCount = 5000 ) {
  const positions = [];
  const colors = [];
  const galaxyRadius = 5000; // Define galaxy size

  for ( let i = 0; i < starCount; i++ ) {
    // Randomly assign stars to one of the spiral arms
    const armOffset = ( Math.PI * 2 * Math.random() ) / armCount;
    const radius = Math.random() * galaxyRadius;

    // Logarithmic spiral equation
    const angle = radius * 0.1 + armOffset;
    const x = Math.cos( angle ) * radius;
    const y = ( Math.random() - 0.5 ) * 100; // Add some vertical spread
    const z = Math.sin( angle ) * radius;

    positions.push( x, y, z );

    // Assign colors based on distance from the core
    const color = new Color();
    color.setHSL( 0.6 + Math.random() * 0.4, 1.0, 0.5 );
    colors.push( color.r, color.g, color.b );
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute( "position", new Float32BufferAttribute( positions, 3 ) );
  geometry.setAttribute( "color", new Float32BufferAttribute( colors, 3 ) );

  // const material = new PointsMaterial( {
  //   size: 5,
  //   vertexColors: true,
  //   blending: AdditiveBlending,
  // } );

  const galaxy = new Points( geometry, starMaterial );

  blackHole.galaxy = galaxy; // Attach galaxy to black hole
  return galaxy;
}
