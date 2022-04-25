//#version 300 es
//in vec3 position;
//in vec3 normal;
in float test;
//in mat4 projectionMatrix;
//in mat4 modelViewMatrix;
varying vec2 vUv;
uniform highp sampler2D texture1;
uniform highp sampler2D texture2;
uniform highp float time;
uniform highp float radius;
varying float vTest;
varying vec3 vColor;
varying vec3 vPos;
varying float vFi;
varying float vTetta;

vec2 calcUV(float index) {
    return vec2( mod(index, 1024.0) , index/1024.0 ) / vec2(1024.0);
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

//Noise definition
float tri( float x ){
  return abs( fract(x) - .5 );
}

vec3 tri3( vec3 p ){

  return vec3(
      tri( p.z + tri( p.y * 1. ) ),
      tri( p.z + tri( p.x * 1. ) ),
      tri( p.y + tri( p.x * 1. ) )
  );

}

float triNoise3D( vec3 p, float spd , float time){

  float z  = 1.4;
	float rz =  0.;
  vec3  bp =   p;

	for( float i = 0.; i <= 3.; i++ ){

    vec3 dg = tri3( bp * 2. );
    p += ( dg + time * .1 * spd );

    bp *= 1.8;
		z  *= 1.5;
		p  *= 1.2;

    float t = tri( p.z + tri( p.x + tri( p.y )));
    rz += t / z;
    bp += 0.14;

	}

	return rz;

}

//Noise definition end

void main()
{
    vTest = test;
    vUv = calcUV(test);

    float texData = rand(vUv);//texture2D(texture1,vUv).r;

    float fi = vUv.x *6.28 +(sin(time / 9979.9 * texData) + texData* 0.5)* cos(time / 7779.9 * texData);
    float tetta = (vUv.y)* 3.14 +(cos(time / 9979.9 * texData) + texData* 0.5)* sin(time / 7779.9 * texData);
    float noise = 0.02* (triNoise3D( vec3(fi,tetta,0.0), 0.01,time / 777.0)* 2.0 - 1.0);
    
    float height = 0.05 * (texture2D(texture2, vec2( 1.0 -fi / 6.28, tetta / 3.14)).r);

    float x = (radius + height) * sin(tetta)* cos(fi);
    float y = (radius + height) * sin(fi)* sin(tetta);
    float z = (radius + height) * cos(tetta);

    vec3 pos = vec3( x, y, z );
    vPos = pos;
    vColor = height < 0.0125 / 5.0
    ? vec3(0.1,0.1,0.8)
    :mix(vec3(0.1,0.9,0.1), vec3(1.0,0.5,0.0), (height - 0.0125 / 5.0 ) * 50.0);//pos;
    vFi = fi;
    vTetta = tetta;
    // vColor = mix(vec3(33.0/255.0, 150.0/255.0, 243.0/255.0),vec3(233.0/255.0, 30.0/255.0, 99.0/255.0), (pos.x+ pos.y + pos.z) * 0.33+0.5);
    gl_PointSize = 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    
}