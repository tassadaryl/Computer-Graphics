"use strict"

async function setup(state) {
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
                        
                        const hdr = stageCode.substring(0, hdrEndIdx + 1);
                        
                        output[i] = hdr + "\n#line 2 1\n" + 
                                    "#include<pnoise>\n#line " + (hdr.split('\n').length + 1) + " 0" + 
                            stageCode.substring(hdrEndIdx + 1);

                        console.log(output[i]);
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

                // Assign MVP matrices
                state.uModelLoc        = gl.getUniformLocation(program, 'uModel');
                state.uViewLoc         = gl.getUniformLocation(program, 'uView');
                state.uProjLoc         = gl.getUniformLocation(program, 'uProj');
                state.uTimeLoc         = gl.getUniformLocation(program, 'uTime');

                state.uLightsLoc = [];
                state.uLightsLoc[0] = {};
                state.uLightsLoc[0].dir = gl.getUniformLocation(program, 'uLights[0].dir');
                state.uLightsLoc[0].col = gl.getUniformLocation(program, 'uLights[0].col');
                state.uLightsLoc[1] = {};
                state.uLightsLoc[1].dir = gl.getUniformLocation(program, 'uLights[1].dir');
                state.uLightsLoc[1].col = gl.getUniformLocation(program, 'uLights[1].col');

                state.uShapesLoc = [];
                state.uShapesLoc[0] = {};
                state.uShapesLoc[0].type   = gl.getUniformLocation(program, 'uShapes[0].type');
                state.uShapesLoc[0].center = gl.getUniformLocation(program, 'uShapes[0].center');
                state.uShapesLoc[0].size   = gl.getUniformLocation(program, 'uShapes[0].size');
                state.uShapesLoc[1] = {};
                state.uShapesLoc[1].type   = gl.getUniformLocation(program, 'uShapes[1].type');
                state.uShapesLoc[1].center = gl.getUniformLocation(program, 'uShapes[1].center');
                state.uShapesLoc[1].size   = gl.getUniformLocation(program, 'uShapes[1].size');
                state.uShapesLoc[2] = {};
                state.uShapesLoc[2].type   = gl.getUniformLocation(program, 'uShapes[2].type');
                state.uShapesLoc[2].center = gl.getUniformLocation(program, 'uShapes[2].center');
                state.uShapesLoc[2].size   = gl.getUniformLocation(program, 'uShapes[2].size');
                state.uShapesLoc[3] = {};
                state.uShapesLoc[3].type   = gl.getUniformLocation(program, 'uShapes[3].type');
                state.uShapesLoc[3].center = gl.getUniformLocation(program, 'uShapes[3].center');
                state.uShapesLoc[3].size   = gl.getUniformLocation(program, 'uShapes[3].size');

                state.uMaterialsLoc = [];
                state.uMaterialsLoc[0] = {};
                state.uMaterialsLoc[0].ambient          = gl.getUniformLocation(program, 'uMaterials[0].ambient');
                state.uMaterialsLoc[0].diffuse          = gl.getUniformLocation(program, 'uMaterials[0].diffuse');
                state.uMaterialsLoc[0].specular         = gl.getUniformLocation(program, 'uMaterials[0].specular');
                state.uMaterialsLoc[0].power            = gl.getUniformLocation(program, 'uMaterials[0].power');
                state.uMaterialsLoc[0].reflection       = gl.getUniformLocation(program, 'uMaterials[0].reflection');
                state.uMaterialsLoc[0].transparency     = gl.getUniformLocation(program, 'uMaterials[0].transparency');
                state.uMaterialsLoc[0].indexOfRefelction= gl.getUniformLocation(program, 'uMaterials[0].indexOfRefelction');
                state.uMaterialsLoc[1] = {};
                state.uMaterialsLoc[1].ambient          = gl.getUniformLocation(program, 'uMaterials[1].ambient');
                state.uMaterialsLoc[1].diffuse          = gl.getUniformLocation(program, 'uMaterials[1].diffuse');
                state.uMaterialsLoc[1].specular         = gl.getUniformLocation(program, 'uMaterials[1].specular');
                state.uMaterialsLoc[1].power            = gl.getUniformLocation(program, 'uMaterials[1].power');
                state.uMaterialsLoc[1].reflection       = gl.getUniformLocation(program, 'uMaterials[1].reflection');
                state.uMaterialsLoc[1].transparency     = gl.getUniformLocation(program, 'uMaterials[1].transparency');
                state.uMaterialsLoc[1].indexOfRefelction= gl.getUniformLocation(program, 'uMaterials[1].indexOfRefelction');
                state.uMaterialsLoc[2] = {};
                state.uMaterialsLoc[2].ambient          = gl.getUniformLocation(program, 'uMaterials[2].ambient');
                state.uMaterialsLoc[2].diffuse          = gl.getUniformLocation(program, 'uMaterials[2].diffuse');
                state.uMaterialsLoc[2].specular         = gl.getUniformLocation(program, 'uMaterials[2].specular');
                state.uMaterialsLoc[2].power            = gl.getUniformLocation(program, 'uMaterials[2].power');
                state.uMaterialsLoc[2].reflection       = gl.getUniformLocation(program, 'uMaterials[2].reflection');
                state.uMaterialsLoc[2].transparency     = gl.getUniformLocation(program, 'uMaterials[2].transparency');
                state.uMaterialsLoc[2].indexOfRefelction= gl.getUniformLocation(program, 'uMaterials[2].indexOfRefelction');
                state.uMaterialsLoc[3] = {};
                state.uMaterialsLoc[3].ambient          = gl.getUniformLocation(program, 'uMaterials[3].ambient');
                state.uMaterialsLoc[3].diffuse          = gl.getUniformLocation(program, 'uMaterials[3].diffuse');
                state.uMaterialsLoc[3].specular         = gl.getUniformLocation(program, 'uMaterials[3].specular');
                state.uMaterialsLoc[3].power            = gl.getUniformLocation(program, 'uMaterials[3].power');
                state.uMaterialsLoc[3].reflection       = gl.getUniformLocation(program, 'uMaterials[3].reflection');
                state.uMaterialsLoc[3].transparency     = gl.getUniformLocation(program, 'uMaterials[3].transparency');
                state.uMaterialsLoc[3].indexOfRefelction= gl.getUniformLocation(program, 'uMaterials[3].indexOfRefelction');

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

    if (!shaderSource) {
        throw new Error("Could not load shader");
    }


    // Create a square as a triangle strip consisting of two triangles
    state.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,0, 1,1,0, -1,-1,0, 1,-1,0]), gl.STATIC_DRAW);

    // Assign aPos attribute to each vertex
    let aPos = gl.getAttribLocation(state.program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
}

// NOTE: t is the elapsed time since system start in ms, but
// each world could have different rules about time elapsed and whether the time
// is reset after returning to the world
function onStartFrame(t, state) {
    // (KTR) TODO implement option so a person could pause and resume elapsed time
    // if someone visits, leaves, and later returns
    let tStart = t;
    if (!state.tStart) {
        state.tStart = t;
        state.time = t;
    }

    tStart = state.tStart;

    let now = (t - tStart);
    // different from t, since t is the total elapsed time in the entire system, best to use "state.time"
    state.time = now;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let time = now / 1000;

    gl.uniform1f(state.uTimeLoc, time);

    gl.uniform4fv(state.uLightsLoc[0].dir, [.6917,.6917,.2075,0.]);
    gl.uniform3fv(state.uLightsLoc[0].col, [1., 1., 1.]);
    gl.uniform4fv(state.uLightsLoc[1].dir, [-.5774,.5774,-.5774,0.]);
    gl.uniform3fv(state.uLightsLoc[1].col, [1., 1., 1.]);

    gl.uniform1i(state.uShapesLoc[0].type, 1);
    gl.uniform4fv(state.uShapesLoc[0].center, [-.45*Math.sin(time),.45*Math.sin(time),.45*Math.cos(time), 1.]);
    gl.uniform1f(state.uShapesLoc[0].size, .12);

    gl.uniform3fv(state.uMaterialsLoc[0].ambient     , [0.,.2,.8]);
    gl.uniform3fv(state.uMaterialsLoc[0].diffuse     , [.8,.5,.5]);
    gl.uniform3fv(state.uMaterialsLoc[0].specular    , [0.,.5,.5]);
    gl.uniform1f (state.uMaterialsLoc[0].power       , 6.);
    gl.uniform3fv(state.uMaterialsLoc[0].reflection  , [0.0392, 0.7098, 0.9137]);
    gl.uniform3fv(state.uMaterialsLoc[0].transparency, [0.0, 0.5176, 1.0]);
    gl.uniform1f (state.uMaterialsLoc[0].indexOfRefelction, 1.2);

    gl.uniform1i(state.uShapesLoc[1].type, 2);
    gl.uniform4fv(state.uShapesLoc[1].center, [.45*Math.sin(time),-.45*Math.cos(time),.45*Math.cos(time), 1.]);
    gl.uniform1f(state.uShapesLoc[1].size, .12);

    gl.uniform3fv(state.uMaterialsLoc[1].ambient     , [0.7882, 0.1059, 0.1059]);
    gl.uniform3fv(state.uMaterialsLoc[1].diffuse     , [.5,.5,0.]);
    gl.uniform3fv(state.uMaterialsLoc[1].specular    , [.5,.5,0.]);
    gl.uniform1f (state.uMaterialsLoc[1].power       , 10.);
    gl.uniform3fv(state.uMaterialsLoc[1].reflection  , [0.9059, 0.0314, 0.0314]);
    gl.uniform3fv(state.uMaterialsLoc[1].transparency, [0.6275, 0.1569, 0.1569]);
    gl.uniform1f (state.uMaterialsLoc[1].indexOfRefelction, 1.4);

    gl.uniform1i(state.uShapesLoc[2].type, 2);
    gl.uniform4fv(state.uShapesLoc[2].center, [.45*Math.sin(time),.45*Math.cos(time),-.45*Math.sin(time), 1.]);
    gl.uniform1f(state.uShapesLoc[2].size, .12);

    gl.uniform3fv(state.uMaterialsLoc[2].ambient     , [0.6157, 0.149, 0.4353]);
    gl.uniform3fv(state.uMaterialsLoc[2].diffuse     , [0.8392, 0.7922, 0.149]);
    gl.uniform3fv(state.uMaterialsLoc[2].specular    , [0.1725, 0.1725, 0.1098]);
    gl.uniform1f (state.uMaterialsLoc[2].power       , 4.);
    gl.uniform3fv(state.uMaterialsLoc[2].reflection  , [0.6549, 0.2549, 0.6235]);
    gl.uniform3fv(state.uMaterialsLoc[2].transparency, [0.7255, 0.1098, 0.698]);
    gl.uniform1f (state.uMaterialsLoc[2].indexOfRefelction, 1.5);
    
    gl.uniform1i(state.uShapesLoc[3].type, 0);
    gl.uniform4fv(state.uShapesLoc[3].center, [0.,0.,0.,1.]);
    gl.uniform1f(state.uShapesLoc[3].size, .18);

    gl.uniform3fv(state.uMaterialsLoc[3].ambient     , [0.0549, 0.4275, 0.2118]);
    gl.uniform3fv(state.uMaterialsLoc[3].diffuse     , [0.0196, 0.1647, 0.2314]);
    gl.uniform3fv(state.uMaterialsLoc[3].specular    , [0.0824, 0.0196, 0.2]);
    gl.uniform1f (state.uMaterialsLoc[3].power       , 6.);
    gl.uniform3fv(state.uMaterialsLoc[3].reflection  , [0.3216, 0.8667, 0.0706]);
    gl.uniform3fv(state.uMaterialsLoc[3].transparency, [0.0, 1.0, 0.8353]);
    gl.uniform1f (state.uMaterialsLoc[3].indexOfRefelction, 1.2);

    gl.enable(gl.DEPTH_TEST);
}

function onDraw(t, projMat, viewMat, state, eyeIdx) {
    const sec = state.time / 1000;

    const my = state;
  
    gl.uniformMatrix4fv(my.uModelLoc, false, new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-1,1]));
    gl.uniformMatrix4fv(my.uViewLoc, false, new Float32Array(viewMat));
    gl.uniformMatrix4fv(my.uProjLoc, false, new Float32Array(projMat));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function onEndFrame(t, state) {
}

export default function main() {
    const def = {
        name         : 'week3',
        setup        : setup,
        onStartFrame : onStartFrame,
        onEndFrame   : onEndFrame,
        onDraw       : onDraw,
    };

    return def;
}
