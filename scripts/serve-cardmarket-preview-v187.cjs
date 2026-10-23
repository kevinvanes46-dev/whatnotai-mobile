'use strict';
// Loopback-only local test server. Does not publish, deploy or read collection data.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const allowed=new Set(['cardmarket-preview-v187.html','cardmarket-preview-v187.js',
  'cardmarket-price-v186.js','cardmarket-feed-v186.js','cardmarket-history-v186.js',
  'cardmarket-expansions-v186.json']);
const port=Number(process.env.CARDMARKET_PREVIEW_PORT||8765);
function fileFor(requestPath){
  const pathname=decodeURIComponent(new URL(requestPath,'http://localhost').pathname);
  const name=pathname.slice(1)||'cardmarket-preview-v187.html';
  if(allowed.has(name))return path.join(root,name);
  if(/^cardmarket-public-v186\/(?:manifest|[a-f0-9]{2})\.json$/.test(name))return path.join(root,name);
  return null;
}
function server(){return http.createServer((req,res)=>{
  let file;try{file=fileFor(req.url);}catch{res.writeHead(400).end();return;}
  if(req.method!=='GET'||!file){res.writeHead(404).end();return;}
  fs.readFile(file,(err,content)=>{
    if(err){res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':file.endsWith('.json')?'application/json; charset=utf-8':
      file.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8',
    'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(content);
  });
});}
if(require.main===module){
  if(!Number.isSafeInteger(port)||port<1024||port>65535)throw Error('Invalid port');
  server().listen(port,'127.0.0.1',()=>process.stdout.write('Open lokaal: http://127.0.0.1:'+port+'/cardmarket-preview-v187.html\n'));
}
module.exports=Object.freeze({server,fileFor});
