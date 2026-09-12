'use strict';
const {generate}=require('./jp-image-tools-v161.cjs');
try{console.log(JSON.stringify(generate(),null,2));}catch(error){console.error(error.message);process.exitCode=1;}
