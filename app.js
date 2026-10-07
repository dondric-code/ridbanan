(()=>{"use strict";
const $=id=>document.getElementById(id),A=$("arena"),S=$("stage"),R=$("route"),VP=$("viewport");
let W=20,H=60,z=1,rot=false,hide=false,nums=true,showRoute=true,draw=false,showDistanceLines=true,multiMode=false;
let path=[],multiSel=new Set(),start={x:2,y:56},finish={x:18,y:4};
let O=[{x:6,y:48,type:"rail",angle:0,height:80},{x:7,y:36,type:"oxer",angle:0,height:100},{x:14,y:25,type:"oxer",angle:15,height:90},{x:15,y:13,type:"groundpole",angle:0},{x:10,y:7,type:"cone",angle:0}].map(o=>({...o,edge:false}));
let sel={kind:"obstacle",index:0};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),oxerSpread=o=>o?.type==="oxer"?(o.oxerWidth==null?(Number(o.height)||80)/100:Number(o.oxerWidth)):0,dist=(a,b)=>{let dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,da=oxerSpread(a)/2;return Math.max(0,Math.hypot(b.x-(a.x+ux*da),b.y-(a.y+uy*da)))},nm=t=>t==="rail"?"Räcke":t==="oxer"?"Oxer":t==="groundpole"?"Markbom":"Kon";
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
function updateSelection(){A.querySelectorAll(".selected,.multi-selected").forEach(e=>e.classList.remove("selected","multi-selected"));if(sel.kind==="obstacle")A.querySelectorAll(".obstacle")[sel.index]?.classList.add("selected");else A.querySelector("."+sel.kind)?.classList.add("selected");A.querySelectorAll(".obstacle").forEach((e,i)=>e.classList.toggle("multi-selected",multiSel.has(i)));let o=sel.kind==="obstacle"?O[sel.index]:null;$("selectedType").disabled=!o;if(o)$("selectedType").value=o.type;$("heightField").style.display=o&&["rail","oxer"].includes(o.type)?"flex":"none";$("oxerWidthField").style.display=o?.type==="oxer"?"flex":"none";if(o?.height)$("heightSelect").value=o.height;if(o?.type==="oxer")$("oxerWidthSelect").value=o.oxerWidth==null?"auto":String(o.oxerWidth);$("rotate").classList.toggle("active",rot);let chosen=multiMode&&multiSel.size?[...multiSel].map(i=>O[i]).filter(Boolean):(o?[o]:[]);$("edgeMeasures").classList.toggle("active",!!(chosen.length&&chosen.every(x=>x.edge)));let ed=$("edgeMeasures").querySelector(".toggleDot");if(ed)ed.textContent=(chosen.length&&chosen.every(x=>x.edge))?"●":"○";measures()}
function render(){A.querySelectorAll(".obstacle,.point,.measure,.distance-line").forEach(e=>e.remove());let w=fit();S.style.width=A.style.width=w+"px";S.style.height=A.style.height=w*H/W+"px";$("widthLabel").textContent=W+" m";$("lengthLabel").textContent=H+" m";$("zoomText").textContent=Math.round(z*100)+"%";let n=0;
 O.forEach((o,i)=>{let e=document.createElement("div");e.className="obstacle "+o.type;e.style.setProperty("--a",(o.angle||0)+"deg");if(o.type!=="cone")e.style.width=3/W*100+"%";if(o.type==="oxer")e.style.setProperty("--oxer-px",Math.max(16,oxerSpread(o)/H*A.clientHeight)+"px");let h="";if(o.type!=="cone"){n++;if(nums)h=`<span class=num>${n}</span>`}if(["rail","oxer"].includes(o.type))h+=`<span class=height-label>${o.height} cm</span>`;e.innerHTML=h;pos(e,o);A.append(e);drag(e,o,{kind:"obstacle",index:i})});
 [["start","START",start],["finish","MÅL",finish]].forEach(v=>{let e=document.createElement("div");e.className="point "+v[0];e.textContent=v[1];pos(e,v[2]);A.append(e);drag(e,v[2],{kind:v[0]})});route();updateSelection()}
function add(t){let o={x:W/2,y:H/2,type:t,angle:0,edge:false};if(["rail","oxer"].includes(t))o.height=80;if(t==="oxer")o.oxerWidth=null;O.push(o);sel={kind:"obstacle",index:O.length-1};render()}
for(let h=30;h<=150;h+=10)$("heightSelect").insertAdjacentHTML("beforeend",`<option value="${h}">${h} cm</option>`);
document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>add(b.dataset.add));
$("heightSelect").onchange=e=>{let o=O[sel.index];if(o){o.height=+e.target.value;render()}};
$("oxerWidthSelect").onchange=e=>{let o=O[sel.index];if(o?.type==="oxer"){o.oxerWidth=e.target.value==="auto"?null:+e.target.value;render()}};
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
$("arenaSize").value="20,60";$("arenaSize").onchange=e=>{if(e.target.value==="custom"){$("customArena").style.display="flex";return}$("customArena").style.display="none";[W,H]=e.target.value.split("x").map(Number);render()};
$("applyCustomArena").onclick=()=>{W=+$("customW").value;H=+$("customH").value;render()};

$("selectedType").onchange=e=>{let o=sel.kind==="obstacle"?O[sel.index]:null;if(!o)return;o.type=e.target.value;if(["rail","oxer"].includes(o.type)&&!o.height)o.height=80;if(o.type==="oxer"&&o.oxerWidth===undefined)o.oxerWidth=null;render()};
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
  // Dedicated export renderer. It draws from arena data rather than screenshotting DOM/CSS.
  const scale=52, pad=52, aw=W*scale, ah=H*scale;
  const c=document.createElement("canvas");
  c.width=Math.round(aw+pad*2); c.height=Math.round(ah+pad*2);
  const x=c.getContext("2d");
  x.imageSmoothingEnabled=true;

  const X=v=>pad+v*scale, Y=v=>pad+v*scale;
  const roundRect=(cx,cy,w,h,r,fill,stroke=null,lw=1)=>{
    x.beginPath();x.roundRect(cx-w/2,cy-h/2,w,h,r);
    if(fill){x.fillStyle=fill;x.fill()}
    if(stroke){x.strokeStyle=stroke;x.lineWidth=lw;x.stroke()}
  };
  const textBox=(txt,cx,cy,opts={})=>{
    const fs=opts.fs||22, py=opts.py||9, px=opts.px||13;
    x.save();x.font=`${opts.bold===false?500:700} ${fs}px -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif`;
    x.textAlign="center";x.textBaseline="middle";
    const tw=x.measureText(txt).width,w=tw+px*2,h=fs+py*2;
    roundRect(cx,cy,w,h,opts.r||8,opts.bg||"#fff",opts.border||"#d7d7d7",opts.lw||1.5);
    x.fillStyle=opts.color||"#202426";x.fillText(txt,cx,cy+1);x.restore();
  };
  const dashed=(a,b,color="#252525",lw=4)=>{
    x.save();x.strokeStyle=color;x.lineWidth=lw;x.setLineDash([13,11]);x.lineCap="round";
    x.beginPath();x.moveTo(X(a.x),Y(a.y));x.lineTo(X(b.x),Y(b.y));x.stroke();x.restore();
  };
  const measureLabel=(a,b)=>{
    if(hide||!a||!b||a.type==="cone"||b.type==="cone")return;
    textBox(dist(a,b).toFixed(1)+" m",(X(a.x)+X(b.x))/2,(Y(a.y)+Y(b.y))/2,{fs:21});
  };

  // clean white outside + sand arena
  x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);
  x.fillStyle="#e2c99f";x.fillRect(pad,pad,aw,ah);
  // subtle sand grain, deterministic pattern
  x.save();x.globalAlpha=.12;x.fillStyle="#9b7548";
  for(let gy=pad+9;gy<pad+ah;gy+=19)for(let gx=pad+7;gx<pad+aw;gx+=23){
    const off=((Math.floor(gy/19)*17+Math.floor(gx/23)*11)%9)-4;
    x.fillRect(gx+off,gy,1.5,1.5);
  }x.restore();

  // timber fence: two rails + posts
  x.save();
  x.strokeStyle="#79502d";x.lineWidth=12;x.strokeRect(pad-7,pad-7,aw+14,ah+14);
  x.strokeStyle="#b17b45";x.lineWidth=5;x.strokeRect(pad-7,pad-7,aw+14,ah+14);
  const post=18, step=scale*3;
  x.fillStyle="#744724";
  for(let xx=pad;xx<=pad+aw+.1;xx+=step){x.fillRect(xx-post/2,pad-18,post,27);x.fillRect(xx-post/2,pad+ah-9,post,27)}
  for(let yy=pad;yy<=pad+ah+.1;yy+=step){x.fillRect(pad-18,yy-post/2,27,post);x.fillRect(pad+aw-9,yy-post/2,27,post)}
  x.restore();

  // arena dimension labels
  textBox(W+" m",pad+aw/2,pad-19,{fs:20});
  textBox(H+" m",pad-19,pad+ah/2,{fs:20});

  // riding path
  if(showRoute&&path.length>1){
    x.save();x.strokeStyle="#16704f";x.lineWidth=5;x.setLineDash([13,10]);x.lineCap="round";x.lineJoin="round";
    x.beginPath();x.moveTo(X(path[0].x),Y(path[0].y));for(let i=1;i<path.length;i++)x.lineTo(X(path[i].x),Y(path[i].y));x.stroke();
    x.setLineDash([]);x.strokeStyle="#16704f";x.lineWidth=5;
    for(let i=8;i<path.length;i+=12){
      const a=path[i-1],b=path[i],ang=Math.atan2(b.y-a.y,b.x-a.x),cx=X(b.x),cy=Y(b.y);
      x.save();x.translate(cx,cy);x.rotate(ang);x.beginPath();x.moveTo(-13,-9);x.lineTo(0,0);x.lineTo(-13,9);x.stroke();x.restore();
    }x.restore();
  }

  // distance chain, excluding cones
  const chain=O.filter(o=>o.type!=="cone");
  if(chain.length){
    const pairs=[[start,chain[0]]];
    for(let i=0;i<chain.length-1;i++)pairs.push([chain[i],chain[i+1]]);
    pairs.push([chain.at(-1),finish]);
    for(const [a,b] of pairs){if(showDistanceLines)dashed(a,b);measureLabel(a,b)}
  }

  function drawObstacle(o,num){
    const cx=X(o.x),cy=Y(o.y),ang=(o.angle||0)*Math.PI/180;
    x.save();x.translate(cx,cy);x.rotate(ang);
    const len=3*scale;
    x.shadowColor="rgba(0,0,0,.28)";x.shadowBlur=7;x.shadowOffsetX=4;x.shadowOffsetY=6;

    const segmentedPole=(yy,color,h=11)=>{
      const seg=6, sw=len/seg;
      for(let i=0;i<seg;i++){x.fillStyle=i%2? "#f6f2e8":color;x.fillRect(-len/2+i*sw,yy-h/2,sw+.7,h)}
      x.strokeStyle="#59615b";x.lineWidth=2;x.strokeRect(-len/2,yy-h/2,len,h);
    };

    if(o.type==="rail"){
      x.fillStyle="#8b8f89";x.fillRect(-len/2-11,-25,10,50);x.fillRect(len/2+1,-25,10,50);
      segmentedPole(0,"#1680c5",15);
    }else if(o.type==="oxer"){
      x.fillStyle="#8b8f89";x.fillRect(-len/2-11,-31,10,62);x.fillRect(len/2+1,-31,10,62);
      const gap=Math.max(18,oxerSpread(o)*scale);segmentedPole(-gap/2,"#c83b34",11);segmentedPole(gap/2,"#c83b34",11);
    }else if(o.type==="groundpole"){
      segmentedPole(0,"#17624b",12);
    }else if(o.type==="cone"){
      x.shadowColor="rgba(0,0,0,.25)";
      x.fillStyle="#ef7620";x.beginPath();x.moveTo(0,-28);x.lineTo(19,19);x.lineTo(-19,19);x.closePath();x.fill();
      x.fillStyle="#f6f1e8";x.fillRect(-13,-2,26,8);
      x.fillStyle="#df651a";roundRect(0,22,48,10,2,"#df651a");
    }
    x.restore();

    if(o.type!=="cone"&&nums&&num!=null)textBox(String(num),cx,cy-43,{fs:18,r:18,px:9,py:7});
    if(showHeights&&(o.type==="rail"||o.type==="oxer")&&o.height)textBox(o.height+" cm",cx,cy+43,{fs:18,bold:false});
  }

  let no=0;
  for(const o of O){drawObstacle(o,o.type==="cone"?null:++no)}

  // edge measurements only for objects where enabled
  const chosen=multiMode&&multiSel.size?[...multiSel].map(i=>O[i]).filter(Boolean):(sel.kind==="obstacle"?[O[sel.index]]:[]);
  for(const o of chosen.filter(q=>q&&q.edge)){
    const labs=[
      [o.x/2,o.y,o.x],[(o.x+W)/2,o.y,W-o.x],
      [o.x,o.y/2,o.y],[o.x,(o.y+H)/2,H-o.y]
    ];
    for(const q of labs)textBox(q[2].toFixed(1)+" m",X(q[0]),Y(q[1]),{fs:18,bg:"#eaf5ff"});
  }

  // Start / finish on top
  textBox("START",X(start.x),Y(start.y),{fs:19,bg:"#168453",color:"#fff",border:"#168453",px:14,py:9});
  textBox("MÅL",X(finish.x),Y(finish.y),{fs:19,bg:"#c94a3c",color:"#fff",border:"#c94a3c",px:14,py:9});

  return c;
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
    pdf.addImage(c.toDataURL("image/png"),"PNG",(pw-w)/2,(ph-h)/2,w,h);
    pdf.save("ridbanan.pdf");$("saveMenu").hidden=true;
  }catch(e){alert("Kunde inte skapa PDF. Kontrollera internetanslutningen och försök igen.")}
};
$("newArena").onclick=()=>{if(!confirm("Skapa en ny bana? Den nuvarande banan rensas."))return;W=20;H=60;z=1;O=[];path=[];start={x:2,y:56};finish={x:18,y:4};sel={kind:"start"};multiSel.clear();$("arenaSize").value="20,60";$("arenaSizePanel").value="20,60";render()};

A.addEventListener("pointerdown",e=>{
 if(draw||e.target.closest(".obstacle,.point"))return;
 let best=null,bd=30;
 A.querySelectorAll(".obstacle").forEach(el=>{let r=el.getBoundingClientRect(),dx=e.clientX-(r.left+r.right)/2,dy=e.clientY-(r.top+r.bottom)/2,d=Math.hypot(dx,dy);if(d<bd){bd=d;best=el}});
 if(best&&best.onpointerdown){best.onpointerdown(e)}
},{capture:true});
A.addEventListener("pointerdown",e=>{
 if(draw||e.target.closest(".obstacle,.point"))return;
 let best=null,bd=Infinity;
 A.querySelectorAll(".obstacle").forEach(el=>{
   let r=el.getBoundingClientRect(),pad=el.classList.contains("cone")?30:14;
   let dx=Math.max(r.left-pad-e.clientX,0,e.clientX-r.right-pad);
   let dy=Math.max(r.top-pad-e.clientY,0,e.clientY-r.bottom-pad);
   let d=Math.hypot(dx,dy);
   if(d<bd && d<=pad){bd=d;best=el}
 });
 if(best&&best.onpointerdown)best.onpointerdown(e);
},{capture:true});
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


let showHeights=true;
$("toggleHeights").onclick=()=>{
  showHeights=!showHeights;
  $("toggleHeights").querySelector(".toggleDot").textContent=showHeights?"●":"○";
  document.body.classList.toggle("hide-heights",!showHeights);
  render();
};

let rt;window.addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(render,100)});
try{let sv=JSON.parse(localStorage.getItem("ridbanan-save")||"null");if(sv&&sv.version===1){W=sv.W||20;H=sv.H||60;O=Array.isArray(sv.O)?sv.O:O;start=sv.start||start;finish=sv.finish||finish;path=sv.path||[];$("arenaSize").value=W+","+H;$("arenaSizePanel").value=W+","+H}}catch(_){}
$("hideMeasures").classList.toggle("active",!hide);
$("drawRoute").classList.toggle("active",draw);
$("toggleRoute").classList.toggle("active",showRoute);
render();
})();