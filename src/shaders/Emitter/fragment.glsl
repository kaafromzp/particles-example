//#version 300 es
precision highp float;
precision highp int;
uniform highp sampler2D texture1;
uniform highp float time;
varying vec2 vUv;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() 
{
    vec4 clr = texture2D(texture1,vUv);
    gl_FragColor = clr;
}