'use strict';

function normalizeLineEndings(text){
 return String(text).replace(/\r\n/g,'\n').replace(/\r/g,'\n');
}

module.exports={normalizeLineEndings};
