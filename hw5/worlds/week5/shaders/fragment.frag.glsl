#version 300 es        // NEWER VERSION OF GLSL
precision highp float; // HIGH PRECISION FLOATS

const int NL = 2; // Number of light sources in the scene
struct Light{
    vec3 dir;
    vec3 col;
};
uniform Light uLights[NL];

uniform vec3  uAmbient;
uniform vec3  uDiffuse;
uniform vec4  uSpecular;
uniform vec3  uCursor; // CURSOR: xy=pos, z=mouse up/down
uniform float uTime;   // TIME, IN SECONDS

in vec2 vXY;           // POSITION ON IMAGE
in vec3 vPos;          // POSITION
in vec3 vNor;          // NORMAL

out vec4 fragColor;    // RESULT WILL GO HERE

vec3 phongShading(vec3 vNor, vec3 uAmbient, vec3 uDiffuse, vec4 uSpecular){
    vec3 color = uAmbient;
    for (int j=0; j<NL; j++){
        vec3 R = 2.*dot(vNor, uLights[j].dir)*vNor - uLights[j].dir;
        vec3 E = -(normalize(vec3(vPos.x, vPos.y, -5.)));
        color+=uLights[j].col*(uDiffuse*max(0.,dot(vNor,uLights[j].dir))+uSpecular.xyz*pow(max(0.,dot(E,R)),uSpecular.w));
    }
    return color;
}

void main() {

    vec3 color = phongShading(vNor, uAmbient, uDiffuse, uSpecular);

    // HIGHLIGHT CURSOR POSITION WHILE MOUSE IS PRESSED

    if (uCursor.z > 0. && min(abs(uCursor.x - vXY.x), abs(uCursor.y - vXY.y)) < .01)
          color = vec3(1.,1.,1.);

    fragColor = vec4(sqrt(color), 1.0);
}


