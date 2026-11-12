// Pure, seeded island geometry. Shared edge curves are generated once and reversed
// by the adjacent territory, so borders cannot drift apart on ownership changes.
export function createIslandGeometry(size,seed,states){
 let rng=seed>>>0;const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
 const nodes=[];for(let y=0;y<=size;y++)for(let x=0;x<=size;x++){const u=x+(rand()-.5)*.36,v=y+(rand()-.5)*.36;nodes.push({x:85+u*94+v*17,y:100+v*84+(size-u)*16});}
 const at=(x,y)=>nodes[y*(size+1)+x];const edges=new Map();
 function edge(a,b){const key=a<b?`${a}:${b}`:`${b}:${a}`;if(!edges.has(key)){const p=nodes[Math.min(a,b)],q=nodes[Math.max(a,b)],dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy),bend=(rand()-.5)*30;const m={x:(p.x+q.x)/2-dy/len*bend,y:(p.y+q.y)/2+dx/len*bend};const nx=-dy/len,ny=dx/len,k=(rand()-.5)*30;edges.set(key,{p,q,m,c1:{x:p.x+dx*.17+nx*k,y:p.y+dy*.17+ny*k},c2:{x:p.x+dx*.33-nx*k,y:p.y+dy*.33-ny*k},c3:{x:p.x+dx*.67+nx*k,y:p.y+dy*.67+ny*k},c4:{x:p.x+dx*.83-nx*k,y:p.y+dy*.83-ny*k}});}const e=edges.get(key);return {key,...e,reverse:a>b};}
 const pt=p=>`${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
 const commands=e=>e.reverse?`C ${pt(e.c4)} ${pt(e.c3)} ${pt(e.m)} C ${pt(e.c2)} ${pt(e.c1)} ${pt(e.p)}`:`C ${pt(e.c1)} ${pt(e.c2)} ${pt(e.m)} C ${pt(e.c3)} ${pt(e.c4)} ${pt(e.q)}`;
 const coast=[],borders=[],cells=[];const active=id=>!!states[id]?.active;
 for(const t of states){if(!t.active)continue;const x=t.x,y=t.y,a=y*(size+1)+x,b=a+1,d=(y+1)*(size+1)+x,c=d+1;const sides=[edge(a,b),edge(b,c),edge(c,d),edge(d,a)],ids=[y>0?t.id-size:-1,x<size-1?t.id+1:-1,y<size-1?t.id+size:-1,x>0?t.id-1:-1];const points=[at(x,y),at(x+1,y),at(x+1,y+1),at(x,y+1)];const center={x:points.reduce((n,p)=>n+p.x,0)/4,y:points.reduce((n,p)=>n+p.y,0)/4};const path=`M ${pt(points[0])} ${sides.map(commands).join(' ')} Z`;cells.push({id:t.id,path,center,edges:sides.map(e=>e.key)});sides.forEach((e,i)=>{const segment={key:e.key,path:`M ${pt(e.reverse?e.q:e.p)} ${commands(e)}`,start:e.reverse?e.q:e.p,end:e.reverse?e.p:e.q};if(!active(ids[i]))coast.push(segment);else if(t.id<ids[i])borders.push(segment);});}
 const width=170+size*111,height=200+size*100;
 return {width,height,cells,coast,borders};
}
