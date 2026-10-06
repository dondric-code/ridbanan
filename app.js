(function(){
"use strict";
const arena=document.getElementById("arena"),stage=document.getElementById("stage"),route=document.getElementById("route");
const rotateBtn=document.getElementById("rotate"),edgeBtn=document.getElementById("edgeMeasures");
let W=20,H=40,zoom=1,base=360,start={x:2,y:37},finish={x:18,y:3},rotateMode=false;
let objects=[{x:5,y:7,type:"rail",angle:0},{x:14,y:13,type:"oxer",angle:90},{x:6,y:21,type:"rail",angle:20},{x:14,y:29,type:"oxer",angle:120},{x:7,y:35,type:"wall",angle:0}].map(o=>({...o,edgeMeasures:false}));
let selected={kind:"obstacle",index:0};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function place(el,o){el.style.left=o.x/W*100+"%";el.style.top=o.y/H*100+"%"}
function pointerMeters(ev){const r=arena.getBoundingClientRect();return{x:clamp((ev.clientX-r.left)/r.width*W,0,W),y:clamp((ev.clientY-r.top)/r.height*H,0,H)}}
function makeDraggable(el,obj,selection){
 let active=false,id=null,startAngle=0,startPointerAngle=0;
 el.addEventListener("pointerdown",ev=>{
   ev.preventDefault();ev.stopPropagation();active=true;id=ev.pointerId;selected=selection;
   try{el.setPointerCapture(id)}catch(_){}
   if(rotateMode&&selection.kind==="obstacle"){
     const r=arena.getBoundingClientRect(),cx=r.left+obj.x/W*r.width,cy=r.top+obj.y/H*r.height;
     startPointerAngle=Math.atan2(ev.clientY-cy,ev.clientX-cx)*180/Math.PI;startAngle=obj.angle||0;
   }
   updateSelection();drawMeasures();updateControls();
 });
 el.addEventListener("pointermove",ev=>{
   if(!active||ev.pointerId!==id)return;
   if(rotateMode&&selection.kind==="obstacle"){
     const r=arena.getBoundingClientRect(),cx=r.left+obj.x/W*r.width,cy=r.top+obj.y/H*r.height;
     const now=Math.atan2(ev.clientY-cy,ev.clientX-cx)*180/Math.PI;
     obj.angle=(startAngle+now-startPointerAngle+360)%360;
     el.style.setProperty("--angle",obj.angle+"deg");
   }else{
     const p=pointerMeters(ev);obj.x=p.x;obj.y=p.y;place(el,obj);drawRoute();drawMeasures();
   }
 });
 const stop=()=>{active=false;id=null};
 el.addEventListener("pointerup",stop);el.addEventListener("pointercancel",stop);
}
function addMeasure(x,y,text,edge=false){
 const e=document.createElement("div");e.className="measure"+(edge?" edge":"");e.textContent=text;
 e.style.left=x/W*100+"%";e.style.top=y/H*100+"%";arena.appendChild(e);
}
function drawMeasures(){
 arena.querySelectorAll(".measure").forEach(e=>e.remove());
 for(let i=0;i<objects.length-1;i++){const a=objects[i],b=objects[i+1];addMeasure((a.x+b.x)/2,(a.y+b.y)/2,distance(a,b).toFixed(1)+" m")}
 if(selected.kind!=="obstacle")return;
 const o=objects[selected.index];if(!o||!o.edgeMeasures)return;
 addMeasure(o.x/2,o.y,o.x.toFixed(1)+" m",true);
 addMeasure((o.x+W)/2,o.y,(W-o.x).toFixed(1)+" m",true);
 addMeasure(o.x,o.y/2,o.y.toFixed(1)+" m",true);
 addMeasure(o.x,(o.y+H)/2,(H-o.y).toFixed(1)+" m",true);
}
function drawRoute(){route.innerHTML='<polyline class="path" points="'+[start,...objects,finish].map(o=>o.x/W*1000+","+o.y/H*2000).join(" ")+'"/>'}
function updateSelection(){
 arena.querySelectorAll(".selected").forEach(e=>e.classList.remove("selected"));
 if(selected.kind==="obstacle"){const a=arena.querySelectorAll(".obstacle");if(a[selected.index])a[selected.index].classList.add("selected")}
 else{const e=arena.querySelector("."+selected.kind);if(e)e.classList.add("selected")}
}
function updateControls(){
 const o=selected.kind==="obstacle"?objects[selected.index]:null;
 edgeBtn.disabled=!o;edgeBtn.textContent="📐 Kantmått: "+(o&&o.edgeMeasures?"PÅ":"AV");
 rotateBtn.disabled=!o;rotateBtn.textContent=rotateMode?"↻ Rotera: PÅ":"↻ Rotera: AV";
 rotateBtn.classList.toggle("active",rotateMode);
}
function render(){
 arena.querySelectorAll(".obstacle,.point,.measure").forEach(e=>e.remove());
 const width=base*zoom,height=width*(H/W);arena.style.width=stage.style.width=width+"px";arena.style.height=stage.style.height=height+"px";
 document.getElementById("widthLabel").textContent=W+" m";document.getElementById("lengthLabel").textContent=H+" m";document.getElementById("zoomText").textContent=Math.round(zoom*100)+"%";
 document.getElementById("summary").textContent=W+" × "+H+" m · "+objects.length+" hinder";
 objects.forEach((o,i)=>{const e=document.createElement("div");e.className="obstacle "+o.type;e.style.setProperty("--angle",o.angle+"deg");e.textContent=i+1;place(e,o);arena.appendChild(e);makeDraggable(e,o,{kind:"obstacle",index:i})});
 [["start","START",start],["finish","MÅL",finish]].forEach(v=>{const e=document.createElement("div");e.className="point "+v[0];e.textContent=v[1];place(e,v[2]);arena.appendChild(e);makeDraggable(e,v[2],{kind:v[0]})});
 updateSelection();drawRoute();drawMeasures();updateControls();
}
document.querySelectorAll("[data-add]").forEach(btn=>btn.addEventListener("click",()=>{rotateMode=false;objects.push({x:W/2,y:H/2,type:btn.dataset.add,angle:0,edgeMeasures:false});selected={kind:"obstacle",index:objects.length-1};render()}));
document.getElementById("zoomIn").onclick=()=>{zoom=clamp(zoom+.2,.6,2.4);render()};
document.getElementById("zoomOut").onclick=()=>{zoom=clamp(zoom-.2,.6,2.4);render()};
rotateBtn.onclick=()=>{if(selected.kind!=="obstacle"||!objects[selected.index])return;rotateMode=!rotateMode;updateControls()};
edgeBtn.onclick=()=>{if(selected.kind!=="obstacle"||!objects[selected.index])return;objects[selected.index].edgeMeasures=!objects[selected.index].edgeMeasures;drawMeasures();updateControls()};
document.getElementById("duplicate").onclick=()=>{if(selected.kind==="obstacle"&&objects[selected.index]){rotateMode=false;const i=selected.index,o=objects[i],copy={...o,x:clamp(o.x+2,0,W),y:clamp(o.y+2,0,H),edgeMeasures:false};objects.splice(i+1,0,copy);selected={kind:"obstacle",index:i+1};render()}};
document.getElementById("remove").onclick=()=>{if(selected.kind==="obstacle"&&objects[selected.index]){rotateMode=false;objects.splice(selected.index,1);selected={kind:"obstacle",index:Math.max(0,Math.min(selected.index,objects.length-1))};render()}};
document.getElementById("arenaSize").onchange=function(){[W,H]=this.value.split(",").map(Number);objects.forEach(o=>{o.x=clamp(o.x,0,W);o.y=clamp(o.y,0,H)});start.x=clamp(start.x,0,W);start.y=clamp(start.y,0,H);finish.x=clamp(finish.x,0,W);finish.y=clamp(finish.y,0,H);render()};
render();
})();