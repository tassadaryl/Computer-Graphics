#version 300 es        // NEWER VERSION OF GLSL
precision highp float; // HIGH PRECISION FLOATS

uniform float uTime;   // TIME, IN SECONDS
in vec3 vPos;          // POSITION IN IMAGE
out vec4 fragColor;    // RESULT WILL GO HERE

const float fl = 2.; 

const int NCube = 6;
vec4 Cube[NCube];      //Cube

const int NOctahedron = 8;
vec4 Octahedron[NOctahedron];

const int NL = 2; // Number of light sources in the scene

struct Light{
    vec4 dir;
    vec3 col;
};
Light uLights[NL];

//vec4 Ldir[NL]; 
//vec3 Lcol[NL];

const int NS = 4; // Number of objects in the scene

struct Material{
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float power;
    vec3 reflection;         // Reflection color. Black means no reflection.
    vec3 transparency;       // Transparency color. Black means the object is opaque.
    float indexOfRefelction; // Higher value means light will bend more as it refracts.
};
Material uMaterials[NS];

struct Shape {
    int   type;   // 0 for Sphere. 1 for Cube. 2 for Octahedron
    vec3  center;
    float size;
};
Shape uShapes[NS];

//halfSpace figure out the relation between a ray and a halfSpace
vec2 halfSpace(vec4 V, vec4 W, vec4 P){
    float t = -dot(P, V)/dot(P, W);
    float origin = dot(P, V);
    return vec2(origin, t);
}

//rayShape computes the in and out t of an array into any shape
//V is the origin of ray, w is the dir univec, S is the shape
vec2 rayShape(vec4 V, vec4 W, Shape S){
    //Shpere
    if (S.type == 0){
        vec3 V_prime = V.xyz;
        float discriminant = dot(V_prime,W.xyz)*dot(V_prime,W.xyz)-dot(V_prime,V_prime)+S.size*S.size;
        if (discriminant < 0.){
            return vec2(-1., -1.);
        }
        float t1 = -dot(V_prime,W.xyz)-sqrt(discriminant);
        float t2 = -dot(V_prime,W.xyz)+sqrt(discriminant);
        return vec2(t1, t2); 
    }

    //Cube
    else if (S.type == 1){
        //define 6 halfspaces of a cube
        Cube[0] = vec4(-1.,0.,0.,-S.size);
        Cube[1] = vec4(1.,0.,0.,-S.size);
        Cube[2] = vec4(0.,-1.,0.,-S.size);
        Cube[3] = vec4(0.,1.,0.,-S.size);
        Cube[4] = vec4(0.,0.,-1.,-S.size);
        Cube[5] = vec4(0.,0.,1.,-S.size);

        float tMin = -1000.;
        float tMax = 1000.;

        for (int i=0; i<NCube; i++){
            vec2 res = halfSpace(V, W, Cube[i]);
            if (res.x>0. && res.y<0.){
                return vec2(-1., -1.);
            }
            else if (res.x>0. && res.y>0.){
                if (res.y>tMin){tMin=res.y;}
            }
            else if (res.x<0. &&res.y>0.){
                if (res.y<tMax){tMax=res.y;}
            }
        }
        if (tMin<tMax){return vec2(tMin, tMax);}
        else {return vec2(-1., -1.);}
    }

    //Octahedron
    else if (S.type == 2){
        //define 8 halfspaces of an octahedron
        float r3 = 1./sqrt(3.);
        Octahedron[0] = vec4(-r3,-r3,-r3,-S.size);
        Octahedron[1] = vec4(-r3,-r3,r3,-S.size);
        Octahedron[2] = vec4(-r3,r3,-r3,-S.size);
        Octahedron[3] = vec4(-r3,r3,r3,-S.size);
        Octahedron[4] = vec4(r3,-r3,-r3,-S.size);
        Octahedron[5] = vec4(r3,-r3,r3,-S.size);
        Octahedron[6] = vec4(r3,r3,-r3,-S.size);
        Octahedron[7] = vec4(r3,r3,r3,-S.size);

        float tMin = -1000.;
        float tMax = 1000.;

        for (int i=0; i<NOctahedron; i++){
            vec2 res = halfSpace(V, W, Octahedron[i]);
            if (res.x>0. && res.y<0.){
                return vec2(-1., -1.);
            }
            else if (res.x>0. && res.y>0.){
                if (res.y>tMin){tMin=res.y;}
            }
            else if (res.x<0. &&res.y>0.){
                if (res.y<tMax){tMax=res.y;}
            }
        }
        if (tMin<tMax){return vec2(tMin, tMax);}
        else {return vec2(-1., -1.);}
    }
}

bool isInShadow(vec4 P, vec4 L, Shape S){
    for (int i=0;i<NS;i++){
        if (rayShape(P+vec4((S.center),0.)-vec4((uShapes[i].center),0.), L, uShapes[i]).x>0.001){
            return true;
        }
    }
    return false;
}

vec4 computeSurfaceNormal(vec4 P, Shape S){
    vec4 C = vec4((S.center),1.);
    //Sphere
    if (S.type == 0){
        return vec4(normalize(P-C));
    }
    //Cube
    else if (S.type == 1){
        if (abs(P.x)>abs(P.y) && abs(P.x)>abs(P.z)){
            return vec4(sign(P.x), 0., 0., 0.);
        }
        else if (abs(P.y)>abs(P.x) && abs(P.y)>abs(P.z)){
            return vec4(0., sign(P.y), 0., 0.);
        }
        else if (abs(P.z)>abs(P.x) && abs(P.z)>abs(P.y)){
            return vec4(0., 0., sign(P.z), 0.);
        }
    }
    //Octahedron
    else if (S.type == 2){
        return vec4(sign(P.xyz)*(1./sqrt(3.)),0.);
    }

}


//PhongShading
vec3 phongShading(vec4 P, vec4 W, Shape S, Material M){
    vec4 N = computeSurfaceNormal(P, S);
    vec3 color = vec3(0.,0.,0.);
    for(int j=0;j<NL;j++){
        if (!isInShadow(P,uLights[j].dir,S)){
            vec4 R = 2.*dot(N, uLights[j].dir)*N - uLights[j].dir;
            vec4 E = -W;
            color+=uLights[j].col*(M.diffuse*max(0.,dot(N,uLights[j].dir))+M.specular*pow(max(0.,dot(E,R)),M.power));
        }
    }
    return color;
}

vec4 refractRay(vec4 W, vec4 N, float refractionRate){
    vec4 Wc = dot(W, N)*N;
    vec4 Ws = W-Wc;
    vec4 Wps = Ws/refractionRate;
    vec4 Wpc = N*sqrt(1.-dot(Wps,Wps));
    vec4 Wp = normalize(Wpc+Wps);
    return Wp;
}

void main() {

uLights[0].dir=vec4(normalize(vec3(1.,1.,0.3)),0.);
uLights[0].col=vec3(1.,1.,1.);
uLights[1].dir=vec4(normalize(vec3(-1.,1.,-1.)),-1.);
//uLights[1].dir=vec4(normalize(vec3(-1.,-8.,1.)),0.);
uLights[1].col=vec3(1.,1.,1.);

//Definition for a cube
uShapes[0].type = 1;
uShapes[0].center=vec3(-.45*sin(uTime),.45*sin(uTime),.45*cos(uTime));
//uShapes[0].center=vec3(.25,-.35,.25);
uShapes[0].size = 0.12;
uMaterials[0].ambient=vec3(0.,.2,.8);
uMaterials[0].diffuse=vec3(.8,.5,.5);
uMaterials[0].specular=vec3(0.,.5,.5);
uMaterials[0].power=6.;
uMaterials[0].reflection=vec3(0.0392, 0.7098, 0.9137);
uMaterials[0].transparency=vec3(0.0, 0.5176, 1.0);
uMaterials[0].indexOfRefelction=1.2;

//Definition for an Octahedron
uShapes[1].type = 2;
uShapes[1].center= vec3(.45*sin(uTime),-.45*cos(uTime),.45*cos(uTime));
//uShapes[1].center= vec3(-.45,0.2,0.);
uShapes[1].size = 0.12;
uMaterials[1].ambient=vec3(0.7882, 0.1059, 0.1059);
uMaterials[1].diffuse=vec3(.5,.5,0.);
uMaterials[1].specular=vec3(.5,.5,0.);
uMaterials[1].power=10.;
uMaterials[1].reflection=vec3(0.9059, 0.0314, 0.0314);
uMaterials[1].transparency=vec3(0.6275, 0.1569, 0.1569);
uMaterials[1].indexOfRefelction=1.4;

//Definition for a Cube
uShapes[2].type = 1;
uShapes[2].center= vec3(.45*sin(uTime),.45*cos(uTime),-.45*sin(uTime));
//uShapes[2].center= vec3(.2,.2,-.5);
uShapes[2].size = 0.15;
uMaterials[2].ambient=vec3(0.6157, 0.149, 0.4353);
uMaterials[2].diffuse=vec3(0.8392, 0.7922, 0.149);
uMaterials[2].specular=vec3(0.2667, 0.2667, 0.1412);
uMaterials[2].power=4.;
uMaterials[2].reflection=vec3(0.6549, 0.2549, 0.6235);
uMaterials[2].transparency=vec3(0.7255, 0.1098, 0.698);
uMaterials[2].indexOfRefelction=1.5;

//Definition for an Sphere
uShapes[3].type = 0;
//uShapes[0].center=vec3(.45,.45*sin(uTime),.45*cos(uTime));
uShapes[3].center=vec3(0.,0.,0.);
uShapes[3].size = 0.18;
uMaterials[3].ambient=vec3(0.0549, 0.4275, 0.2118);
uMaterials[3].diffuse=vec3(0.0196, 0.1647, 0.2314);
uMaterials[3].specular=vec3(0.0824, 0.0196, 0.2);
uMaterials[3].power=6.;
uMaterials[3].reflection=vec3(0.3216, 0.8667, 0.0706);
uMaterials[3].transparency=vec3(0.0, 1.0, 0.8353);
uMaterials[3].indexOfRefelction=1.2;

vec4 N, P;
float tMin = 1000.;
vec3 color = vec3(0.,0.,0.);

for(int j =0; j<NS; j++)
    {
    vec4 V = vec4(0., 0., fl, 1.); //observer loc
    vec4 W = vec4(normalize(vec3(vPos.x, vPos.y, -fl)),0.);
    V = V - vec4((uShapes[j].center),0.);
    float t = rayShape(V, W, uShapes[j]).x;
    if (t>0. && t<tMin){
        //Phong shading from lights
        P=V+t*W;
        N=computeSurfaceNormal(P, uShapes[j]); 
        tMin=t;   
        color = uMaterials[j].ambient;
        color += phongShading(P, W, uShapes[j], uMaterials[j]);

        //reflection
        if (length(uMaterials[j].reflection)>0.){
            vec4 Wp = W -2.*dot(N,W)*N;
            float tMinReflection = 1000.;
            Shape S;
            Material M;
            vec4 Pp, Np;
            for (int k=0;k<NS;k++){
                if(k==j){continue;}
                float tReflection = rayShape(P+vec4((uShapes[j].center),0.)-vec4((uShapes[k].center),0.), Wp, uShapes[k]).x;
                if (tReflection>0. && tReflection<tMinReflection){
                    S=uShapes[k];
                    M=uMaterials[k];
                    Pp = P+vec4((uShapes[j].center),0.)-vec4((uShapes[k].center),0.)+tReflection*Wp;
                    Np=computeSurfaceNormal(Pp,S);
                    tMinReflection = tReflection;
                }
            }
            if (tMinReflection<1000.){
                vec3 rgbReflection = phongShading(Pp, Wp, S, M);
                color += rgbReflection*uMaterials[j].reflection;
            }
        }

        //refraction
        if (length(uMaterials[j].transparency)>0.){
            vec4 Wp = refractRay(W, N, uMaterials[j].indexOfRefelction);
            float tp = rayShape(P-Wp/1000.,Wp,uShapes[j]).y;
            vec4 Pp = P-Wp/1000.+tp*Wp;
            vec4 Np = computeSurfaceNormal(Pp, uShapes[j]);
            vec4 Wpp = -refractRay(Wp, Np, 1./uMaterials[j].indexOfRefelction);

            Shape S;
            Material M;
            float tMinRefraction = 1000.;
            vec4 Ppp, Npp;
            for(int k=0;k<NS;k++){
                if(k==j){continue;}
                float tRefraction = rayShape(Pp+vec4((uShapes[j].center),0.)-vec4((uShapes[k].center),0.), Wpp, uShapes[k]).x;
                if (tRefraction>0.001 && tRefraction<tMinRefraction){
                    S=uShapes[k];
                    M=uMaterials[k];
                    Ppp = Pp+vec4((uShapes[j].center),0.)-vec4((uShapes[k].center),0.)+tRefraction*Wpp;
                    Npp = computeSurfaceNormal(Ppp, S);
                    tMinRefraction = tRefraction;
                }
            }
            if (tMinRefraction<1000.){
                vec3 rgbRefraction = phongShading(Ppp, Wpp, S, M);
                color = color + rgbRefraction*uMaterials[j].transparency;
            }
        }

     }

}
fragColor = vec4(sqrt(color), 1.0);
    
}
