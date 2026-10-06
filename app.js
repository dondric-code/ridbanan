(function(){
"use strict";
const $=id=>document.getElementById(id),arena=$("arena"),stage=$("stage"),route=$("route"),rotateBtn=$("rotate"),edgeBtn=$("edgeMeasures");
let W=20,H=40,zoom=1,base=560,start={x:2,y:37},finish={x:18,y:3},rotateMode=false;
let objects=[
 {x:7,y:8,type:"rail",angle:0,height:80},{x:15,y:13,type:"oxer",angle:18,height:90,oxerWidth:.9},
 {x:6,y:23,type:"rail",angle:0,height:70},{x:14,y:27,type:"groundpole",angle:0},
 {x:10,y:34,type:"rail",angle:18,height:100}
].map(o=>({...o,edgeMeasures:false}));
let selected={kind:"obstacle",index:0};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),typeName=t=>t==="rail"?"Räcke":t==="oxer"?"Oxer":"Markbom";
function place(el,o){el.style.left=o.x/W*100+"%";el.style.top=o.y/H*100+"%"}
function pointerMeters(ev){const r=arena.getBoundingClientRect();return{x:clamp((ev.clientX-r.left)/r.width*W,0,W),y:clamp((ev.clientY-r.top)/r.height*H,0,H)}}
function makeDraggable(el,obj,selection){
 let active=false,id=null,startAngle=0,startPointerAngle=0;
 el.onpointerdown=ev=>{ev.preventDefault();ev.stopPropagation();active=true;id=ev.pointerId;selected=selection;try{el.setPointerCapture(id)}catch(_){}
  if(rotateMode&&selection.kind==="obstacle"){const r=arena.getBoundingClientRect(),cx=r.left+obj.x/W*r.width,cy=r.top+obj.y/H*r.height;startPointerAngle=Math.atan2(ev.clientY-cy,ev.clientX-cx)*180/Math.PI;startAngle=obj.angle||0}
  updateSelection();drawMeasures();updateControls();updatePanel()};
 el.onpointermove=ev=>{if(!active||ev.pointerId!==id)return;if(rotateMode&&selection.kind==="obstacle"){const r=arena.getBoundingClientRect(),cx=r.left+obj.x/W*r.width,cy=r.top+obj.y/H*r.height,now=Math.atan2(ev.clientY-cy,ev.clientX-cx)*180/Math.PI;obj.angle=(startAngle+now-startPointerAngle+360)%360;el.style.setProperty("--angle",obj.angle+"deg")}else{const p=pointerMeters(ev);obj.x=p.x;obj.y=p.y;place(el,obj);drawRoute();drawMeasures()}};
 const stop=()=>{active=false;id=null};el.onpointerup=stop;el.onpointercancel=stop;
}
function addMeasure(x,y,text,edge=false){const e=document.createElement("div");e.className="measure"+(edge?" edge":"");e.textContent=text;e.style.left=x/W*100+"%";e.style.top=y/H*100+"%";arena.appendChild(e)}
function drawMeasures(){arena.querySelectorAll(".measure").forEach(e=>e.remove());for(let i=0;i<objects.length-1;i++){const a=objects[i],b=objects[i+1];addMeasure((a.x+b.x)/2,(a.y+b.y)/2,dist(a,b).toFixed(1)+" m")}if(selected.kind!=="obstacle")return;const o=objects[selected.index];if(!o||!o.edgeMeasures)return;addMeasure(o.x/2,o.y,o.x.toFixed(1)+" m",true);addMeasure((o.x+W)/2,o.y,(W-o.x).toFixed(1)+" m",true);addMeasure(o.x,o.y/2,o.y.toFixed(1)+" m",true);addMeasure(o.x,(o.y+H)/2,(H-o.y).toFixed(1)+" m",true)}
function drawRoute(){route.innerHTML='<polyline class="path" points="'+[start,...objects,finish].map(o=>o.x/W*1000+","+o.y/H*2000).join(" ")+'"/>'}
function updateSelection(){arena.querySelectorAll(".selected").forEach(e=>e.classList.remove("selected"));if(selected.kind==="obstacle"){const a=arena.querySelectorAll(".obstacle");if(a[selected.index])a[selected.index].classList.add("selected")}else{const e=arena.querySelector("."+selected.kind);if(e)e.classList.add("selected")}}
function updateControls(){const o=selected.kind==="obstacle"?objects[selected.index]:null;edgeBtn.disabled=!o;edgeBtn.textContent="📐 Kantmått: "+(o&&o.edgeMeasures?"PÅ":"AV");rotateBtn.disabled=!o;rotateBtn.textContent=rotateMode?"↻ Rotera: PÅ":"↻ Rotera: AV";rotateBtn.classList.toggle("active",rotateMode)}
function updatePanel(){const o=selected.kind==="obstacle"?objects[selected.index]:null;if(!o)return;$("selectedTitle").textContent=typeName(o.type)+" "+(selected.index+1);$("heightField").style.display=o.type==="groundpole"?"none":"flex";$("oxerWidthField").style.display=o.type==="oxer"?"flex":"none";if(o.height)$("heightSelect").value=o.height;if(o.oxerWidth)$("oxerWidthSelect").value=o.oxerWidth}
function render(){
 arena.querySelectorAll(".obstacle,.point,.measure").forEach(e=>e.remove());const width=base*zoom,height=width*(H/W);arena.style.width=stage.style.width=width+"px";arena.style.height=stage.style.height=height+"px";
 $("widthLabel").textContent=W+" m";$("lengthLabel").textContent=H+" m";$("zoomText").textContent=Math.round(zoom*100)+"%";$("summary").textContent=W+" × "+H+" m · "+objects.length+" hinder";
 objects.forEach((o,i)=>{const e=document.createElement("div");e.className="obstacle "+o.type;e.style.setProperty("--angle",o.angle+"deg");e.style.width=(3/W*100)+"%";e.innerHTML='<span class="num">'+(i+1)+'</span>'+(o.type!=="groundpole"?'<span class="height-label">'+o.height+' cm</span>':'');place(e,o);arena.appendChild(e);makeDraggable(e,o,{kind:"obstacle",index:i})});
 [["start","START",start],["finish","MÅL",finish]].forEach(v=>{const e=document.createElement("div");e.className="point "+v[0];e.textContent=v[1];place(e,v[2]);arena.appendChild(e);makeDraggable(e,v[2],{kind:v[0]})});
 updateSelection();drawRoute();drawMeasures();updateControls();updatePanel();
}
function addObstacle(type){rotateMode=false;const o={x:W/2,y:H/2,type,angle:0,edgeMeasures:false};if(type!=="groundpole")o.height=80;if(type==="oxer")o.oxerWidth=.9;objects.push(o);selected={kind:"obstacle",index:objects.length-1};render()}
document.querySelectorAll("[data-add]").forEach(btn=>btn.onclick=()=>addObstacle(btn.dataset.add));
for(let h=30;h<=150;h+=10){const op=document.createElement("option");op.value=h;op.textContent=h+" cm";$("heightSelect").appendChild(op)}
$("heightSelect").onchange=function(){const o=objects[selected.index];if(o){o.height=+this.value;render()}};
$("oxerWidthSelect").onchange=function(){const o=objects[selected.index];if(o&&o.type==="oxer"){o.oxerWidth=+this.value;render()}};
$("zoomIn").onclick=()=>{zoom=clamp(zoom+.15,.55,2.2);render()};$("zoomOut").onclick=()=>{zoom=clamp(zoom-.15,.55,2.2);render()};
rotateBtn.onclick=()=>{if(selected.kind!=="obstacle")return;rotateMode=!rotateMode;updateControls()};
edgeBtn.onclick=()=>{const o=selected.kind==="obstacle"?objects[selected.index]:null;if(!o)return;o.edgeMeasures=!o.edgeMeasures;drawMeasures();updateControls()};
$("duplicate").onclick=()=>{if(selected.kind==="obstacle"&&objects[selected.index]){rotateMode=false;const i=selected.index,o=objects[i],copy={...o,x:clamp(o.x+2,0,W),y:clamp(o.y+2,0,H),edgeMeasures:false};objects.splice(i+1,0,copy);selected={kind:"obstacle",index:i+1};render()}};
$("remove").onclick=()=>{if(selected.kind==="obstacle"&&objects[selected.index]){rotateMode=false;objects.splice(selected.index,1);selected={kind:"obstacle",index:Math.max(0,Math.min(selected.index,objects.length-1))};render()}};
$("arenaSize").onchange=function(){[W,H]=this.value.split(",").map(Number);objects.forEach(o=>{o.x=clamp(o.x,0,W);o.y=clamp(o.y,0,H)});start.x=clamp(start.x,0,W);start.y=clamp(start.y,0,H);finish.x=clamp(finish.x,0,W);finish.y=clamp(finish.y,0,H);render()};
render();
})();