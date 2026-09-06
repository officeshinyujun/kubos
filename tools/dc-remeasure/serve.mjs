// 저장소 루트에서: node tools/dc-remeasure/serve.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = process.cwd();
const MIME = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json'};
http.createServer((req,res)=>{
  const p = path.join(root, decodeURIComponent((req.url||'/').split('?')[0]));
  if(!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()){res.writeHead(404);res.end('404');return;}
  res.writeHead(200,{'Content-Type':MIME[path.extname(p)] ?? 'application/octet-stream'});
  fs.createReadStream(p).pipe(res);
}).listen(8099,()=>console.log('http://localhost:8099/tools/dc-remeasure/page.html 를 브라우저로 여세요'));
