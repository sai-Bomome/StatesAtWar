import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,applyCommand,viewFor,connectedStates,W,H,CARD_TYPES,drawCardType} from '../game.js';
const cmd=(s,actor,c)=>applyCommand(s,actor,{...c,revision:s.revision});
test('opening draw, turn alternation and round income',()=>{let s=createGame(123);const first=s.turn;assert.equal(s.players[first].hand.length,4);assert.equal(s.players[1-first].hand.length,3);const home=s.states.find(t=>t.owner===first).id;const troops=s.states[home].troops;s=cmd(s,first,{type:'end'});assert.equal(s.round,1);assert.equal(s.turn,1-first);s=cmd(s,s.turn,{type:'end'});assert.equal(s.round,2);assert.equal(s.turn,first);assert.ok(s.states[home].troops>troops);});
test('authority rejects wrong actor and stale revision',()=>{const s=createGame(1);assert.throws(()=>cmd(s,1-s.turn,{type:'end'}),/Wait/);assert.throws(()=>applyCommand(s,s.turn,{type:'end',revision:99}),/changed/);});
test('empty hand refills without resetting actions',()=>{let s=createGame(1);s.players[s.turn].hand=[{id:999,type:'gold'}];const a=s.turn;s=cmd(s,a,{type:'play',card:999});assert.equal(s.players[a].hand.length,3);assert.equal(s.actions,1);assert.equal(s.players[a].gold,80);});
test('overflow must discard, free of action cost',()=>{let s=createGame(1);s.players[s.turn].hand=Array.from({length:6},(_,i)=>({id:100+i,type:'gold'}));assert.throws(()=>cmd(s,s.turn,{type:'end'}),/Discard/);s=cmd(s,s.turn,{type:'discard',card:100});assert.equal(s.actions,2);assert.equal(s.players[s.turn].hand.length,5);});
function battle(){const s=createGame(8);s.states.forEach(t=>{t.active=true;t.owner=-1;t.building=null;t.troops=12;t.gold=5;});s.states[0].owner=0;s.states[0].gold=0;s.states[1].owner=0;s.states[1].gold=0;s.states[9].owner=0;s.states[35].owner=1;s.turn=0;s.players[0].hand=[{id:999,type:'attack3'}];return s;}
test('troops commit half and survivors conquer and claim state gold',()=>{let s=battle();s.states[1].troops=20;s.states[2].troops=6;s.states[2].gold=5;s=cmd(s,0,{type:'play',card:999,target:2,sources:[1]});assert.equal(s.states[1].troops,10);assert.equal(s.states[2].owner,0);assert.equal(s.states[2].troops,4);assert.equal(s.players[0].gold,55);});
test('tower only damage leaves ownership and gold intact',()=>{let s=battle();s.states[0].building='tower';s.states[0].power=10;s.states[2].troops=6;s=cmd(s,0,{type:'play',card:999,target:2,sources:[0]});assert.equal(s.states[2].owner,-1);assert.equal(s.states[2].troops,0);assert.equal(s.states[2].gold,5);assert.equal(s.states[0].troops,12);});
test('combined tower and troops resolve damage before conquest',()=>{let s=battle();s.states[0].building='tower';s.states[0].power=5;s.states[1].troops=20;s.states[2].troops=12;s=cmd(s,0,{type:'play',card:999,target:2,sources:[0,1]});assert.equal(s.states[2].owner,0);assert.equal(s.states[2].troops,3);});
test('range, duplicate sources and card cap enforced',()=>{let s=battle();assert.throws(()=>cmd(s,0,{type:'play',card:999,target:4,sources:[0]}),/neighbours/);assert.throws(()=>cmd(s,0,{type:'play',card:999,target:2,sources:[1,1]}),/Select/);s.players[0].hand[0].type='attack1';assert.throws(()=>cmd(s,0,{type:'play',card:999,target:2,sources:[1,9]}),/Select/);});
test('build cost and tower cap',()=>{let s=battle();s.players[0].hand=[{id:999,type:'tower'}];s=cmd(s,0,{type:'play',card:999,target:0});assert.equal(s.players[0].gold,25);assert.equal(s.states[0].power,5);s.states[0].power=10;s=cmd(s,0,{type:'end'});s=cmd(s,1,{type:'end'});assert.equal(s.states[0].power,10);});
test('opponent hand is redacted without changing authority',()=>{const s=createGame(1),v=viewFor(s,0);assert.equal(v.players[1].hand.length,0);assert.ok(v.players[1].cardCount>0);assert.ok(s.players[1].hand.length>0);});

test('500 generated maps have exactly 26 connected states and one home each',()=>{
  const layouts=new Set();
  for(let seed=0;seed<500;seed++){
    const s=createGame(seed),land=s.states.filter(t=>t.active);
    assert.equal(s.states.length,W*H);assert.equal(land.length,26);assert.equal(connectedStates(s.states),true);
    for(const owner of [0,1]){const homes=land.filter(t=>t.owner===owner);assert.equal(homes.length,1);assert.equal(homes[0].troops,12);assert.equal(homes[0].gold,0);}
    assert.equal(land.filter(t=>t.owner===-1).length,24);
    assert.ok(s.states.filter(t=>!t.active).every(t=>t.owner===-1&&t.troops===0&&t.gold===0));
    layouts.add(s.states.map(t=>t.active?'1':'0').join(''));
  }
  assert.ok(layouts.size>450);
});
test('map generation is reproducible for shared seed',()=>assert.deepEqual(createGame(567),createGame(567)));
test('removed cells cannot be attack targets or sources',()=>{
  let s=battle();s.states[2].active=false;
  assert.throws(()=>cmd(s,0,{type:'play',card:999,target:2,sources:[1]}),/target/);
  s.states[2].active=true;s.states[1].active=false;
  assert.throws(()=>cmd(s,0,{type:'play',card:999,target:2,sources:[1]}),/own attacking/);
});

test('round growth updates every active state exactly once, including both players and neutrals',()=>{
  let s=createGame(9876);
  const azure=s.states.find(t=>t.owner===0),ember=s.states.find(t=>t.owner===1);
  azure.troops=100;azure.building='barracks';ember.troops=50;ember.building='mine';
  const neutral=s.states.find(t=>t.active&&t.owner===-1);neutral.troops=25;
  const before=structuredClone(s);
  s=cmd(s,s.turn,{type:'end'});
  assert.deepEqual(s.states,before.states,'no growth after only one player ends');
  assert.equal(s.players[1].gold,50);
  s=cmd(s,s.turn,{type:'end'});
  for(const t of s.states){const old=before.states[t.id];
    const expected=old.active?old.troops+Math.max(1,Math.floor(old.troops*(old.building==='barracks'?.16:.08))):old.troops;
    assert.equal(t.troops,expected,`state ${t.id}`);
  }
  assert.equal(s.states[azure.id].troops,116);
  assert.equal(s.states[ember.id].troops,54);
  assert.equal(s.states[neutral.id].troops,27);
  assert.equal(s.players[1].gold,58);
  const grown=structuredClone(s.states);
  s=cmd(s,s.turn,{type:'end'});
  assert.deepEqual(s.states,grown,'next round must wait for both players too');
});

test('weighted draws favour resources and include every card variant',()=>{
  const rng={seed:123456},counts={resource:0,attack:0,build:0},seen=new Set();
  for(let i=0;i<100000;i++){const type=drawCardType(rng),card=CARD_TYPES[type];seen.add(type);counts[card.kind==='troops'||card.kind==='gold'?'resource':card.kind]++;}
  assert.equal(seen.size,14);
  assert.ok(Math.abs(counts.resource/100000-.60)<.01);
  assert.ok(Math.abs(counts.attack/100000-.25)<.01);
  assert.ok(Math.abs(counts.build/100000-.15)<.01);
});
test('all resource variants apply their stated amount for one action',()=>{
  for(const [type,card] of Object.entries(CARD_TYPES)){
    if(card.kind!=='troops'&&card.kind!=='gold')continue;
    let s=createGame(123);const actor=s.turn,home=s.states.find(t=>t.owner===actor);
    s.players[actor].hand=[{id:999,type}];const beforeTroops=home.troops,beforeGold=s.players[actor].gold;
    s=cmd(s,actor,{type:'play',card:999,target:home.id});
    assert.equal(s.states[home.id].troops,beforeTroops+(card.kind==='troops'?card.amount:0));
    assert.equal(s.players[actor].gold,beforeGold+(card.kind==='gold'?card.amount:0));
    assert.equal(s.actions,1);assert.equal(s.players[actor].hand.length,3);
  }
});

test('redraw replaces exactly one card for one action and is limited per turn',()=>{
  let s=createGame(88);const actor=s.turn,card=s.players[actor].hand[0].id,count=s.players[actor].hand.length;
  s=cmd(s,actor,{type:'redraw',card});assert.equal(s.actions,1);assert.equal(s.redrawUsed,true);assert.equal(s.players[actor].hand.length,count);assert.ok(!s.players[actor].hand.some(c=>c.id===card));
  assert.throws(()=>cmd(s,actor,{type:'redraw',card:s.players[actor].hand[0].id}),/once per turn/);
  s=cmd(s,actor,{type:'end'});assert.equal(s.redrawUsed,false);
});
test('redraw cannot bypass exhausted actions or excess hand limit',()=>{
  let s=createGame(88),actor=s.turn;s.actions=0;
  assert.throws(()=>cmd(s,actor,{type:'redraw',card:s.players[actor].hand[0].id}),/No actions/);
  s.actions=2;while(s.players[actor].hand.length<6)s.players[actor].hand.push({id:++s.cardId,type:'gold'});
  assert.throws(()=>cmd(s,actor,{type:'redraw',card:s.players[actor].hand[0].id}),/Discard/);
});
