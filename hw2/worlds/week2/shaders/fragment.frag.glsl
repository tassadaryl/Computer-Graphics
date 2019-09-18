#version 300 es        // NEWER VERSION OF GLSL
precision highp float; // HIGH PRECISION FLOATS

uniform float uTime;   // TIME, IN SECONDS
in vec3 vPos;          // POSITION IN IMAGE
out vec4 fragColor;    // RESULT WILL GO HERE

const int NS = 2; // Number of spheres in the scene
const int NL = 2; // Number of light sources in the scene

// Declarations of arrays for spheres, lights and phong shading:
vec3 Ldir[NL], Lcol[NL], Ambient[NS], Diffuse[NS];
vec4 Sphere[NS], Specular[NS];

const float fl = 2.; 

//retrieve the center of a sphere
vec3 Center(vec4 S){
    return vec3(S.x, S.y, S.z);
}

//find the distance between along a ray to sphere
float raySphere(vec3 V, vec3 W, vec4 S){
    vec3 C = Center(S);
    vec3 V_prime = V - C;
    float discriminant = dot(V_prime,W)*dot(V_prime,W)-dot(V_prime,V_prime)+S.w*S.w;
    if (discriminant < 0.){
        return -1.;
    }
    float t = -dot(V_prime,W)-sqrt(discriminant);
    if (t<0.){
        return -1.;
    }
    else return t;         

}

bool isInShadow(vec3 P, vec3 L){
    for (int i=0;i<NS;i++){
        if (raySphere(P, L, Sphere[i])>0.001){
            return true;
        }
    }
    return false;
}




void main() {
    Ldir[0] = normalize(vec3(1.,-.2,.7));
    Lcol[0] = vec3(1.,1.,1.);

    Ldir[1] = normalize(vec3(-2.,-1.,-2.));
    Lcol[1] = vec3(1.,.5,.05);

    Sphere[0]   = vec4(.3,-0.2,0.,.5);
    Ambient[0]  = vec3(0.,.0,.1);
    Diffuse[0]  = vec3(.8,.5,.5);
    Specular[0] = vec4(0.,1.,1.,10.); // 4th value is specular power

    Sphere[1]   = vec4(-.4    ,.4,-.1,.4);
    Ambient[1]  = vec3(.1,.1,0.);
    Diffuse[1]  = vec3(.5,.5,.5);
    Specular[1] = vec4(1.,1.,1.,20.); // 4th value is specular power
    

                
    //calculate N and P
    vec3 N, P;
    vec3 V = vec3(0., 0., fl); //observer loc
    vec3 W = normalize(vec3(vPos.x, vPos.y, -fl));
    float tMin = 1000.;
    float t0 = raySphere(V, W, Sphere[0]);
    float t1 = raySphere(V, W, Sphere[1]);
    vec3 C0 = Center(Sphere[0]);
    vec3 C1 = Center(Sphere[1]);
    if (t0>0. && t0<tMin){
        P=V+t0*W;
        N=normalize(P-C0);    
        tMin=t0;   
    }

    if (t1>0. && t1<tMin){
        P=V+t1*W;
        N=normalize(P-C1);    
        tMin=t1;   
    }

    vec3 color = vec3(0.,0.,0.);
    for (int i=0; i<NL; i++){
        if (isInShadow(P, Ldir[i]) == true){
           color = color + Ambient[i];
        }
        else{
            vec3 R = 2.*dot(N,Ldir[i])*N-Ldir[i];
            vec3 E = -W;
            vec3 Srgb = vec3(Specular[i].x,Specular[i].y,Specular[i].z);
            vec3 colori = Ambient[i]+Lcol[i]*(Diffuse[i]*max(0., dot(N, Ldir[i]))+Srgb*pow(max(0., dot(E,R)),Specular[i].w));
            color = color + colori;
        }
    }


    fragColor = vec4(sqrt(color), 1.0);
    

    
}
