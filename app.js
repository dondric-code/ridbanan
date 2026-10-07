(()=>{"use strict";
const $=id=>document.getElementById(id),A=$("arena"),S=$("stage"),R=$("route"),VP=$("viewport");
let W=20,H=60,z=1,rot=false,hide=false,nums=true,showRoute=true,draw=false,showDistanceLines=true,multiMode=false;
let path=[],multiSel=new Set(),start={x:2,y:56},finish={x:18,y:4};
let O=[{x:6,y:48,type:"rail",angle:0,height:80},{x:7,y:36,type:"oxer",angle:0,height:100},{x:14,y:25,type:"oxer",angle:15,height:90},{x:15,y:13,type:"groundpole",angle:0},{x:10,y:7,type:"cone",angle:0}].map(o=>({...o,edge:false}));
let sel={kind:"obstacle",index:0};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),nm=t=>t==="rail"?"Räcke":t==="oxer"?"Oxer":t==="groundpole"?"Markbom":"Kon";
function fit(){let r=VP.getBoundingClientRect(),pad=34,aw=Math.max(260,r.width-pad*2),ah=Math.max(360,r.height-pad*2),w=Math.min(aw,ah*W/H)*z;return Math.max(220,w)}
function point(e){let r=A.getBoundingClientRect();return{x:clamp((e.clientX-r.left)/r.width*W,0,W),y:clamp((e.clientY-r.top)/r.height*H,0,H)}}
function pos(e,o){e.style.left=o.x/W*100+"%";e.style.top=o.y/H*100+"%"}
function drag(e,o,s){let on=false,id,sa=0,sp=0;
 e.onpointerdown=v=>{if(draw)return;v.preventDefault();v.stopPropagation();on=true;id=v.pointerId;sel=s;if(multiMode&&s.kind==="obstacle"){multiSel.has(s.index)?multiSel.delete(s.index):multiSel.add(s.index)}else if(!multiMode)multiSel.clear();try{e.setPointerCapture(id)}catch(_){}
 if(rot&&s.kind==="obstacle"){let r=A.getBoundingClientRect(),cx=r.left+o.x/W*r.width,cy=r.top+o.y/H*r.height;sp=Math.atan2(v.clientY-cy,v.clientX-cx)*180/Math.PI;sa=o.angle||0} updateSelection()};
 e.onpointermove=v=>{if(!on||v.pointerId!==id)return;if(rot&&s.kind==="obstacle"){let r=A.getBoundingClientRect(),cx=r.left+o.x/W*r.width,cy=r.top+o.y/H*r.height;o.angle=(sa+Math.atan2(v.clientY-cy,v.clientX-cx)*180/Math.PI-sp+360)%360;e.style.setProperty("--a",o.angle+"deg")}else{Object.assign(o,point(v));pos(e,o);measures()}};
 e.onpointerup=e.onpointercancel=()=>on=false
}
function line(a,b){if(!showDistanceLines||!a||!b||a.type==="cone"||b.type==="cone")return;let dx=(b.x-a.x)/W*A.clientWidth,dy=(b.y-a.y)/H*A.clientHeight,e=document.createElement("span");e.className="distance-line";e.style.left=a.x/W*100+"%";e.style.top=a.y/H*100+"%";e.style.width=Math.hypot(dx,dy)+"px";e.style.transform="rotate("+Math.atan2(dy,dx)+"rad)";A.append(e)}
function label(a,b){if(hide||!a||!b||a.type==="cone"||b.type==="cone")return;let e=document.createElement("span");e.className="measure";e.textContent=dist(a,b).toFixed(1)+" m";e.style.left=(a.x+b.x)/2/W*100+"%";e.style.top=(a.y+b.y)/2/H*100+"%";A.append(e)}
function measures(){A.querySelectorAll(".measure,.distance-line").forEach(e=>e.remove());let m=O.filter(o=>o.type!=="cone");if(m.length){line(start,m[0]);label(start,m[0]);for(let i=0;i<m.length-1;i++){line(m[i],m[i+1]);label(m[i],m[i+1])}line(m.at(-1),finish);label(m.at(-1),finish)}
 let chosen=multiMode&&multiSel.size?[...multiSel].map(i=>O[i]).filter(Boolean):(sel.kind==="obstacle"?[O[sel.index]]:[]);
 chosen.filter(o=>o&&o.edge).forEach(o=>[[o.x/2,o.y,o.x],[(o.x+W)/2,o.y,W-o.x],[o.x,o.y/2,o.y],[o.x,(o.y+H)/2,H-o.y]].forEach(q=>{let e=document.createElement("span");e.className="measure edge";e.textContent=q[2].toFixed(1)+" m";e.style.left=q[0]/W*100+"%";e.style.top=q[1]/H*100+"%";A.append(e)}))}
function route(){R.innerHTML="";if(!showRoute||path.length<2)return;let ns="http://www.w3.org/2000/svg",p=document.createElementNS(ns,"polyline");p.setAttribute("class","ridepath");p.setAttribute("points",path.map(o=>o.x/W*1000+","+o.y/H*2000).join(" "));R.append(p);for(let i=8;i<path.length;i+=12){let a=path[i-1],b=path[i],x=b.x/W*1000,y=b.y/H*2000,ang=Math.atan2((b.y-a.y)/H*2000,(b.x-a.x)/W*1000)*180/Math.PI,e=document.createElementNS(ns,"path");e.setAttribute("class","arrow");e.setAttribute("d","M -15 -10 L 0 0 L -15 10");e.setAttribute("transform",`translate(${x} ${y}) rotate(${ang})`);R.append(e)}}
function updateSelection(){A.querySelectorAll(".selected,.multi-selected").forEach(e=>e.classList.remove("selected","multi-selected"));if(sel.kind==="obstacle")A.querySelectorAll(".obstacle")[sel.index]?.classList.add("selected");else A.querySelector("."+sel.kind)?.classList.add("selected");A.querySelectorAll(".obstacle").forEach((e,i)=>e.classList.toggle("multi-selected",multiSel.has(i)));let o=sel.kind==="obstacle"?O[sel.index]:null;$("selectedType").disabled=!o;if(o)$("selectedType").value=o.type;$("heightField").style.display=o&&["rail","oxer"].includes(o.type)?"flex":"none";$("oxerWidthField").style.display=o?.type==="oxer"?"flex":"none";if(o?.height)$("heightSelect").value=o.height;$("rotate").classList.toggle("active",rot);let chosen=multiMode&&multiSel.size?[...multiSel].map(i=>O[i]).filter(Boolean):(o?[o]:[]);$("edgeMeasures").classList.toggle("active",!!(chosen.length&&chosen.every(x=>x.edge)));let ed=$("edgeMeasures").querySelector(".toggleDot");if(ed)ed.textContent=(chosen.length&&chosen.every(x=>x.edge))?"●":"○";measures()}
function render(){A.querySelectorAll(".obstacle,.point,.measure,.distance-line").forEach(e=>e.remove());let w=fit();S.style.width=A.style.width=w+"px";S.style.height=A.style.height=w*H/W+"px";$("widthLabel").textContent=W+" m";$("lengthLabel").textContent=H+" m";$("zoomText").textContent=Math.round(z*100)+"%";let n=0;
 O.forEach((o,i)=>{let e=document.createElement("div");e.className="obstacle "+o.type;e.style.setProperty("--a",(o.angle||0)+"deg");if(o.type!=="cone")e.style.width=3/W*100+"%";let h="";if(o.type!=="cone"){n++;if(nums)h=`<span class=num>${n}</span>`}if(["rail","oxer"].includes(o.type))h+=`<span class=height-label>${o.height} cm</span>`;e.innerHTML=h;pos(e,o);A.append(e);drag(e,o,{kind:"obstacle",index:i})});
 [["start","START",start],["finish","MÅL",finish]].forEach(v=>{let e=document.createElement("div");e.className="point "+v[0];e.textContent=v[1];pos(e,v[2]);A.append(e);drag(e,v[2],{kind:v[0]})});route();updateSelection()}
function add(t){let o={x:W/2,y:H/2,type:t,angle:0,edge:false};if(["rail","oxer"].includes(t))o.height=80;if(t==="oxer")o.oxerWidth=.9;O.push(o);sel={kind:"obstacle",index:O.length-1};render()}
for(let h=30;h<=150;h+=10)$("heightSelect").insertAdjacentHTML("beforeend",`<option value="${h}">${h} cm</option>`);
document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>add(b.dataset.add));
$("heightSelect").onchange=e=>{let o=O[sel.index];if(o){o.height=+e.target.value;render()}};
$("oxerWidthSelect").onchange=e=>{let o=O[sel.index];if(o)o.oxerWidth=+e.target.value};
$("zoomIn").onclick=()=>{z=clamp(z+.10,.55,2.5);render()};$("zoomOut").onclick=()=>{z=clamp(z-.10,.55,2.5);render()};
$("rotate").onclick=()=>{rot=!rot;draw=false;updateSelection()};
$("duplicate").onclick=()=>{if(sel.kind==="obstacle"){let i=sel.index,o={...O[i],x:clamp(O[i].x+2,0,W),y:clamp(O[i].y+2,0,H),edge:false};O.splice(i+1,0,o);sel.index=i+1;render()}};
$("remove").onclick=()=>{if(sel.kind==="obstacle"){O.splice(sel.index,1);multiSel.clear();sel=O.length?{kind:"obstacle",index:Math.min(sel.index,O.length-1)}:{kind:"start"};render()}};
$("edgeMeasures").onclick=()=>{let chosen=multiMode&&multiSel.size?[...multiSel].map(i=>O[i]).filter(Boolean):(sel.kind==="obstacle"?[O[sel.index]]:[]);if(!chosen.length)return;let on=!chosen.every(o=>o.edge);chosen.forEach(o=>o.edge=on);updateSelection()};
$("hideMeasures").onclick=()=>{hide=!hide;$("hideMeasures").classList.toggle("active",!hide);measures()};
$("toggleDistanceLines").onclick=()=>{showDistanceLines=!showDistanceLines;$("toggleDistanceLines").classList.toggle("active",showDistanceLines);$("toggleDistanceLines").querySelector(".toggleDot").textContent=showDistanceLines?"●":"○";measures()};
$("multiSelect").onclick=()=>{multiMode=!multiMode;if(!multiMode)multiSel.clear();$("multiSelect").classList.toggle("active",multiMode);$("multiSelect").querySelector(".toggleDot").textContent=multiMode?"●":"○";updateSelection()};
$("toggleNumbers").onclick=()=>{nums=!nums;$("toggleNumbers").classList.toggle("active",nums);$("toggleNumbers").querySelector(".toggleDot").textContent=nums?"●":"○";render()};
$("toggleRoute").onclick=()=>{showRoute=!showRoute;$("toggleRoute").classList.toggle("active",showRoute);$("toggleRoute").querySelector(".toggleDot").textContent=showRoute?"●":"○";route()};
$("drawRoute").onclick=()=>{draw=!draw;rot=false;showRoute=true;$("drawRoute").classList.toggle("active",draw);$("rotate").classList.remove("active");$("toggleRoute").classList.toggle("active",showRoute)};
$("clearRoute").onclick=()=>{if(!path.length)return;if(confirm("Vill du rensa hela ridvägen?")){path=[];route()}};
$("arenaSize").value="20,60";$("arenaSize").onchange=e=>{[W,H]=e.target.value.split(",").map(Number);O.forEach(o=>{o.x=clamp(o.x,0,W);o.y=clamp(o.y,0,H)});start.x=clamp(start.x,0,W);start.y=clamp(start.y,0,H);finish.x=clamp(finish.x,0,W);finish.y=clamp(finish.y,0,H);render()};
$("selectedType").onchange=e=>{let o=sel.kind==="obstacle"?O[sel.index]:null;if(!o)return;o.type=e.target.value;if(["rail","oxer"].includes(o.type)&&!o.height)o.height=80;if(o.type==="oxer"&&!o.oxerWidth)o.oxerWidth=.9;render()};
function showTab(which){let arena=which==="arena";$("tabArena").classList.toggle("active",arena);$("tabObstacles").classList.toggle("active",!arena);$("arenaPanel").hidden=!arena;$("obstaclePanel").hidden=arena}
$("tabArena").onclick=()=>showTab("arena");$("tabObstacles").onclick=()=>showTab("obstacles");
$("arenaSizePanel").value="20,60";$("arenaSizePanel").onchange=e=>{$("arenaSize").value=e.target.value;$("arenaSize").dispatchEvent(new Event("change"));};
$("saveArena").onclick=()=>{
  let data={version:1,W,H,O,start,finish,path};
  localStorage.setItem("ridbanan-save",JSON.stringify(data));
  $("saveMenu").hidden=false;
};
$("saveCancel").onclick=()=>$("saveMenu").hidden=true;
$("saveMenu").onclick=e=>{if(e.target===$("saveMenu"))$("saveMenu").hidden=true};

async function arenaImage(){
  if(typeof html2canvas!=="function")throw new Error("Exportbiblioteket kunde inte laddas");
  let wasSel=sel, hadMulti=new Set(multiSel);
  A.classList.add("exporting");
  A.querySelectorAll(".selected,.multi-selected").forEach(e=>e.classList.remove("selected","multi-selected"));
  let canvas=await html2canvas(A,{backgroundColor:null,scale:2,useCORS:true,logging:false});
  A.classList.remove("exporting"); sel=wasSel; multiSel=hadMulti; updateSelection();
  return canvas;
}
$("savePng").onclick=async()=>{
  try{
    const c=await arenaImage();
    const blob=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error("PNG kunde inte skapas")),"image/png"));
    const file=new File([blob],"ridbanan.png",{type:"image/png"});
    $("saveMenu").hidden=true;

    // iPhone/iPad: share sheet is much more reliable than <a download>.
    if(navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:"Ridbanan"});
      return;
    }

    // Desktop/other browsers: normal download.
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="ridbanan.png";
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  }catch(e){
    if(e && e.name==="AbortError")return;
    alert("Kunde inte spara PNG: "+(e?.message||"okänt fel"));
  }
};
$("savePdf").onclick=async()=>{
  try{
    let c=await arenaImage();
    if(!window.jspdf?.jsPDF)throw new Error("PDF-bibliotek saknas");
    let portrait=c.height>=c.width,{jsPDF}=window.jspdf;
    let pdf=new jsPDF({orientation:portrait?"portrait":"landscape",unit:"mm",format:"a4"});
    let pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),m=8;
    let r=Math.min((pw-2*m)/c.width,(ph-2*m)/c.height),w=c.width*r,h=c.height*r;
    pdf.addImage(c.toDataURL("image/jpeg",.94),"JPEG",(pw-w)/2,(ph-h)/2,w,h);
    pdf.save("ridbanan.pdf");$("saveMenu").hidden=true;
  }catch(e){alert("Kunde inte skapa PDF. Kontrollera internetanslutningen och försök igen.")}
};
$("newArena").onclick=()=>{if(!confirm("Skapa en ny bana? Den nuvarande banan rensas."))return;W=20;H=60;z=1;O=[];path=[];start={x:2,y:56};finish={x:18,y:4};sel={kind:"start"};multiSel.clear();$("arenaSize").value="20,60";$("arenaSizePanel").value="20,60";render()};

let drawing=false,did;A.addEventListener("pointerdown",e=>{if(!draw||e.target.closest(".obstacle,.point"))return;e.preventDefault();drawing=true;did=e.pointerId;path=[point(e)];try{A.setPointerCapture(did)}catch(_){}route()});A.addEventListener("pointermove",e=>{if(!drawing||e.pointerId!==did)return;let p=point(e),l=path.at(-1);if(dist(l,p)>.2){path.push(p);route()}});A.addEventListener("pointerup",()=>drawing=false);A.addEventListener("pointercancel",()=>drawing=false);

// Panel controls
$("toggleSidePanel").onclick=()=>{document.body.classList.toggle("side-hidden");setTimeout(render,220)};
$("toggleTopPanel").onclick=()=>{document.body.classList.toggle("top-hidden");setTimeout(render,220)};
if(matchMedia("(max-width:700px)").matches)document.body.classList.add("side-hidden");


// v18: stable two-finger pan + pinch.
// Uses the finger midpoint as the zoom anchor, so the arena no longer jumps while pinching.
let gesture=null;
function twoTouchInfo(e){
  const a=e.touches[0],b=e.touches[1];
  return {
    x:(a.clientX+b.clientX)/2,
    y:(a.clientY+b.clientY)/2,
    d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)
  };
}
VP.addEventListener("touchstart",e=>{
  if(e.touches.length!==2)return;
  e.preventDefault();
  const g=twoTouchInfo(e), r=VP.getBoundingClientRect();
  gesture={
    startZ:z,
    startD:Math.max(g.d,1),
    startX:g.x,startY:g.y,
    startLeft:VP.scrollLeft,startTop:VP.scrollTop,
    // content coordinate under the midpoint before zoom
    anchorX:VP.scrollLeft + (g.x-r.left),
    anchorY:VP.scrollTop + (g.y-r.top)
  };
  document.body.classList.add("gesturing");
},{passive:false});

VP.addEventListener("touchmove",e=>{
  if(!gesture || e.touches.length!==2)return;
  e.preventDefault();
  const g=twoTouchInfo(e), r=VP.getBoundingClientRect();
  const oldZ=z;
  const newZ=clamp(gesture.startZ*(g.d/gesture.startD),.55,2.5);

  if(Math.abs(newZ-oldZ)>.004){
    z=newZ;
    render();
  }

  const scale=z/gesture.startZ;
  // Preserve the original arena point under the current finger midpoint,
  // while midpoint movement itself becomes panning.
  VP.scrollLeft = gesture.anchorX*scale - (g.x-r.left);
  VP.scrollTop  = gesture.anchorY*scale - (g.y-r.top);
},{passive:false});

function endGesture(e){
  if(!gesture)return;
  if(!e.touches || e.touches.length<2){
    gesture=null;
    document.body.classList.remove("gesturing");
  }
}
VP.addEventListener("touchend",endGesture,{passive:false});
VP.addEventListener("touchcancel",()=>{gesture=null;document.body.classList.remove("gesturing")},{passive:false});

let rt;window.addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(render,100)});
try{let sv=JSON.parse(localStorage.getItem("ridbanan-save")||"null");if(sv&&sv.version===1){W=sv.W||20;H=sv.H||60;O=Array.isArray(sv.O)?sv.O:O;start=sv.start||start;finish=sv.finish||finish;path=sv.path||[];$("arenaSize").value=W+","+H;$("arenaSizePanel").value=W+","+H}}catch(_){}
$("hideMeasures").classList.toggle("active",!hide);
$("drawRoute").classList.toggle("active",draw);
$("toggleRoute").classList.toggle("active",showRoute);
render();
})();