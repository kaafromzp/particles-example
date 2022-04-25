//#version 300 es
precision highp float;
precision highp int;
uniform highp sampler2D texture1;
// uniform highp sampler2D texture2;
uniform highp float time;
uniform highp float radius;
varying vec2 vUv;
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

void main() 
{
        vec3 norm = normalize(vPos);
        vec3 lightDir1 = normalize(vec3(1,1,1) - vPos);  
        float diff1 = max(dot(norm, lightDir1), 0.0);
        vec3 diffuse1 = diff1 * vec3(1,1,1);

        vec3 lightDir2 = normalize(vec3(-1,1,1) - vPos);  
        float diff2 = max(dot(norm, lightDir2), 0.0);
        vec3 diffuse2 = diff2 * vec3(1,1,1);

        vec3 lightDir3 = normalize(vec3(1,1,-1) - vPos);  
        float diff3 = max(dot(norm, lightDir3), 0.0);
        vec3 diffuse3 = diff3 * vec3(1,1,1);

        vec3 lightDir4 = normalize(vec3(-1,1,-1) - vPos);  
        float diff4 = max(dot(norm, lightDir4), 0.0);
        vec3 diffuse4 = diff4 * vec3(1,1,1);

        // float depth = length(vPos - cameraPosition);
        // float fogFactor = 1.0 - smoothstep( 1.5, 2.6, depth );

        vec3 d = normalize(vPos);//vec2(1.0 -vFi /6.28, 1.0 -vTetta / 3.14);
        vec2 UV = vec2(0.5 + atan(d.x / d.z) / 6.28, 0.5 + asin(d.y)/ 3.14);

        //  float a = texture2D(texture1, UV).g * 0.5;

        gl_FragColor = vec4( vColor + 0.3*(diffuse3 + diffuse4)  , 1.0);//(1.0 - vColor.b) );
}