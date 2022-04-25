//#version 300 es
//in vec3 position;
//in vec3 normal;
//in vec2 uv;
//in mat4 projectionMatrix;
//in mat4 modelViewMatrix;
varying vec2 vUv;

void main()
{
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
}