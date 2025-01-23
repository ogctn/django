export const fragment = `
varying float intensity;

void main() {
    vec3 starColor = vec3(1.0, 1.0, 1.0) * intensity;
    float dist = length(gl_PointCoord - vec2(0.5));
    float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
    gl_FragColor = vec4(starColor, alpha);
}`;