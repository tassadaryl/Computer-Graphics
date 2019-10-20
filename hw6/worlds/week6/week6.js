"use strict"


const VERTEX_SIZE = 6; // EACH VERTEX CONSISTS OF: x,y,z, ny,ny,nz


 //////////////////////////////////////////////////////////////////
//                                                                //
//  FOR HOMEWORK, YOU CAN ALSO TRY DEFINING DIFFERENT SHAPES,     //
//  BY CREATING OTHER VERTEX ARRAYS IN ADDITION TO cubeVertices.  //
//                                                                //
 //////////////////////////////////////////////////////////////////

let createCubeVertices = () => {
   let v = [];
   let addVertex = a => {
      for (let i = 0 ; i < a.length ; i++)
         v.push(a[i]);
   }

   // EACH SQUARE CONSISTS OF TWO TRIANGLES.

   let addSquare = (a,b,c,d) => {
      addVertex(c);
      addVertex(b);
      addVertex(a);

      addVertex(b);
      addVertex(c);
      addVertex(d);
   }

   // VERTEX DATA FOR TWO OPPOSING SQUARE FACES. EACH VERTEX CONSISTS OF: x,y,z, nx,ny,nz

   let P = [[-1,-1,-1, 0,0,-1],[ 1,-1,-1, 0,0,-1],[-1, 1,-1, 0,0,-1],[ 1, 1,-1, 0,0,-1],
            [-1,-1, 1, 0,0, 1],[ 1,-1, 1, 0,0, 1],[-1, 1, 1, 0,0, 1],[ 1, 1, 1, 0,0, 1]];

   // LOOP THROUGH x,y,z. EACH TIME ADD TWO OPPOSING FACES, THEN PERMUTE COORDINATES.

   for (let n = 0 ; n < 3 ; n++) {
      addSquare(P[0],P[1],P[2],P[3]);
      addSquare(P[4],P[5],P[6],P[7]);
      for (let i = 0 ; i < P.length ; i++)
         P[i] = [P[i][1],P[i][2],P[i][0], P[i][4],P[i][5],P[i][3]];
   }

   return v;
}



let createOctahedronVertices = () => {
    let v = [];
    let r = 1.0 / Math.sqrt(3);
    let addVertex = a => {
        for (let i = 0 ; i < a.length ; i++)
           v.push(a[i]);
    }
    addVertex([-r,0,0,-r,r,r]); 
    addVertex([0,0,r,-r,r,r]);
    addVertex([0,r,0,-r,r,r]);

    addVertex([-r,0,0,-r,r,-r]);
    addVertex([0,r,0,-r,r,-r]);
    addVertex([0,0,-r,-r,r,-r]);

    addVertex([0,r,0,r,r,-r]);
    addVertex([r,0,0,r,r,-r]);
    addVertex([0,0,-r,r,r,-r]);

    addVertex([r,0,0,r,r,r]);
    addVertex([0,r,0,r,r,r]);
    addVertex([0,0,r,r,r,r]);

    addVertex([-r,0,0,-r,-r,r]);
    addVertex([0,-r,0,-r,-r,r]); 
    addVertex([0,0,r,-r,-r,r]); 

    addVertex([-r,0,0,-r,-r,-r]);
    addVertex([0,-r,0,-r,-r,-r]);
    addVertex([0,0,-r,-r,-r,-r]);

    addVertex([0,-r,0,r,-r,-r]);
    addVertex([r,0,0,r,-r,-r]);
    addVertex([0,0,-r,r,-r,-r]);

    addVertex([r,0,0,r,-r,r]);
    addVertex([0,-r,0,r,-r,r]);
    addVertex([0,0,r,r,-r,r]);

    return v;
}


let createPyramidVertices = () => {
    let v = [];
    let addVertex = a => {
        for (let i = 0 ; i < a.length ; i++)
           v.push(a[i]);
    }


    addVertex([0,Math.sqrt(2),0,0,1./3.,Math.sqrt(8)/3.]);
    addVertex([-Math.sqrt(3)/2.,0,1./2.,0,1./3.,Math.sqrt(8)/3.]);
    addVertex([Math.sqrt(3)/2.,0,1./2.,0,1./3.,Math.sqrt(8)/3.]);

    addVertex([0,0,-1,0,-1,0]);
    addVertex([-Math.sqrt(3)/2.,0,1./2.,0,-1,0]);
    addVertex([Math.sqrt(3)/2.,0,1./2.,0,-1,0]);

    addVertex([0,0,-1,-Math.sqrt(6)/3.,1./3.,-Math.sqrt(2)/3.]);
    addVertex([0,Math.sqrt(2),0,-Math.sqrt(6)/3.,1./3.,-Math.sqrt(2)/3.]);
    addVertex([-Math.sqrt(3)/2.,0,1./2.,-Math.sqrt(6)/3.,1./3.,-Math.sqrt(2)/3.]);

    addVertex([0,0,-1,Math.sqrt(6)/3.,1./3.,-Math.sqrt(2)/3.]);
    addVertex([0,Math.sqrt(2),0,Math.sqrt(6)/3.,1./3.,-Math.sqrt(2)/3.]);
    addVertex([Math.sqrt(3)/2.,0,1./2.,Math.sqrt(6)/3.,1./3.,-Math.sqrt(2)/3.]);

    let p1=(0,0,-1);
    let p2=(-Math.sqrt(3)/2.,0,1./2.);
    let p3=(Math.sqrt(3)/2.,0,1./2.);
    let p4=(0,Math.sqrt(2),0);

    return v;

}


let uvToSphere = (u,v) => {
    let theta = 2*Math.PI*u;
    let phi = Math.PI*v-Math.PI/2;
    let x = Math.cos(theta)*Math.cos(phi);
    let y = Math.sin(theta)*Math.cos(phi);
    let z = Math.sin(phi);

    return [x,y,z,x,y,z];
}

let uvToTorus = (u,v) => {
    let theta = 2*Math.PI*u;
    let phi   = 2*Math.PI*v;
    let r = 0.3;
    let x = Math.cos(theta) * (1+r*Math.cos(phi));
    let y = Math.sin(theta) * (1+r*Math.cos(phi));
    let z = r*Math.sin(phi);
    let nx = Math.cos(theta)*Math.cos(phi);
    let ny = Math.sin(theta)*Math.cos(phi);
    let nz = Math.sin(phi);

    return [x,y,z,nx,ny,nz];
}

let uvToTube = (u,v) => {
    let theta = 2*Math.PI*u;
    let x = Math.cos(theta);
    let y = Math.sin(theta);
    let z = 2*v-1;

    return [x,y,z,x,y,0];
}

let uvToCylinder = (u,v) => {
    let c = Math.cos(2*Math.PI*u);
    let s = Math.sin(2*Math.PI*u);
    let z = Math.max(-1, Math.min(1, 10*v-5));

    switch (Math.floor(5.001*v)){
        case 0: case 5:
            return [0,0,z,0,0,z];
        case 1: case 4:
            return [c,s,z,0,0,z];
        case 2: case 3:
            return [c,s,z,c,s,0];
        
    }
}

let createMesh = (M, N, callback) =>{
    let v = [];
    let addVertex = a =>{
        for (let i =0;i<a.length;i++){
            v.push(a[i]);
        }
    }
    for (let i=0;i<N-1;i++){
        for (let j=0;j<M;j++){
            let b = true;
            let x = 0;
            if (j ==0 && i!=0){
                b = false;
            }
            if(i%2 == 0){
                x=1-j*1/(M-1);
            }
            else{
                x=j*1/(M-1);
            }
            if(callback){
                if(b){
                    addVertex(callback(x,i*1/(N-1)));
                }
                addVertex(callback(x,(i+1)*1/(N-1)));
            }
        }
    }
    return v;
}
let cubeVertices = createCubeVertices();
let octahedronVertices = createOctahedronVertices();
let pyramidVertices = createPyramidVertices();
let sphereVertices = createMesh(100, 100, uvToSphere);
let torusVertices = createMesh(100, 100, uvToTorus);
let tubeVertices = createMesh(100, 100, uvToTube);
let cylinderVertices = createMesh(100, 100, uvToCylinder);

async function setup(state) {
    hotReloadFile(getPath('week6.js'));

    state.m = new Matrix();

    let libSources = await MREditor.loadAndRegisterShaderLibrariesForLiveEditing(gl, "libs", [
        { 
            key : "pnoise", path : "shaders/noise.glsl", foldDefault : true
        },
        {
            key : "sharedlib1", path : "shaders/sharedlib1.glsl", foldDefault : true
        },      
    ]);

    if (!libSources) {
        throw new Error("Could not load shader library");
    }

    // load vertex and fragment shaders from the server, register with the editor
    let shaderSource = await MREditor.loadAndRegisterShaderForLiveEditing(
        gl,
        "mainShader",
        { 
            onNeedsCompilation : (args, libMap, userData) => {
                const stages = [args.vertex, args.fragment];
                const output = [args.vertex, args.fragment];

                const implicitNoiseInclude = true;
                if (implicitNoiseInclude) {
                    let libCode = MREditor.libMap.get("pnoise");

                    for (let i = 0; i < 2; i += 1) {
                        const stageCode = stages[i];
                        const hdrEndIdx = stageCode.indexOf(';');
                        
                        /*
                        const hdr = stageCode.substring(0, hdrEndIdx + 1);
                        output[i] = hdr + "\n#line 1 1\n" + 
                                    libCode + "\n#line " + (hdr.split('\n').length) + " 0\n" + 
                                    stageCode.substring(hdrEndIdx + 1);
                        console.log(output[i]);
                        */
                        const hdr = stageCode.substring(0, hdrEndIdx + 1);
                        
                        output[i] = hdr + "\n#line 2 1\n" + 
                                    "#include<pnoise>\n#line " + (hdr.split('\n').length + 1) + " 0" + 
                            stageCode.substring(hdrEndIdx + 1);

                        //console.log(output[i]);
                    }
                }

                MREditor.preprocessAndCreateShaderProgramFromStringsAndHandleErrors(
                    output[0],
                    output[1],
                    libMap
                );
            },
            onAfterCompilation : (program) => {
                state.program = program;

                gl.useProgram(program);

                state.uCursorLoc       = gl.getUniformLocation(program, 'uCursor');
                state.uModelLoc        = gl.getUniformLocation(program, 'uModel');
                state.uProjLoc         = gl.getUniformLocation(program, 'uProj');
                state.uTimeLoc         = gl.getUniformLocation(program, 'uTime');
                state.uViewLoc         = gl.getUniformLocation(program, 'uView');
                state.uAmbientLoc      = gl.getUniformLocation(program, 'uAmbient');
                state.uDiffuseLoc      = gl.getUniformLocation(program, 'uDiffuse');
                state.uSpecularLoc     = gl.getUniformLocation(program, 'uSpecular');

                state.uLightsLoc = [];
                state.uLightsLoc[0] = {};
                state.uLightsLoc[0].dir = gl.getUniformLocation(program, 'uLights[0].dir');
                state.uLightsLoc[0].col = gl.getUniformLocation(program, 'uLights[0].col');
                state.uLightsLoc[1] = {};
                state.uLightsLoc[1].dir = gl.getUniformLocation(program, 'uLights[1].dir');
                state.uLightsLoc[1].col = gl.getUniformLocation(program, 'uLights[1].col');
            } 
        },
        {
            paths : {
                vertex   : "shaders/vertex.vert.glsl",
                fragment : "shaders/fragment.frag.glsl"
            },
            foldDefault : {
                vertex   : true,
                fragment : false
            }
        }
    );

    state.cursor = ScreenCursor.trackCursor(MR.getCanvas());

    if (!shaderSource) {
        throw new Error("Could not load shader");
    }

    // Create a square as a triangle strip consisting of two triangles
    state.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);

 ///////////////////////////////////////////////////////////
//                                                         //
//  HINT: IF YOU WANT TO IMPLEMENT MORE THAN ONE SHAPE,    //
//  YOU MIGHT WANT TO CALL gl.bufferData()                 //
//  MULTIPLE TIMES IN onDraw() INSTEAD OF HERE,            //
//  USING OTHER ARRAY VALUES IN ADDITION TO cubeVertices.  //
//                                                         //
 ///////////////////////////////////////////////////////////

    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( octahedronVertices ), gl.STATIC_DRAW);


    let bpe = Float32Array.BYTES_PER_ELEMENT;

    let aPos = gl.getAttribLocation(state.program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, bpe * VERTEX_SIZE, bpe * 0);

    let aNor = gl.getAttribLocation(state.program, 'aNor');
    gl.enableVertexAttribArray(aNor);
    gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, bpe * VERTEX_SIZE, bpe * 3);
}


 /////////////////////////////////////////////////////////////////////
//                                                                   //
//  FOR HOMEWORK, YOU NEED TO IMPLEMENT THESE SIX MATRIX FUNCTIONS.  //
//  EACH FUNCTION SHOULD RETURN AN ARRAY WITH 16 VALUES.             //
//                                                                   //
//  SINCE YOU ALREADY DID THIS FOR THE PREVIOUS ASSIGNMENT,          //
//  YOU CAN JUST USE THE FUNCTION DEFINITIONS YOU ALREADY CREATED.   //
//                                                                   //
 /////////////////////////////////////////////////////////////////////

let identity = ()       => [1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.];
let rotateX = t         => [1.,0.,0.,0.,0.,Math.cos(t),Math.sin(t),0.,0.,-Math.sin(t),Math.cos(t),0.,0.,0.,0.,1.];
let rotateY = t         => [Math.cos(t),0.,-Math.sin(t),0.,0.,1.,0.,0.,Math.sin(t),0.,Math.cos(t),0.,0.,0.,0.,1.];
let rotateZ = t         => [Math.cos(t),Math.sin(t),0.,0.,-Math.sin(t),Math.cos(t),0.,0.,0.,0.,1.,0.,0.,0.,0.,1.];
let scale = (x,y,z)     => [x ,0.,0.,0.,0.,y ,0.,0.,0.,0.,z ,0.,0.,0.,0.,1.];
let translate = (x,y,z) => [1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.,0.,x ,y ,z ,1.];

let inverse = src => {
  let dst = [], det = 0, cofactor = (c, r) => {
     let s = (i, j) => src[c+i & 3 | (r+j & 3) << 2];
     return (c+r & 1 ? -1 : 1) * ( (s(1,1) * (s(2,2) * s(3,3) - s(3,2) * s(2,3)))
                                 - (s(2,1) * (s(1,2) * s(3,3) - s(3,2) * s(1,3)))
                                 + (s(3,1) * (s(1,2) * s(2,3) - s(2,2) * s(1,3))) );
  }
  for (let n = 0 ; n < 16 ; n++) dst.push(cofactor(n >> 2, n & 3));
  for (let n = 0 ; n <  4 ; n++) det += src[n] * dst[n << 2];
  for (let n = 0 ; n < 16 ; n++) dst[n] /= det;
  return dst;
}

let multiply = (a, b) => {
   let c = [];
   for (let n = 0 ; n < 16 ; n++)
      c.push( a[n&3     ] * b[    n&12] +
              a[n&3 |  4] * b[1 | n&12] +
              a[n&3 |  8] * b[2 | n&12] +
              a[n&3 | 12] * b[3 | n&12] );
   return c;
}

let Matrix = function() {
   let topIndex = 0,
       stack = [ identity() ],
       getVal = () => stack[topIndex],
       setVal = m => stack[topIndex] = m;

   this.identity  = ()      => setVal(identity());
   this.restore   = ()      => --topIndex;
   this.rotateX   = t       => setVal(multiply(getVal(), rotateX(t)));
   this.rotateY   = t       => setVal(multiply(getVal(), rotateY(t)));
   this.rotateZ   = t       => setVal(multiply(getVal(), rotateZ(t)));
   this.save      = ()      => stack[++topIndex] = stack[topIndex-1].slice();
   this.scale     = (x,y,z) => setVal(multiply(getVal(), scale(x,y,z)));
   this.translate = (x,y,z) => setVal(multiply(getVal(), translate(x,y,z)));
   this.value     = ()      => getVal();
}

function onStartFrame(t, state) {

    // uTime IS TIME IN SECONDS SINCE START TIME.
    state.ambient = [0.5,0.5,0];
    state.diffuse = [0.15,0.25,0];
    state.specular= [0.01,0.01,0.02,5];

    if (!state.tStart)
        state.tStart = t;
    state.time = (t - state.tStart) / 1000;

    gl.uniform1f (state.uTimeLoc  , state.time);

    gl.uniform3fv(state.uLightsLoc[0].dir, [1,1,1]);
    gl.uniform3fv(state.uLightsLoc[0].col, [1., 1., 1.]);
    //gl.uniform3fv(state.uLightsLoc[1].dir, [-.5774,.5774,-.5774]);
    gl.uniform3fv(state.uLightsLoc[1].dir, [-1,1,1]);
    gl.uniform3fv(state.uLightsLoc[1].col, [1., 1., 1.]);


    // uCursor WILL GO FROM -1 TO +1 IN xy, WITH z = 0 FOR MOUSE UP, 1 FOR MOUSE DOWN.

    let cursorValue = () => {
       let p = state.cursor.position(), canvas = MR.getCanvas();
       return [ p[0] / canvas.clientWidth * 2 - 1, 1 - p[1] / canvas.clientHeight * 2, p[2] ];
    }

    gl.uniform3fv(state.uCursorLoc, cursorValue());


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
}

function onDraw(t, projMat, viewMat, state, eyeIdx) {

    let m = state.m;

    gl.uniformMatrix4fv(state.uViewLoc, false, new Float32Array(viewMat));
    gl.uniformMatrix4fv(state.uProjLoc, false, new Float32Array(projMat));

    let drawShape = (ambient, diffuse, specular, type, vertices) => {
        gl.uniform3fv(state.uAmbientLoc, ambient );
        gl.uniform3fv(state.uDiffuseLoc, diffuse );
        gl.uniform4fv(state.uSpecularLoc,specular);
        gl.uniformMatrix4fv(state.uModelLoc, false, m.value());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.drawArrays(type, 0, vertices.length / VERTEX_SIZE);
     }

/*     m.identity();
    m.translate(-.6,.5,-4);
    m.scale(.4,.4,.4);
    drawShape([0.15,0.15,0], [0.15,0.25,0], [0.01,0.01,0.02,5], gl.TRIANGLE_STRIP, sphereVertices);

    m.identity();
    m.translate(-.6,-.5,-4);
    m.rotateY(-1);
    m.rotateX(-1);
    m.scale(.29,.29,.29);
    drawShape([0.1,0,0.21], [0.3,0.2,0],[0.1,0.1,0.1,10], gl.TRIANGLES, cubeVertices);

    m.identity();
    m.translate(.6,.5,-4);
    m.rotateY(-1);
    m.rotateX(.5);
    m.scale(.33,.33,.33);
    drawShape([0,0.4,0.1], [0,0.3,0.3], [0.2,0.2,0.4,15], gl.TRIANGLE_STRIP, torusVertices);

    m.identity();
    m.translate(.6,-.5,-4);
    m.rotateY(-.5);
    m.rotateX(-.5);
    m.scale(.33,.33,.4);
    drawShape([1,.5,.5], [0.5,0.5,0.3],[0,2,0.4,0.05,1], gl.TRIANGLE_STRIP, cylinderVertices); */


 //////////////////////////////////////////////////////////////////////
//                                                                    //
//  THIS IS THE EXAMPLE OF TWO WAVING ARMS THAT WE CREATED IN CLASS.  //
//  FOR HOMEWORK, YOU WILL WANT TO DO SOMETHING DIFFERENT.            //
//                                                                    //
 //////////////////////////////////////////////////////////////////////

     m.identity();
     m.translate(0,0,-5);
     let theta = Math.sin(state.time);
     m.rotateY(0.3*theta);
     m.save();
        //head
        m.scale(0.2,0.2,0,2);
        drawShape(state.ambient, state.diffuse, state.specular, gl.TRIANGLE_STRIP, sphereVertices);
     m.restore();
     //torso
     m.translate(0,-0.55,0);
     m.save();
        m.scale(0.18,0.36,0.18);
        drawShape(state.ambient, state.diffuse, state.specular, gl.TRIANGLE_STRIP, cubeVertices);
     m.restore();
     m.save();
     //left arm
        m.translate(-0.18,0.2,0);
        m.rotateZ(theta);
        m.translate(-0.2,0,0);
        m.save();
            //left shoulder
            m.scale(0.2,0.05,0.05);
            drawShape(state.ambient, state.diffuse, state.specular, gl.TRIANGLE_STRIP, cubeVertices);
        m.restore();
        m.translate(-0.25,0,0);
        m.save();
            //left elbow
            m.scale(0.05,0.05,0.05);
            drawShape(state.ambient, state.diffuse, state.specular, gl.TRIANGLE_STRIP, sphereVertices);
        m.restore();
        m.translate(-0.18,-0.1,0);
        m.save();
            //front arm
            m.rotateZ(10);
            m.scale(0.15,0.05,0.05);
            drawShape(state.ambient, state.diffuse, state.specular, gl.TRIANGLE_STRIP, cylinderVertices);
        m.restore();
        m.translate(-0.18,-0.1,0);
        m.save();
            m.rotateX(10*state.time);
            m.rotateY(10*state.time);
            m.scale(0.08,0.08,0.08);
            drawShape([1,0,0], state.diffuse, state.specular, gl.TRIANGLE_STRIP, torusVertices);
        m.restore();
        m.save();
            m.rotateX(6*state.time);
            m.rotateZ(6*state.time);
            m.scale(0.16,0.16,0.16);
            drawShape([0,1,0], state.diffuse, state.specular, gl.TRIANGLE_STRIP, torusVertices);
        m.restore();
        m.save();
            m.rotateY(2*state.time);
            m.rotateZ(2*state.time);
            m.scale(0.24,0.24,0.24);
            drawShape([0,0,1], state.diffuse, state.specular, gl.TRIANGLE_STRIP, torusVertices);
        m.restore();
    m.restore();
    m.save();
    //right arm
        m.translate(0.18,0.2,0);
        m.rotateZ(0.3*theta);
        m.translate(0.2,0,0);
        m.save();
            //right shoulder
            m.scale(0.2,0.05,0.05);
            drawShape(state.ambient, state.diffuse, state.specular, gl.TRIANGLE_STRIP, cubeVertices);
        m.restore();
        m.translate(0.25,0,0);
        m.save();
            //right elbow
            m.scale(0.05,0.05,0.05);
            drawShape(state.ambient, state.diffuse, state.specular, gl.TRIANGLE_STRIP, sphereVertices);
        m.restore();
        m.translate(0.1,0,0);
        m.rotateY(theta);
        m.translate(0.15,0,0);
        m.save();
            //front arm
            m.scale(0.2,0.05,0.05);
            drawShape(state.ambient, state.diffuse, state.specular, gl.TRIANGLE_STRIP, cylinderVertices);
        m.restore();
        m.translate(0.4,0,0);
        m.rotateX(6*state.time);
        m.rotateZ(6*state.time);
        m.rotateY(6*state.time);
        m.translate(0,Math.max(0,theta),0);
        m.save();
            m.scale(0.2*theta,0.2,0.2);
            drawShape([0.2,0.4,0.6], state.diffuse, state.specular, gl.TRIANGLE_STRIP, octahedronVertices);
        m.restore();
    m.restore();
    m.translate(0,-0.36,0);
    //lower body
    m.save();
        m.rotateY(10*theta);
        m.translate(0,-0.16,0);
        m.scale(0.15,0.15,0.15);
        drawShape([0.6,0,0.6], state.diffuse, state.specular, gl.TRIANGLE_STRIP, cylinderVertices);
    m.restore();






} 

function onEndFrame(t, state) {
}

export default function main() {
    const def = {
        name         : 'week6',
        setup        : setup,
        onStartFrame : onStartFrame,
        onEndFrame   : onEndFrame,
        onDraw       : onDraw,
    };

    return def;
}
