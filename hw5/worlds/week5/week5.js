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

let cubeVertices = createCubeVertices();

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

let octahedronVertices = createOctahedronVertices();


async function setup(state) {
    hotReloadFile(getPath('week5.js'));

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

    state.ambient = [0.7882, 0.1059, 0.1059];
    state.diffuse = [.5,.5,0.];
    state.specular = [.5,.5,0.,10.];

    // uTime IS TIME IN SECONDS SINCE START TIME.

    if (!state.tStart)
        state.tStart = t;
    state.time = (t - state.tStart) / 1000;

    gl.uniform1f (state.uTimeLoc  , state.time);

    gl.uniform3fv(state.uLightsLoc[0].dir, [-.6917,.6917,-.2075]);
    gl.uniform3fv(state.uLightsLoc[0].col, [1., 1., 1.]);
    gl.uniform3fv(state.uLightsLoc[1].dir, [-.5774,.5774,-.5774]);
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


 //////////////////////////////////////////////////////////////////////
//                                                                    //
//  THIS IS THE EXAMPLE OF TWO WAVING ARMS THAT WE CREATED IN CLASS.  //
//  FOR HOMEWORK, YOU WILL WANT TO DO SOMETHING DIFFERENT.            //
//                                                                    //
 //////////////////////////////////////////////////////////////////////
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( cubeVertices ), gl.STATIC_DRAW);

    m.save();
    m.identity();
    m.translate(0,0,-5);

        //drawing a cat
        m.rotateX(.2);
        m.rotateY(-.4);
        m.rotateZ(-.15);
        let theta = Math.sin(3 * state.time);
        m.translate(0,0.5*theta,0.5*theta);
        m.save();
        //torso
            m.rotateY(-0.1*theta);
            m.scale(0.5,0.3,0.3);
            gl.uniform3fv(state.uAmbientLoc, state.ambient );
            gl.uniform3fv(state.uDiffuseLoc, state.diffuse );
            gl.uniform4fv(state.uSpecularLoc,state.specular);
            gl.uniformMatrix4fv(state.uModelLoc, false, m.value() );
            gl.drawArrays(gl.TRIANGLES, 0, cubeVertices.length / VERTEX_SIZE);
        m.restore();
        m.save();
        //tail
            state.ambientTail = [0.9, 0.7, 0.7];
            state.diffuseTail = [.5,.5,0.];
            state.specularTail= [.5,.5,0.,10.];
            m.translate(-.6, 0., 0.);
            m.rotateZ(-0.6);
            m.rotateY(0.2*theta);
            m.translate(-0.1,0.,0.);
            m.scale(0.5,0.05,0.05);
            gl.uniform3fv(state.uAmbientLoc, state.ambientTail );
            gl.uniform3fv(state.uDiffuseLoc, state.diffuseTail );
            gl.uniform4fv(state.uSpecularLoc,state.specularTail);
            gl.uniformMatrix4fv(state.uModelLoc, false, m.value() );
            gl.drawArrays(gl.TRIANGLES, 0, cubeVertices.length / VERTEX_SIZE);
        m.restore();
        m.save();
        //head
        state.ambient = [0.24725 ,0.2245 ,0.06455];
        state.diffuse = [0.34615 ,0.3143 ,0.0903];
        state.specular = [0.797357 ,0.723991 ,0.208006 ,1];  
            m.translate(.55,.2,0.);
            m.scale(0.1,0.15,0.35);
            gl.uniform3fv(state.uAmbientLoc, state.ambient );
            gl.uniform3fv(state.uDiffuseLoc, state.diffuse );
            gl.uniform4fv(state.uSpecularLoc,state.specular);
            gl.uniformMatrix4fv(state.uModelLoc, false, m.value() );
            gl.drawArrays(gl.TRIANGLES, 0, cubeVertices.length / VERTEX_SIZE);
        m.restore();
        m.save();
        state.ambient = [0.05375, 0.05, 0.06625];
        state.diffuse = [0.18275, 0.17, 0.22525];
        state.specular = [0.332741, 0.328634, 0.346435, 0.92];    
        //right behind leg
            m.translate(-0.4,-0.3,0.18);
            m.rotateZ(0.2*theta);
            m.translate(0,-0.1,0);
            m.scale(0.08,0.15,0.08);
            gl.uniform3fv(state.uAmbientLoc, state.ambient );
            gl.uniform3fv(state.uDiffuseLoc, state.diffuse );
            gl.uniform4fv(state.uSpecularLoc,state.specular);
            gl.uniformMatrix4fv(state.uModelLoc, false, m.value() );
            gl.drawArrays(gl.TRIANGLES, 0, cubeVertices.length / VERTEX_SIZE);
        m.restore();
        m.save();
        //left behind leg
            m.translate(-0.4,-0.3,-0.18);
            m.rotateZ(-0.2*theta);
            m.translate(0,-0.1,0);
            m.scale(0.08,0.15,0.08);
            gl.uniform3fv(state.uAmbientLoc, state.ambient );
            gl.uniform3fv(state.uDiffuseLoc, state.diffuse );
            gl.uniform4fv(state.uSpecularLoc,state.specular);
            gl.uniformMatrix4fv(state.uModelLoc, false, m.value() );
            gl.drawArrays(gl.TRIANGLES, 0, cubeVertices.length / VERTEX_SIZE);
        m.restore();
        m.save();
        //left front leg
            m.translate(0.4,-0.3,-0.18);
            m.rotateZ(0.2*theta);
            m.translate(0,-0.1,0);
            m.scale(0.08,0.15,0.08);
            gl.uniform3fv(state.uAmbientLoc, state.ambient );
            gl.uniform3fv(state.uDiffuseLoc, state.diffuse );
            gl.uniform4fv(state.uSpecularLoc,state.specular);
            gl.uniformMatrix4fv(state.uModelLoc, false, m.value() );
            gl.drawArrays(gl.TRIANGLES, 0, cubeVertices.length / VERTEX_SIZE);
        m.restore();
        m.save();
        //right front leg
            m.translate(0.4,-0.3,0.18);
            m.rotateZ(-0.2*theta);
            m.translate(0,-0.1,0);
            m.scale(0.08,0.15,0.08);
            gl.uniform3fv(state.uAmbientLoc, state.ambient );
            gl.uniform3fv(state.uDiffuseLoc, state.diffuse );
            gl.uniform4fv(state.uSpecularLoc,state.specular);
            gl.uniformMatrix4fv(state.uModelLoc, false, m.value() );
            gl.drawArrays(gl.TRIANGLES, 0, cubeVertices.length / VERTEX_SIZE);
        m.restore();


        //drawing a stair
        state.stairShift = state.time%4;
        for(let i =-4;i<6;i+=0.7){
            m.save();
            m.translate(-state.stairShift*0.7+i, -0.7, 0.);
            m.scale(0.1,0.1,0.8);
            state.ambientStair = [0.0215, 0.1745, 0.0215];
            state.diffuseStair = [0.07568 ,0.61424 ,0.07568];
            state.specularStair= [0.633, 0.727811 ,0.633,0.55];
            gl.uniform3fv(state.uAmbientLoc, state.ambientStair );
            gl.uniform3fv(state.uDiffuseLoc, state.diffuseStair );
            gl.uniform4fv(state.uSpecularLoc,state.specularStair);
            gl.uniformMatrix4fv(state.uModelLoc, false, m.value() );
            gl.drawArrays(gl.TRIANGLES, 0, cubeVertices.length / VERTEX_SIZE);
            m.restore();
        }

    m.restore();

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( octahedronVertices ), gl.STATIC_DRAW);

    m.save();
    m.identity();
    m.translate(0,0,-5);
    m.rotateX(.2);
    m.rotateY(-.4);
    m.rotateZ(-.15);
    m.translate(0,0.5*theta,0.5*theta);
    m.translate(.55,.2,0.);
    state.ambientEar = [0, 0.5, 0.5];
    state.diffuseEar = [.05,.05,0.];
    state.specularEar= [.5,.5,0.,10.];
    
        //ear1
        m.save();
            m.translate(0,0.2,0.2);
            m.rotateZ(0.2*theta);
            m.scale(0.2,0.2,0.2);
            gl.uniform3fv(state.uAmbientLoc, state.ambientEar );
            gl.uniform3fv(state.uDiffuseLoc, state.diffuseEar );
            gl.uniform4fv(state.uSpecularLoc,state.specularEar);
            gl.uniformMatrix4fv(state.uModelLoc, false, m.value() );
            gl.drawArrays(gl.TRIANGLES, 0, octahedronVertices.length / VERTEX_SIZE);
        m.restore();
        //ear2
        m.save();
            m.translate(0,0.2,-0.2);
            m.rotateZ(0.2*theta);
            m.scale(0.2,0.2,0.2);
            gl.uniform3fv(state.uAmbientLoc, state.ambientEar );
            gl.uniform3fv(state.uDiffuseLoc, state.diffuseEar );
            gl.uniform4fv(state.uSpecularLoc,state.specularEar);
            gl.uniformMatrix4fv(state.uModelLoc, false, m.value() );
            gl.drawArrays(gl.TRIANGLES, 0, octahedronVertices.length / VERTEX_SIZE);
        m.restore();
    m.restore();
}

function onEndFrame(t, state) {
}

export default function main() {
    const def = {
        name         : 'week5',
        setup        : setup,
        onStartFrame : onStartFrame,
        onEndFrame   : onEndFrame,
        onDraw       : onDraw,
    };

    return def;
}
