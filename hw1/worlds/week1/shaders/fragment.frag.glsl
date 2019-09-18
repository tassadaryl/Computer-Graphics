#version 300 es
precision highp float;

uniform float uTime;   // TIME, IN SECONDS
in vec3 vPos;     // -1 < vPos.x < +1
// -1 < vPos.y < +1
//      vPos.z == 0

out vec4 fragColor; 
 
void main() {

  // HERE YOU CAN WRITE ANY CODE TO
  // DEFINE A COLOR FOR THIS FRAGMENT

float t1 = sin(2.*uTime);
float t2 = cos(4.*uTime);
float t3 = tan(8.*uTime);
float red = noise(8.*vPos)*t1;
float green = noise(4.*vPos)*t2;
float blue = noise(2.*vPos)*t3;

float r = vPos.x*vPos.x+vPos.y*vPos.y;
vec3 circle = r*vec3(2.,4.,8.)*(sin(8.*uTime));

  
float s1 = max(0.,sin(ceil(4.*vPos.x)+uTime)-vPos.y);

  // R,G,B EACH RANGE FROM 0.0 TO 1.0  
  vec3 color = vec3(red, green, blue);
    
  // THIS LINE OUTPUTS THE FRAGMENT COLOR
//fragColor = vec4(sqrt(color)+sqrt(circle), 1.0);
fragColor = vec4(s1,s1,s1, 1.0);
}