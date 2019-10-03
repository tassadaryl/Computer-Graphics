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
uniform Light uLights[NL];

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
uniform Material uMaterials[NS];

struct Shape {
    int   type;   // 0 for Sphere. 1 for Cube. 2 for Octahedron
    vec4  center;
    float size;
};
uniform Shape uShapes[NS];

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
        if (rayShape(P+S.center-uShapes[i].center, L, uShapes[i]).x>0.001){
            return true;
        }
    }
    return false;
}

vec4 computeSurfaceNormal(vec4 P, Shape S){
    vec4 C = S.center;
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

vec4 N, P;
float tMin = 1000.;
vec3 color = vec3(0.,0.,0.);

for(int j =0; j<NS; j++)
    {
    vec4 V = vec4(0., 0., fl, 1.); //observer loc
    vec4 W = vec4(normalize(vec3(vPos.x, vPos.y, -fl)),0.);
    V = V - uShapes[j].center + vec4(0.,0.,0.,1.);
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
                float tReflection = rayShape(P+uShapes[j].center-uShapes[k].center, Wp, uShapes[k]).x;
                if (tReflection>0. && tReflection<tMinReflection){
                    S=uShapes[k];
                    M=uMaterials[k];
                    Pp = P+uShapes[j].center-uShapes[k].center+tReflection*Wp;
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
                float tRefraction = rayShape(Pp+uShapes[j].center-uShapes[k].center, Wpp, uShapes[k]).x;
                if (tRefraction>0.001 && tRefraction<tMinRefraction){
                    S=uShapes[k];
                    M=uMaterials[k];
                    Ppp = Pp+uShapes[j].center-uShapes[k].center+tRefraction*Wpp;
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
