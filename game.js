export const W=6,H=6;
export const REMOVED_CELLS=10;
export const RULES={growth:.08,barracksBonus:.08,towerStart:5,towerCap:10,mineIncome:8,handLimit:5,refill:3,actions:2};
export const CARD_TYPES={troops15:{name:'Reserves',value:'+15',icon:'✚',kind:'troops',amount:15,description:'Add 15 troops to one owned state.'},troops20:{name:'Mass mobilization',value:'+20',icon:'✚',kind:'troops',amount:20,description:'Add 20 troops to one owned state.'},gold10:{name:'Supply funds',value:'+10',icon:'◈',kind:'gold',amount:10,description:'Add 10 gold to your treasury.'},gold20:{name:'Treasury grant',value:'+20',icon:'◈',kind:'gold',amount:20,description:'Add 20 gold to your treasury.'},gold50:{name:'Windfall',value:'+50',icon:'◈',kind:'gold',amount:50,description:'Add 50 gold to your treasury.'},troops5:{name:'Reinforcements',value:'+5',icon:'✚',kind:'troops',amount:5,description:'Add 5 troops to one owned state.'},troops10:{name:'Mobilization',value:'+10',icon:'✚',kind:'troops',amount:10,description:'Add 10 troops to one owned state.'},gold:{name:'War chest',value:'+30',icon:'◈',kind:'gold',amount:30,description:'Add 30 gold to your treasury.'},attack1:{name:'Skirmish',value:'1 state',icon:'⚔',kind:'attack',max:1,description:'Attack one target with up to 1 state.'},attack2:{name:'Offensive',value:'2 states',icon:'⚔',kind:'attack',max:2,description:'Attack one target with up to 2 states.'},attack3:{name:'Combined arms',value:'3 states',icon:'⚔',kind:'attack',max:3,description:'Attack one target with up to 3 states.'},barracks:{name:'Barracks',value:'20 gold',icon:'▥',kind:'build',cost:20,description:'+25% troops now. +8 percentage points of growth each round.'},tower:{name:'Attack tower',value:'25 gold',icon:'♜',kind:'build',cost:25,description:'Range 3. Deals 5 damage; +1 per round, capped at 10.'},mine:{name:'Gold mine',value:'20 gold',icon:'◈',kind:'build',cost:20,description:'+10 gold immediately. Produces 8 gold per round.'}};
// Relative draw weights sum to 100: resources 60%, attacks 25%, buildings 15%.
export const DRAW_WEIGHTS={troops5:17,troops10:13,troops15:6,troops20:4,gold10:7,gold20:5,gold:5,gold50:3,attack1:18,attack2:5,attack3:2,barracks:5,tower:5,mine:5};
const weightedCards=Object.entries(DRAW_WEIGHTS);
const totalWeight=weightedCards.reduce((sum,[,weight])=>sum+weight,0);
export function drawCardType(s){let roll=random(s)*totalWeight;for(const [type,weight] of weightedCards){roll-=weight;if(roll<0)return type;}return weightedCards.at(-1)[0];}
function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function draw(s,p,n){for(let i=0;i<n;i++)s.players[p].hand.push({id:++s.cardId,type:drawCardType(s)});}
export const adjacent=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1;
export const attackAdjacent=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))===1;
export function sourceMode(source,target){if(source.active===false||target.active===false)return null;if(source.building==='tower'&&Math.abs(source.x-target.x)+Math.abs(source.y-target.y)<=3)return 'tower';if(attackAdjacent(source,target)&&source.troops>=2)return 'troops';return null;}
// Remove only non-articulation cells, preserving one orthogonally connected landmass.
export function connectedStates(states){
  const land=states.filter(t=>t.active), seen=new Set();
  if(!land.length)return false;
  const queue=[land[0]];seen.add(land[0].id);
  for(const t of queue)for(const n of land)if(!seen.has(n.id)&&adjacent(t,n)){seen.add(n.id);queue.push(n);}
  return seen.size===land.length;
}
function generateMap(s){
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)s.states.push({id:y*W+x,x,y,active:true,owner:-1,troops:6+Math.floor(random(s)*7),gold:5,building:null,power:0});
  let removed=0;
  while(removed<REMOVED_CELLS){
    const candidates=s.states.filter(t=>t.active);
    // A shuffled scan always finds a removable cell in a connected finite graph.
    for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
    for(const t of candidates){t.active=false;if(connectedStates(s.states)){t.troops=0;t.gold=0;removed++;break;}t.active=true;}
  }
  const land=s.states.filter(t=>t.active);
  let longest=-1,pairs=[];
  // Place the two starting states at opposite ends of the actual walkable graph.
  for(const a of land){
    const distances=new Map([[a.id,0]]),queue=[a];
    for(const t of queue)for(const n of land)if(!distances.has(n.id)&&adjacent(t,n)){distances.set(n.id,distances.get(t.id)+1);queue.push(n);}
    for(const b of land){if(b.id<=a.id)continue;const d=distances.get(b.id);if(d>longest){longest=d;pairs=[[a,b]];}else if(d===longest)pairs.push([a,b]);}
  }
  const starts=pairs[Math.floor(random(s)*pairs.length)];
  if(random(s)<.5)starts.reverse();
  starts.forEach((t,owner)=>{t.owner=owner;t.troops=12;t.gold=0;});
}
export function createGame(seed=Date.now()>>>0){
  const s={seed,cardId:0,revision:0,round:1,turn:0,first:0,turnsInRound:0,actions:2,redrawUsed:false,winner:null,players:[{name:'Azure',gold:50,hand:[]},{name:'Ember',gold:50,hand:[]}],states:[],log:[]};
  generateMap(s);
  s.first=s.turn=Math.floor(random(s)*2);draw(s,0,3);draw(s,1,3);draw(s,s.turn,1);
  s.log=[`${s.players[s.turn].name} won the opening draw. Round 1 begins.`];return s;
}
function fail(message){throw new Error(message);}
export function applyCommand(input,actor,c){const s=structuredClone(input);if(s.winner!==null)fail('The match has ended.');if(actor!==s.turn)fail('Wait for your turn.');if(c.revision!==s.revision)fail('The board changed. Try again.');const p=s.players[actor];const log=m=>s.log.unshift(m);const overflow=()=>p.hand.length>RULES.handLimit;
if(c.type==='discard'){if(!overflow())fail('Only discard when above the hand limit.');const i=p.hand.findIndex(k=>k.id===c.card);if(i<0)fail('Card not found.');p.hand.splice(i,1);log(`${p.name} discarded a card.`);}
else if(c.type==='redraw'){if(overflow())fail('Discard excess cards first.');if(s.actions<=0)fail('No actions left. End your turn.');if(s.redrawUsed)fail('You can redraw only once per turn.');const i=p.hand.findIndex(k=>k.id===c.card);if(i<0)fail('Card not found.');p.hand.splice(i,1);draw(s,actor,1);s.actions--;s.redrawUsed=true;log(`${p.name} replaced a card for 1 action.`);}
else if(c.type==='end'){if(overflow())fail('Discard excess cards first.');s.turnsInRound++;if(s.turnsInRound===2){s.round++;s.turnsInRound=0;for(const t of s.states){if(!t.active)continue;t.troops+=Math.max(1,Math.floor(t.troops*(RULES.growth+(t.building==='barracks'?RULES.barracksBonus:0))));if(t.building==='mine'&&t.owner>=0)s.players[t.owner].gold+=RULES.mineIncome;if(t.building==='tower')t.power=Math.min(RULES.towerCap,t.power+1);}log(`Round ${s.round}: all states gained 8% troops (barracks: 16%); mines paid out; towers strengthened.`);}s.turn=1-s.turn;s.actions=RULES.actions;s.redrawUsed=false;draw(s,s.turn,1);log(`${s.players[s.turn].name}'s turn. Drew 1 card.`);}
else if(c.type==='play'){if(overflow())fail('Discard excess cards first.');if(s.actions<=0)fail('No actions left. End your turn.');const i=p.hand.findIndex(k=>k.id===c.card);if(i<0)fail('Card not found.');const card=CARD_TYPES[p.hand[i].type],target=s.states[c.target];if(card.kind==='gold'){p.gold+=card.amount;log(`${p.name}: +${card.amount} gold.`);}else if(card.kind==='attack'){if(!target||!target.active||target.owner===actor)fail('Choose an enemy or neutral target.');if(!Array.isArray(c.sources)||!c.sources.length||c.sources.length>card.max||new Set(c.sources).size!==c.sources.length)fail(`Select 1–${card.max} attacking states.`);let damage=0,committed=0;for(const id of c.sources){const t=s.states[id];if(!t||!t.active||t.owner!==actor)fail('Choose your own attacking states.');const mode=sourceMode(t,target);if(!mode)fail('Troops must be edge or diagonal neighbours; towers have range 3.');if(mode==='tower')damage+=t.power;else{const n=Math.floor(t.troops/2);t.troops-=n;committed+=n;}}const remaining=Math.max(0,target.troops-damage);if(committed>remaining){target.owner=actor;target.troops=committed-remaining;p.gold+=target.gold;target.gold=0;log(`${p.name} conquered ${label(target)} with ${target.troops} survivors.`);}else{target.troops=Math.max(0,remaining-committed);log(`${p.name} struck ${label(target)}: ${damage+committed} damage, ${target.troops} defenders remain.`);}}
else{if(!target||!target.active||target.owner!==actor)fail('Choose one of your states.');if(card.kind==='troops'){target.troops+=card.amount;log(`${p.name}: +${card.amount} troops at ${label(target)}.`);}else{if(target.building)fail('This state already has a building.');if(p.gold<card.cost)fail(`Need ${card.cost} gold.`);p.gold-=card.cost;target.building=p.hand[i].type;if(target.building==='barracks')target.troops+=Math.ceil(target.troops*.25);if(target.building==='tower')target.power=RULES.towerStart;if(target.building==='mine')p.gold+=10;log(`${p.name} built ${card.name} at ${label(target)}.`);}}p.hand.splice(i,1);s.actions--;if(!p.hand.length){draw(s,actor,RULES.refill);log(`${p.name}'s empty hand refilled with 3 cards.`);}if(!s.states.some(t=>t.owner===1-actor)){s.winner=actor;log(`${p.name} wins the war!`);}}
else fail('Unknown command.');s.revision++;s.log=s.log.slice(0,35);return s;}
export const label=t=>`${String.fromCharCode(65+t.x)}${t.y+1}`;
export function viewFor(s,actor){const v=structuredClone(s);v.players.forEach((p,i)=>{p.cardCount=p.hand.length;if(i!==actor)p.hand=[];});return v;}
