#version 300 es        // NEWER VERSION OF GLSL
precision highp float; // HIGH PRECISION FLOATS

uniform float uTime;   // TIME, IN SECONDS
in vec3 vPos;          // POSITION IN IMAGE
out vec4 fragColor;    // RESULT WILL GO HERE

const float fl = 2.; 

const int NSurface = 10;
mat4 Surface[NSurface];

const int SPHERE = 0;
const int CUBE = 1;
const int OCTAHEDRON = 2;
const int CYLINDER = 3;
const int HYPERBOLOID = 4;

const int NL = 2; // Number of light sources in the scene

struct Light{
    vec4 dir;
    vec3 col;
};
uniform Light uLights[NL];

const int NS = 5; // Number of objects in the scene

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
    mat4 matrix;
    mat4 imatrix;
};
uniform Shape uShapes[NS];

float t_front, t_back;
mat4 t_front_surface, t_back_surface;
vec4 n_front, n_back;

/* //halfSpace figure out the relation between a ray and a halfSpace
vec2 halfSpace(vec4 V, vec4 W, vec4 P){
    float t = -dot(P, V)/dot(P, W);
    float origin = dot(P, V);
    return vec2(origin, t);
} */
/* mat4 transpose(mat4 S){
    return mat4(S[0][0],S[1][0],S[2][0],S[3][0],S[0][1],S[1][1],S[2][1],S[3][1],S[0][2],S[1][2],S[2][2],S[3][2],S[0][3],S[1][3],S[2][3],S[3][3]);
} */

float in_or_out(vec4 V, mat4 S){
    return dot(V, S*V);
}

vec2 rayQuadratic(mat4 Q, vec4 V, vec4 W){
    float A=Q[0][0]*W.x*W.x+Q[0][1]*W.x*W.y+Q[0][2]*W.x*W.z+
    Q[1][1]*W.y*W.y+Q[1][2]*W.y*W.z+
    Q[2][2]*W.z*W.z;
    float B=Q[0][0]*(V.x*W.x+V.x*W.x)+Q[0][1]*(V.x*W.y+V.y*W.x)+Q[0][2]*(V.x*W.z+V.z*W.x)+Q[0][3]*W.x+
    Q[1][1]*(V.y*W.y+V.y*W.y)+Q[1][2]*(V.y*W.z+V.z*W.y)+Q[1][3]*W.y+
    Q[2][2]*(V.z*W.z+V.z*W.z)+Q[2][3]*W.z;
    float C=Q[0][0]*V.x*V.x+Q[0][1]*V.x*V.y+Q[0][2]*V.x*V.z+Q[0][3]*V.x+
    Q[1][1]*V.y*V.y+Q[1][2]*V.y*V.z+Q[1][3]*V.y+
    Q[2][2]*V.z*V.z+Q[2][3]*V.z+
    Q[3][3];
    if (A!=0.){
        float dis = B*B-4.*A*C;
        if (dis<0.){
            return vec2(-1.,-1.);
        }
        float t1 = (-B-sqrt(dis))/(2.*A);
        float t2 = (-B+sqrt(dis))/(2.*A);
        return vec2(t1, t2);
    }
    else{
        return vec2(-C/B, 0.);
    }
}

vec4 computeQuadraticNormal(vec4 P, mat4 Q){
    vec4 normal = vec4(normalize(vec3(2.*Q[0][0]*P.x+Q[0][1]*P.y+Q[0][2]*P.z+Q[0][3],
    2.*Q[1][1]*P.y+Q[1][2]*P.z+Q[1][3],2.*Q[2][2]*P.z+Q[2][3])),0.);
    return normal;
}

mat4 adjustMatrix(mat4 Q){
    return mat4(Q[0][0],Q[0][1]+Q[1][0],Q[0][2]+Q[2][0],Q[0][3]+Q[3][0],
    0.,Q[1][1],Q[1][2]+Q[2][1],Q[3][1]+Q[1][3],
    0.,0.,Q[2][2],Q[2][3]+Q[3][2],
    0.,0.,0.,Q[3][3]);
}
         
//rayShape computes the in and out t of an array into any shape
//V is the origin of ray, w is the dir univec, S is the shape
vec2 rayShape(vec4 V, vec4 W, Shape S){

    mat4 transp = transpose(S.imatrix);
    float tMin = -1000.;
    float tMax = 1000.;    

    //Shpere
    if (S.type == SPHERE){
        Surface[0] = mat4(1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,-1.);
        Surface[0] = adjustMatrix(transp*Surface[0]*S.imatrix);
        vec2 ans = rayQuadratic(Surface[0], V, W);
        t_front = ans.x;
        t_front_surface = Surface[0];
        n_front = computeQuadraticNormal(V+t_front*W, Surface[0]);
        t_back = ans.y;
        t_back_surface = Surface[0];
        n_back = computeQuadraticNormal(V+t_back*W, Surface[0]);
        return ans;
    }

    //Cube
    else if (S.type == CUBE){
        Surface[0] = mat4(0.,0.,0.,-1.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,-1.);
        Surface[1] = mat4(0.,0.,0.,1.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,-1.);
        Surface[2] = mat4(0.,0.,0.,0.,0.,0.,0.,-1.,0.,0.,0.,0.,0.,0.,0.,-1.);
        Surface[3] = mat4(0.,0.,0.,0.,0.,0.,0.,1.,0.,0.,0.,0.,0.,0.,0.,-1.);
        Surface[4] = mat4(0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,-1.,0.,0.,0.,-1.);
        Surface[5] = mat4(0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,1.,0.,0.,0.,-1.);

        for (int i=0; i<6;i++){
            Surface[i] = adjustMatrix(transp*Surface[i]*S.imatrix);
            vec2 ans = rayQuadratic(Surface[i], V, W);
            if (in_or_out(V, Surface[i])>0. && ans.x<0.){
                return vec2(-1.,-1.);
            }
            else if (in_or_out(V, Surface[i])>0. && ans.x>0.){
                if (ans.x>tMin){
                    tMin = ans.x;
                    t_front = ans.x;
                    t_front_surface = Surface[i];
                    n_front = computeQuadraticNormal(V+t_front*W, Surface[i]);
                }
            }
            else if (in_or_out(V, Surface[i])<0. && ans.x>0.){
                if (ans.x<tMax){
                    tMax = ans.x;
                    t_back = ans.x;
                    t_back_surface = Surface[i];
                    n_back = computeQuadraticNormal(V+t_back*W, Surface[i]);
                }
            }
        }

        if (tMin<tMax){return vec2(tMin, tMax);}
        else {return vec2(-1., -1.);}
    }

    //Octahedron
    else if (S.type == OCTAHEDRON){
        float r3 = 1./sqrt(3.);
        Surface[0] = mat4(0.,0.,0.,-r3,0.,0.,0.,-r3,0.,0.,0.,-r3,0.,0.,0.,-1.);
        Surface[1] = mat4(0.,0.,0.,-r3,0.,0.,0.,-r3,0.,0.,0.,r3,0.,0.,0.,-1.);
        Surface[2] = mat4(0.,0.,0.,-r3,0.,0.,0.,r3,0.,0.,0.,-r3,0.,0.,0.,-1.);
        Surface[3] = mat4(0.,0.,0.,-r3,0.,0.,0.,r3,0.,0.,0.,r3,0.,0.,0.,-1.);
        Surface[4] = mat4(0.,0.,0.,r3,0.,0.,0.,-r3,0.,0.,0.,-r3,0.,0.,0.,-1.);
        Surface[5] = mat4(0.,0.,0.,r3,0.,0.,0.,-r3,0.,0.,0.,r3,0.,0.,0.,-1.);
        Surface[6] = mat4(0.,0.,0.,r3,0.,0.,0.,r3,0.,0.,0.,-r3,0.,0.,0.,-1.);
        Surface[7] = mat4(0.,0.,0.,r3,0.,0.,0.,r3,0.,0.,0.,r3,0.,0.,0.,-1.);

        for (int i=0; i<8;i++){
            Surface[i] = adjustMatrix(transp*Surface[i]*S.imatrix);
            vec2 ans = rayQuadratic(Surface[i], V, W);
            if (in_or_out(V, Surface[i])>0. && ans.x<0.){
                return vec2(-1.,-1.);
            }
            else if (in_or_out(V, Surface[i])>0. && ans.x>0.){
                if (ans.x>tMin){
                    tMin = ans.x;
                    t_front = ans.x;
                    t_front_surface = Surface[i];
                    n_front = computeQuadraticNormal(V+t_front*W, Surface[i]);
                }
            }
            else if (in_or_out(V, Surface[i])<0. && ans.x>0.){
                if (ans.x<tMax){
                    tMax = ans.x;
                    t_back = ans.x;
                    t_back_surface = Surface[i];
                    n_back = computeQuadraticNormal(V+t_back*W, Surface[i]);
                }
            }
        }

        if (tMin<tMax){return vec2(tMin, tMax);}
        else {return vec2(-1., -1.);}
    }
    else if (S.type == CYLINDER){
        float tCMin = 1000.;
        float tCMax = -1000.;

        Surface[0] = mat4(1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,0.,0.,0.,0.,0.,-1.);
        Surface[0] = adjustMatrix(transp*Surface[0]*S.imatrix);
        vec2 ans = rayQuadratic(Surface[0], V, W);
        if(ans.x!=-1.){
            tCMin = ans.x;
            t_front = ans.x;
            t_front_surface = Surface[0];
            n_front = computeQuadraticNormal(V+t_front*W, Surface[0]);
            tCMax = ans.y;
            t_back = ans.y;
            t_back_surface = Surface[0];
            n_back = computeQuadraticNormal(V+t_back*W, Surface[0]);
        }

        Surface[1] = mat4(0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,-1.,0.,0.,0.,-1.);
        Surface[2] = mat4(0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,1.,0.,0.,0.,-1.);

        for (int i=1; i<3;i++){
            Surface[i] = adjustMatrix(transp*Surface[i]*S.imatrix);
            vec2 ans = rayQuadratic(Surface[i], V, W);
            if (in_or_out(V, Surface[i])>0. && ans.x<0.){
                return vec2(-1.,-1.);
            }
            else if (in_or_out(V, Surface[i])>0. && ans.x>0.){
                if (ans.x>tCMin){
                    tCMin = ans.x;
                    t_front = ans.x;
                    t_front_surface = Surface[i];
                    n_front = computeQuadraticNormal(V+t_front*W, Surface[i]);
                }
            }
            else if (in_or_out(V, Surface[i])<0. && ans.x>0.){
                if (ans.x<tCMax){
                    tCMax = ans.x;
                    t_back = ans.x;
                    t_back_surface = Surface[i];
                    n_back = computeQuadraticNormal(V+t_back*W, Surface[i]);
                }
            }
        }
    
        if (tCMin<tCMax){return vec2(tCMin, tCMax);}
        else {return vec2(-1., -1.);}
    }
    else if (S.type == HYPERBOLOID){
        float tCMin = 1000.;
        float tCMax = -1000.;

        Surface[0] = mat4(1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,-1.,0.,0.,0.,0.,-1.);
        Surface[0] = adjustMatrix(transp*Surface[0]*S.imatrix);
        vec2 ans = rayQuadratic(Surface[0], V, W);
        if(ans.x!=-1.){
            tCMin = ans.x;
            t_front = ans.x;
            t_front_surface = Surface[0];
            n_front = computeQuadraticNormal(V+t_front*W, Surface[0]);
            tCMax = ans.y;
            t_back = ans.y;
            t_back_surface = Surface[0];
            n_back = computeQuadraticNormal(V+t_back*W, Surface[0]);
        }

        Surface[1] = mat4(0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,-1.,0.,0.,0.,-1.);
        Surface[2] = mat4(0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,1.,0.,0.,0.,-1.);

        for (int i=1; i<3;i++){
            Surface[i] = adjustMatrix(transp*Surface[i]*S.imatrix);
            vec2 ans = rayQuadratic(Surface[i], V, W);
            if (in_or_out(V, Surface[i])>0. && ans.x<0.){
                return vec2(-1.,-1.);
            }
            else if (in_or_out(V, Surface[i])>0. && ans.x>0.){
                if (ans.x>tCMin){
                    tCMin = ans.x;
                    t_front = ans.x;
                    t_front_surface = Surface[i];
                    n_front = computeQuadraticNormal(V+t_front*W, Surface[i]);
                }
            }
            else if (in_or_out(V, Surface[i])<0. && ans.x>0.){
                if (ans.x<tCMax){
                    tCMax = ans.x;
                    t_back = ans.x;
                    t_back_surface = Surface[i];
                    n_back = computeQuadraticNormal(V+t_back*W, Surface[i]);
                }
            }
        }
    
        if (tCMin<tCMax){return vec2(tCMin, tCMax);}
        else {return vec2(-1., -1.);}
    }
}

bool isInShadow(vec4 P, vec4 L, Shape S){
    for (int i=0;i<NS;i++){
        if (rayShape(P, L, uShapes[i]).x>0.001){
            return true;
        }
    }
    return false;
}




//PhongShading
vec3 phongShading(vec4 P, vec4 W, Shape S, Material M){
    vec4 N = n_front;
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
    float t = rayShape(V, W, uShapes[j]).x;
    if (t>0. && t<tMin){
        //Phong shading from lights
        P=V+t*W;
        N=n_front;
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
                float tReflection = rayShape(P, Wp, uShapes[k]).x;
                if (tReflection>0. && tReflection<tMinReflection){
                    S=uShapes[k];
                    M=uMaterials[k];
                    Pp = P+tReflection*Wp;
                    Np=n_front;
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
            vec4 Np = n_front;
            vec4 Wpp = -refractRay(Wp, Np, 1./uMaterials[j].indexOfRefelction);

            Shape S;
            Material M;
            float tMinRefraction = 1000.;
            vec4 Ppp, Npp;
            for(int k=0;k<NS;k++){
                if(k==j){continue;}
                float tRefraction = rayShape(Pp, Wpp, uShapes[k]).x;
                if (tRefraction>0.001 && tRefraction<tMinRefraction){
                    S=uShapes[k];
                    M=uMaterials[k];
                    Ppp = Pp+tRefraction*Wpp;
                    Npp = n_front;
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
