const fs = require('fs');
const path = require('path');
const jsFilePath = path.join( __dirname ,'..' , 'node_modules' , 'snarkjs' , 'build' , 'snarkjs.min.js');
const data = fs.readFileSync(jsFilePath);

const dist = path.join( __dirname ,'..' , 'packages' , 'apps' , 'public'  , 'assets' , 'snarkjs.min.js');
fs.writeFileSync(dist ,data);
