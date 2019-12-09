"use strict"

////////////////////////////// MATRIX SUPPORT
let dot = (a, b) => {
   let value = 0;
   for (let i = 0 ; i < a.length ; i++)
      value += a[i] * b[i];
   return value;
}

let cos = t => Math.cos(t);
let sin = t => Math.sin(t);
let identity = ()       => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
let rotateX = t         => [1,0,0,0, 0,cos(t),sin(t),0, 0,-sin(t),cos(t),0, 0,0,0,1];
let rotateY = t         => [cos(t),0,-sin(t),0, 0,1,0,0, sin(t),0,cos(t),0, 0,0,0,1];
let rotateZ = t         => [cos(t),sin(t),0,0, -sin(t),cos(t),0,0, 0,0,1,0, 0,0,0,1];
let scale = (x,y,z)     => [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1];
let translate = (x,y,z) => [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];
let multiply = (a, b)   => {
   let c = [];
   for (let n = 0 ; n < 16 ; n++)
      c.push( a[n&3     ] * b[    n&12] +
              a[n&3 |  4] * b[1 | n&12] +
              a[n&3 |  8] * b[2 | n&12] +
              a[n&3 | 12] * b[3 | n&12] );
   return c;
}
let fromQuaternion = q => {
   var x = q[0], y = q[1], z = q[2], w = q[3];
   return [ 1 - 2 * (y * y + z * z),     2 * (z * w + x * y),     2 * (x * z - y * w), 0,
                2 * (y * x - z * w), 1 - 2 * (z * z + x * x),     2 * (x * w + y * z), 0,
                2 * (y * w + z * x),     2 * (z * y - x * w), 1 - 2 * (x * x + y * y), 0,  0,0,0,1 ];
}
let inverse = a => {
  let b = [], d = 0, cf = (c, r) => {
     let s = (i, j) => a[c+i & 3 | (r+j & 3) << 2];
     return (c+r & 1 ? -1 : 1) * ( (s(1,1) * (s(2,2) * s(3,3) - s(3,2) * s(2,3)))
                                 - (s(2,1) * (s(1,2) * s(3,3) - s(3,2) * s(1,3)))
                                 + (s(3,1) * (s(1,2) * s(2,3) - s(2,2) * s(1,3))) );
  }
  for (let n = 0 ; n < 16 ; n++) b.push(cf(n >> 2, n & 3));
  for (let n = 0 ; n <  4 ; n++) d += a[n] * b[n << 2];
  for (let n = 0 ; n < 16 ; n++) b[n] /= d;
  return b;
}

let Matrix = function() {
   let topIndex = 0,
       stack = [ identity() ],
       getVal = () => stack[topIndex],
       setVal = m => { stack[topIndex] = m; return this; }

   this.identity  = ()      => setVal(identity());
   this.multiply  = a       => setVal(multiply(getVal(), a));
   this.restore   = ()      => --topIndex;
   this.rotateQ   = q       => setVal(multiply(getVal(), fromQuaternion(q)));
   this.rotateX   = t       => setVal(multiply(getVal(), rotateX(t)));
   this.rotateY   = t       => setVal(multiply(getVal(), rotateY(t)));
   this.rotateZ   = t       => setVal(multiply(getVal(), rotateZ(t)));
   this.save      = ()      => stack[++topIndex] = stack[topIndex-1].slice();
   this.scale     = (x,y,z) => setVal(multiply(getVal(), scale(x,y,z)));
   this.set       = a       => setVal(a);
   this.translate = (x,y,z) => setVal(multiply(getVal(), translate(x,y,z)));
   this.value     = ()      => getVal();
}

////////////////////////////// SUPPORT FOR CREATING 3D SHAPES

const VERTEX_SIZE = 8;

let createCubeVertices = () => {
   let V = [], P = [ -1,-1, 1, 0,0, 1, 0,0,   1, 1, 1, 0,0, 1, 1,1,  -1, 1, 1, 0,1, 1, 0,1,
                      1, 1, 1, 0,0, 1, 1,1,  -1,-1, 1, 0,0, 1, 0,0,   1,-1, 1, 0,0, 1, 1,0,
                      1, 1,-1, 0,0,-1, 0,0,  -1,-1,-1, 0,0,-1, 1,1,  -1, 1,-1, 0,0,-1, 1,0,
                     -1,-1,-1, 0,0,-1, 1,1,   1, 1,-1, 0,0,-1, 0,0,   1,-1,-1, 0,0,-1, 0,1 ];
   for (let n = 0 ; n < 3 ; n++)
      for (let i = 0 ; i < P.length ; i += 8) {
         let p0 = [P[i],P[i+1],P[i+2]], p1 = [P[i+3],P[i+4],P[i+5]], uv = [P[i+6],P[i+7]];
	 V = V.concat(p0).concat(p1).concat(uv);
	 for (let j = 0 ; j < 3 ; j++) {
	    P[i   + j] = p0[(j+1) % 3];
	    P[i+3 + j] = p1[(j+1) % 3];
         }
      }
   return V;
}

function createMeshVertices(M, N, uvToShape, vars) {
   let vertices = [];
   for (let row = 0 ; row < N-1 ; row++)
      for (let col = 0 ; col < M ; col++) {
         let u = (row & 1 ? col : M-1 - col) / (M-1);
         if (col != 0 || row == 0)
         vertices = vertices.concat(uvToShape(u,  row    / (N-1), vars));
         vertices = vertices.concat(uvToShape(u, (row+1) / (N-1), vars));
      }
   return vertices;
}

let uvToSphere = (u,v,r) => {
   let t = 2 * Math.PI * u;
   let p = Math.PI * (v - .5);

   let x = Math.cos(t) * Math.cos(p);
   let y = Math.sin(t) * Math.cos(p);
   let z = Math.sin(p);

   return [x,y,z, x,y,z, u,v];
}

let uvToCylinder = (u,v) => {
    let c = Math.cos(2 * Math.PI * u);
    let s = Math.sin(2 * Math.PI * u);
    let z = Math.max(-1, Math.min(1, 10*v - 5));

    switch (Math.floor(5.001 * v)) {
    case 0: case 5: return [ 0,0,z, 0,0,z, u,v]; // center of back/front end cap
    case 1: case 4: return [ c,s,z, 0,0,z, u,v]; // perimeter of back/front end cap
    case 2: case 3: return [ c,s,z, c,s,0, u,v]; // back/front of cylindrical tube
    }
}

let uvToTorus = (u,v,r) => {
   let t = 2 * Math.PI * u;
   let p = 2 * Math.PI * v;

   let x = Math.cos(t) * (1 + r * Math.cos(p));
   let y = Math.sin(t) * (1 + r * Math.cos(p));
   let z = r * Math.sin(p);

   let nx = Math.cos(t) * Math.cos(p);
   let ny = Math.sin(t) * Math.cos(p);
   let nz = Math.sin(p);

   return [x,y,z, nx,ny,nz, u,v];
}

let cube     = createCubeVertices();
let sphere   = createMeshVertices(32, 16, uvToSphere);
let cylinder = createMeshVertices(32,  6, uvToCylinder);
let torus    = createMeshVertices(32, 16, uvToTorus, 0.3);

let normalize = a => {
   let s = Math.sqrt(dot(a, a)), b = [];
   for (let i = 0 ; i < a.length ; i++)
      b.push(a[i] / s);
   return b;
}

let norm = a => {
   return Math.sqrt(dot(a, a));
}

let neg = a => {
   return [-a[0], -a[1], -a[2]];
}