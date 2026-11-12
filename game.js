export const W=6,H=6;
export const CONFIG_FIELDS=[
 {key:'removeCells',label:'Random cell removal',type:'boolean',default:true,hint:'Off keeps the complete 6 × 6 grid.'},
 {key:'removedCells',label:'Cells to remove',default:10,min:1,max:20,group:'core'},
 {key:'growthPercent',label:'Troop growth per round (%)',default:8,min:0,max:50,group:'core'},
 {key:'actionsPerTurn',label:'Actions per turn',default:2,min:1,max:10,group:'core'},
 {key:'startingTroops',label:'Starting troops',default:12,min:2,max:500},
 {key:'startingGold',label:'Starting gold',default:50,min:0,max:1000},
 {key:'neutralTroops',label:'Troops per neutral state',default:8,min:0,max:500},
 {key:'neutralGold',label:'Gold per neutral state',default:5,min:0,max:100},
 {key:'goldPerRound',label:'Treasury income per round',default:5,min:0,max:100,hint:'Paid to each player, in addition to mines.'},
 {key:'neutralGrowth',label:'Neutral states grow troops',type:'boolean',default:true},
 {key:'diagonalAttacks',label:'Allow diagonal attacks',type:'boolean',default:true},
 {key:'attackPercent',label:'Troops committed per attack (%)',default:50,min:1,max:100},
 {key:'barracksCost',label:'Barracks cost',default:20,min:0,max:500},
 {key:'towerCost',label:'Tower cost',default:25,min:0,max:500},
 {key:'mineCost',label:'Gold mine cost',default:20,min:0,max:500},
 {key:'barracksInstant',label:'Barracks instant troop bonus (%)',default:25,min:0,max:100},
 {key:'barracksBonus',label:'Barracks extra round growth (%)',default:8,min:0,max:50},
 {key:'mineInstant',label:'Mine instant gold bonus',default:10,min:0,max:100},
 {key:'mineIncome',label:'Mine income per round',default:8,min:0,max:100},
 {key:'towerRange',label:'Tower range (Manhattan tiles)',default:3,min:1,max:10},
 {key:'towerPercent',label:'Tower damage / garrison (%)',default:25,min:1,max:100}
];
export const DEFAULT_CONFIG=Object.freeze(Object.fromEntries(CONFIG_FIELDS.map(f=>[f.key,f.default])));
export const BUILDINGS={barracks:{name:'Barracks',icon:'castle',costKey:'barracksCost'},tower:{name:'Attack tower',icon:'lighthouse',costKey:'towerCost'},mine:{name:'Gold mine',icon:'windmill',costKey:'mineCost'}};
export function normalizeConfig(input={}){const out={};for(const f of CONFIG_FIELDS){const v=input[f.key]??f.default;if(f.type==='boolean'){if(typeof v!=='boolean')throw new Error(`Invalid ${f.label}.`);}else if(!Number.isInteger(v)||v<f.min||v>f.max)throw new Error(`${f.label} must be ${f.min}–${f.max}.`);out[f.key]=v;}return out;}
function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
export const adjacent=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1;
export const attackAdjacent=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))===1;
export const label=t=>`${String.fromCharCode(65+t.x)}${t.y+1}`;
export const towerDamage=(t,c=DEFAULT_CONFIG)=>t?.active&&t.building==='tower'&&t.troops>0?Math.max(1,Math.floor(t.troops*c.towerPercent/100)):0;
export const troopCommitment=(t,c=DEFAULT_CONFIG)=>Math.floor(t.troops*c.attackPercent/100);
export function sourceMode(source,target,c=DEFAULT_CONFIG){if(!source?.active||!target?.active||source.id===target.id)return null;if(towerDamage(source,c)>0&&Math.abs(source.x-target.x)+Math.abs(source.y-target.y)<=c.towerRange)return 'tower';if((c.diagonalAttacks?attackAdjacent:adjacent)(source,target)&&troopCommitment(source,c)>0)return 'troops';return null;}
export function connectedStates(states){const land=states.filter(t=>t.active);if(!land.length)return false;const seen=new Set([land[0].id]),queue=[land[0]];for(const t of queue)for(const n of land)if(!seen.has(n.id)&&adjacent(t,n)){seen.add(n.id);queue.push(n);}return seen.size===land.length;}
function generateMap(s){const c=s.config;for(let y=0;y<H;y++)for(let x=0;x<W;x++)s.states.push({id:y*W+x,x,y,active:true,owner:-1,troops:c.neutralTroops,gold:c.neutralGold,building:null});
 for(let removed=0;removed<(c.removeCells?c.removedCells:0);removed++){const candidates=s.states.filter(t=>t.active);for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}for(const t of candidates){t.active=false;if(connectedStates(s.states)){t.troops=0;t.gold=0;break;}t.active=true;}}
 const land=s.states.filter(t=>t.active);let longest=-1,pairs=[];for(const a of land){const distances=new Map([[a.id,0]]),queue=[a];for(const t of queue)for(const n of land)if(!distances.has(n.id)&&adjacent(t,n)){distances.set(n.id,distances.get(t.id)+1);queue.push(n);}for(const b of land){if(b.id<=a.id)continue;const d=distances.get(b.id);if(d>longest){longest=d;pairs=[[a,b]];}else if(d===longest)pairs.push([a,b]);}}
 const starts=pairs[Math.floor(random(s)*pairs.length)];if(random(s)<.5)starts.reverse();starts.forEach((t,owner)=>{t.owner=owner;t.troops=c.startingTroops;t.gold=0;});
}
export function createGame(seed=Date.now()>>>0,config={}){const c=normalizeConfig(config),s={seed,revision:0,round:1,turn:0,first:0,turnsInRound:0,actions:c.actionsPerTurn,winner:null,config:c,players:[{name:'Azure',gold:c.startingGold},{name:'Ember',gold:c.startingGold}],states:[],log:[]};generateMap(s);s.first=s.turn=Math.floor(random(s)*2);s.log=[`${s.players[s.turn].name} won the opening draw. Round 1 begins.`];return s;}
function fail(message){throw new Error(message);}
function owned(s,id,actor){if(!Number.isInteger(id))fail('Choose an owned state.');const t=s.states[id];if(!t?.active||t.owner!==actor)fail('Choose an owned state.');return t;}
export function attackPreview(s,targetId,sourceIds){const target=s.states[targetId];if(!target?.active)fail('Choose a target state.');let shot=0,troops=0;for(const id of sourceIds){const t=s.states[id],mode=sourceMode(t,target,s.config);if(mode==='tower')shot+=towerDamage(t,s.config);else if(mode==='troops')troops+=troopCommitment(t,s.config);}const defenders=Math.max(0,target.troops-shot);return {shot,troops,defenders,capture:troops>defenders,survivors:Math.max(0,troops-defenders),remaining:Math.max(0,defenders-troops)};}
export function applyCommand(input,actor,cmd){const s=structuredClone(input),c=s.config;if(s.winner!==null)fail('The match has ended.');if(actor!==s.turn)fail('Wait for your turn.');if(cmd.revision!==s.revision)fail('The board changed. Try again.');const p=s.players[actor],log=m=>s.log.unshift(m);
 if(cmd.type==='end'){s.turnsInRound++;if(s.turnsInRound===2){s.round++;s.turnsInRound=0;for(const t of s.states){if(!t.active||(t.owner<0&&!c.neutralGrowth))continue;const rate=c.growthPercent+(t.building==='barracks'?c.barracksBonus:0);if(rate>0)t.troops+=Math.max(1,Math.floor(t.troops*rate/100));if(t.building==='mine'&&t.owner>=0)s.players[t.owner].gold+=c.mineIncome;}for(const player of s.players)player.gold+=c.goldPerRound;log(`Round ${s.round}: ${c.growthPercent}% troop growth; +${c.goldPerRound} treasury income per player; mines paid out.`);}s.turn=1-s.turn;s.actions=c.actionsPerTurn;log(`${s.players[s.turn].name}'s turn.`);}
 else {if(s.actions<=0)fail('No actions left. End your turn.');
  if(cmd.type==='build'){const t=owned(s,cmd.target,actor),b=BUILDINGS[cmd.building];if(!b||!Object.hasOwn(BUILDINGS,cmd.building))fail('Choose a building.');if(t.building)fail('This state already has a building.');const cost=c[b.costKey];if(p.gold<cost)fail(`Need ${cost} gold.`);p.gold-=cost;t.building=cmd.building;if(cmd.building==='barracks')t.troops+=Math.ceil(t.troops*c.barracksInstant/100);if(cmd.building==='mine')p.gold+=c.mineInstant;log(`${p.name} built ${b.name} at ${label(t)}.`);}
  else if(cmd.type==='move'){const from=owned(s,cmd.source,actor),to=owned(s,cmd.target,actor);if(from.id===to.id)fail('Choose a different destination.');if(!Number.isInteger(cmd.amount)||cmd.amount<1||cmd.amount>=from.troops)fail('Move at least 1 troop and leave at least 1 behind.');from.troops-=cmd.amount;to.troops+=cmd.amount;log(`${p.name} moved ${cmd.amount} troops from ${label(from)} to ${label(to)}.`);}
  else if(cmd.type==='attack'){if(!Number.isInteger(cmd.target))fail('Choose an enemy or neutral target.');const target=s.states[cmd.target];if(!target?.active||target.owner===actor)fail('Choose an enemy or neutral target.');if(!Array.isArray(cmd.sources)||!cmd.sources.length||cmd.sources.length>s.states.length||new Set(cmd.sources).size!==cmd.sources.length)fail('Select one or more distinct attacking states.');for(const id of cmd.sources){const t=owned(s,id,actor);if(!sourceMode(t,target,c))fail('Source out of range: troops need a shared edge or corner (if enabled); towers use their configured range.');}
   const outcome=attackPreview(s,cmd.target,cmd.sources);for(const id of cmd.sources){const t=s.states[id];if(sourceMode(t,target,c)==='troops')t.troops-=troopCommitment(t,c);}if(outcome.capture){target.owner=actor;target.troops=outcome.survivors;p.gold+=target.gold;target.gold=0;log(`${p.name} conquered ${label(target)} with ${target.troops} survivors.`);}else{target.troops=outcome.remaining;log(`${p.name} struck ${label(target)}: ${outcome.shot+outcome.troops} damage, ${target.troops} defenders remain.`);}if(!s.states.some(t=>t.active&&t.owner===1-actor)){s.winner=actor;log(`${p.name} wins the war!`);}}
  else fail('Unknown action.');s.actions--;
 }s.revision++;s.log=s.log.slice(0,35);return s;
}
export const viewFor=s=>structuredClone(s);
