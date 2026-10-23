'use strict';
// Opt-in localhost app preview. Only known public assets are exposed, never
// scripts/, tests/, docs/, credentials, .git/, or arbitrary local files.
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'..'),PORT=Number(process.env.HOLODEX_PREVIEW_PORT||8766);
const worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const assetBlock=worker.match(/const ASSETS = \[([\s\S]*?)\];/);
if(!assetBlock)throw Error('Public asset inventory missing');
const publicFiles=new Set([...assetBlock[1].matchAll(/'([^']+)'/g)]
  .map(m=>m[1].split('?')[0]));
for(const file of ['sw.js','cardmarket-price-v186.js','cardmarket-feed-v186.js',
  'cardmarket-history-v186.js','cardmarket-preview-v187.js','cardmarket-expansions-v186.json',
  'ui-v188-official-cardmarket.js','style-v188-official-cardmarket.css',
  'visual-seeds.json','visual-catalog.json'])publicFiles.add(file);
const MIME=Object.freeze({html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',
  json:'application/json; charset=utf-8',css:'text/css; charset=utf-8',woff2:'font/woff2',
  svg:'image/svg+xml',png:'image/png',ico:'image/x-icon'});

function fileFor(route){
  const rawPath=String(route).split(/[?#]/,1)[0],decoded=decodeURIComponent(rawPath);
  if(decoded.split('/').some(part=>part==='.'||part==='..'||part.includes('\\')))return null;
  const name=decodeURIComponent(new URL(route,'http://127.0.0.1').pathname).replace(/^\//,'')||'index.html';
  if(!publicFiles.has(name)&&!/^cardmarket-public-v186\/(?:manifest|[a-f0-9]{2})\.json$/.test(name))return null;
  const resolved=path.resolve(root,name);
  if(!resolved.startsWith(root+path.sep))return null;
  return resolved;
}
function serve(){
  return http.createServer((request,response)=>{
    let file;try{file=fileFor(request.url);}catch{response.writeHead(400).end();return;}
    if(request.method!=='GET'||!file){response.writeHead(404).end();return;}
    fs.readFile(file,(error,body)=>{
      if(error){response.writeHead(404).end();return;}
      if(file===path.join(root,'index.html')){
        // The normal production index is not edited or rebuilt for this preview.
        const text=body.toString('utf8');
        if(!text.includes('</body>')){response.writeHead(500).end();return;}
        body=Buffer.from(text.replace('</body>',
          '<link rel="stylesheet" href="style-v188-official-cardmarket.css?build=188-local-preview">'+
          '<script src="ui-v188-official-cardmarket.js?build=188-local-preview"></script></body>'));
      }
      const type=MIME[path.extname(file).slice(1)]||'application/octet-stream';
      response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store',
        'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY',
        'Referrer-Policy':'no-referrer'});response.end(body);
    });
  });
}
if(require.main===module){
  if(!Number.isSafeInteger(PORT)||PORT<1024||PORT>65535)throw Error('Invalid port');
  serve().listen(PORT,'127.0.0.1',()=>process.stdout.write(
    'HoloDex v188 lokaal: http://127.0.0.1:'+PORT+'/?cardmarketPreview=v188\n'));
}
module.exports=Object.freeze({serve,fileFor,publicFiles});
