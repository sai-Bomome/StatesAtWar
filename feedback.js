import {towerDamage,troopCommitment,sourceMode} from './game.js';
// Presentation-only events derived after authoritative success. Never mutates state.
export function describeResult(before,after,command){if(!before||after.revision===before.revision)return null;const events=[],arrows=[];const badge=(target,text,kind)=>events.push({target,text,kind});
 if(command.type==='attack'){const old=before.states[command.target],now=after.states[command.target];for(const from of command.sources){const t=before.states[from],tower=sourceMode(t,old,before.config)==='tower';arrows.push({from,to:old.id,amount:tower?towerDamage(t,before.config):troopCommitment(t,before.config),kind:tower?'shot':'attack'});}badge(old.id,'−'+Math.min(old.troops,arrows.reduce((n,a)=>n+a.amount,0)),'damage');if(now.owner!==old.owner)badge(old.id,'⚑ CAPTURED','capture');}
 else if(command.type==='move'){arrows.push({from:command.source,to:command.target,amount:command.amount,kind:'move'});badge(command.source,'−'+command.amount,'spent');badge(command.target,'+'+command.amount,'troops');}
 else if(command.type==='buy')badge(command.target,'+'+(after.states[command.target].troops-before.states[command.target].troops),'troops');
 else if(command.type==='build'){badge(command.target,'BUILT','build');const gain=after.states[command.target].troops-before.states[command.target].troops;if(gain)badge(command.target,'+'+gain,'troops');}
 else if(command.type==='upgrade')badge(command.target,'L'+before.states[command.target].level+' → L'+after.states[command.target].level,'upgrade');
 else if(command.type==='end'&&after.round!==before.round){for(const t of after.states){const gain=t.troops-before.states[t.id].troops;if(gain>0)badge(t.id,'+'+gain,'growth');}}
 const gold=after.players.map((p,i)=>({player:i,amount:p.gold-before.players[i].gold})).filter(g=>g.amount!==0);
 return {id:after.seed+':'+after.revision,kind:command.type,actor:before.turn,round:after.round,roundChanged:after.round!==before.round,turnChanged:after.turn!==before.turn,nextPlayer:after.turn,events:events.slice(0,100),arrows,gold};
}
