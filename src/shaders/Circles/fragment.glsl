//#version 300 es

precision highp float;
precision highp int;

uniform highp sampler2D texture1;
uniform float radius;
uniform vec2 pos;
varying vec2 vUv;
uniform float aspect;

void main() 
{
        vec2 UV = vec2(vUv.x * aspect, vUv.y );
        vec3 col = (length(UV - pos) > radius) ? vec3(0.0) : vec3(0.3,0.5,0.7);
        gl_FragColor = vec4(texture2D(texture1,vUv)) + vec4(col,1.0);

}