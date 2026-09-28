const els = {
  fileInput: document.querySelector("#fileInput"),
  dropZone: document.querySelector("#dropZone"),
  canvas: document.querySelector("#imageCanvas"),
  stage: document.querySelector("#canvasStage"),
  emptyState: document.querySelector("#emptyState"),
  status: document.querySelector("#statusText"),
  fileName: document.querySelector("#fileName"),
  resolution: document.querySelector("#resolution"),
  fileSize: document.querySelector("#fileSize"),
  aspectRatio: document.querySelector("#aspectRatio"),
  format: document.querySelector("#format"),
  lumaValue: document.querySelector("#lumaValue"),
  lumaMeter: document.querySelector("#lumaMeter"),
  lumaNote: document.querySelector("#lumaNote"),
  rgbValue: document.querySelector("#rgbValue"),
  colorSwatch: document.querySelector("#colorSwatch"),
  sampleCount: document.querySelector("#sampleCount"),
  histogram: document.querySelector("#histogram"),
  analysisNote: document.querySelector("#analysisNote"),
  zoomRange: document.querySelector("#zoomRange"),
  brightnessRange: document.querySelector("#brightnessRange"),
  contrastRange: document.querySelector("#contrastRange"),
  zoomValue: document.querySelector("#zoomValue"),
  brightnessValue: document.querySelector("#brightnessValue"),
  contrastValue: document.querySelector("#contrastValue"),
  exportBtn: document.querySelector("#exportBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  resetImageBtn: document.querySelector("#resetImageBtn"),
  grayBtn: document.querySelector("#grayBtn"),
  invertBtn: document.querySelector("#invertBtn"),
  edgeBtn: document.querySelector("#edgeBtn")
};

const ctx = els.canvas.getContext("2d", { willReadFrequently: true });
const state = { image:null, original:null, file:null, mode:"original", histogram:[] };

function formatBytes(bytes){
  if(bytes < 1024) return bytes + " B";
  if(bytes < 1024 ** 2) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 ** 2).toFixed(1) + " MB";
}
function gcd(a,b){ while(b){ [a,b] = [b,a%b]; } return a; }
function ratio(w,h){ const d=gcd(w,h); return (w/d)+":"+ (h/d); }

function resetUI(){
  state.image=null; state.original=null; state.file=null; state.mode="original"; state.histogram=[];
  ctx.clearRect(0,0,els.canvas.width,els.canvas.height);
  els.canvas.width=0; els.canvas.height=0;
  els.stage.classList.add("empty"); els.emptyState.hidden=false;
  els.status.textContent="Waiting for image"; els.fileName.textContent="No image loaded"; 
  els.resolution.textContent=els.fileSize.textContent=els.aspectRatio.textContent=els.format.textContent="—";
  els.lumaValue.textContent=els.rgbValue.textContent=els.sampleCount.textContent="—";
  els.lumaMeter.style.width="0%"; els.colorSwatch.style.background="#111";
  els.lumaNote.textContent="Upload an image to calculate average luminance.";
  els.histogram.innerHTML="";
  els.analysisNote.textContent="KidiuVision derives measurements from the image in memory. No external image service is required.";
  els.exportBtn.disabled=true;
}
function loadFile(file){
  if(!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      state.image = img; state.original = img; state.file=file; state.mode="original";
      els.stage.classList.remove("empty"); els.emptyState.hidden=true;
      els.status.textContent="Image ready";
      els.fileName.textContent=file.name;
      els.resolution.textContent=img.naturalWidth+" × "+img.naturalHeight;
      els.fileSize.textContent=formatBytes(file.size);
      els.aspectRatio.textContent=ratio(img.naturalWidth,img.naturalHeight);
      els.format.textContent=file.type.replace("image/","").toUpperCase();
      els.exportBtn.disabled=false;
      draw();
      analyze();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}
function draw(){
  if(!state.image) return;
  const max = 1500;
  const scale = Math.min(1, max/state.image.naturalWidth, max/state.image.naturalHeight);
  els.canvas.width = Math.round(state.image.naturalWidth * scale);
  els.canvas.height = Math.round(state.image.naturalHeight * scale);
  ctx.filter = `brightness(${els.brightnessRange.value}%) contrast(${els.contrastRange.value}%)`;
  ctx.drawImage(state.image,0,0,els.canvas.width,els.canvas.height);
  ctx.filter = "none";
  if(state.mode==="grayscale" || state.mode==="invert" || state.mode==="edges") applyMode();
  els.canvas.style.transform = `scale(${Number(els.zoomRange.value)/100})`;
}
function applyMode(){
  if(!state.image) return;
  const data = ctx.getImageData(0,0,els.canvas.width,els.canvas.height);
  const p=data.data;
  if(state.mode==="grayscale"){
    for(let i=0;i<p.length;i+=4){ const y=.299*p[i]+.587*p[i+1]+.114*p[i+2]; p[i]=p[i+1]=p[i+2]=y; }
  }else if(state.mode==="invert"){
    for(let i=0;i<p.length;i+=4){ p[i]=255-p[i]; p[i+1]=255-p[i+1]; p[i+2]=255-p[i+2]; }
  }else if(state.mode==="edges"){
    const src=new Uint8ClampedArray(p);
    const w=els.canvas.width,h=els.canvas.height;
    for(let y=1;y<h-1;y++){
      for(let x=1;x<w-1;x++){
        const i=(y*w+x)*4;
        const lum=(r,g,b)=>.299*r+.587*g+.114*b;
        const gx=-lum(src[i-4],src[i-3],src[i-2])+lum(src[i+4],src[i+5],src[i+6]);
        const top=i-w*4,bottom=i+w*4;
        const gy=-lum(src[top],src[top+1],src[top+2])+lum(src[bottom],src[bottom+1],src[bottom+2]);
        const edge=Math.min(255,Math.sqrt(gx*gx+gy*gy));
        p[i]=p[i+1]=p[i+2]=edge;
      }
    }
  }
  ctx.putImageData(data,0,0);
}
function analyze(){
  const data=ctx.getImageData(0,0,els.canvas.width,els.canvas.height).data;
  const step=Math.max(1,Math.floor(data.length/4/12000));
  const hist=new Array(16).fill(0); let sum=0, count=0, r=0,g=0,b=0;
  for(let pixel=0; pixel<data.length/4; pixel+=step){
    const i=pixel*4, rr=data[i],gg=data[i+1],bb=data[i+2];
    const lum=.299*rr+.587*gg+.114*bb;
    sum+=lum;r+=rr;g+=gg;b+=bb;count++;hist[Math.min(15,Math.floor(lum/16))]++;
  }
  const avg=sum/count, rgb=[Math.round(r/count),Math.round(g/count),Math.round(b/count)];
  state.histogram=hist;
  els.lumaValue.textContent=Math.round(avg)+"/255";
  els.lumaMeter.style.width=(avg/255*100).toFixed(1)+"%";
  els.lumaNote.textContent=avg<80?"Dark overall tone.":avg>185?"Bright overall tone.":"Balanced mid-tone image.";
  els.rgbValue.textContent=`rgb(${rgb.join(", ")})`;
  els.colorSwatch.style.background=`rgb(${rgb.join(",")})`;
  els.sampleCount.textContent=count.toLocaleString();
  const max=Math.max(...hist,1);
  els.histogram.innerHTML=hist.map(v=>`<i style="height:${Math.max(2,(v/max)*100)}%"></i>`).join("");
  els.analysisNote.textContent=`Sampled ${count.toLocaleString()} pixels locally. Mode: ${state.mode}. Filters are rendered in the browser.`;
}
function update(){
  els.zoomValue.textContent=els.zoomRange.value+"%";
  els.brightnessValue.textContent=els.brightnessRange.value+"%";
  els.contrastValue.textContent=els.contrastRange.value+"%";
  draw(); analyze();
}
function exportPng(){
  if(!state.image) return;
  const link=document.createElement("a");
  link.download="kidiuvision-analysis.png";
  link.href=els.canvas.toDataURL("image/png");
  link.click();
}
["dragenter","dragover"].forEach(ev=>els.dropZone.addEventListener(ev,e=>{e.preventDefault();els.dropZone.classList.add("drag")}));
["dragleave","drop"].forEach(ev=>els.dropZone.addEventListener(ev,e=>{e.preventDefault();els.dropZone.classList.remove("drag")}));
els.dropZone.addEventListener("drop",e=>loadFile(e.dataTransfer.files[0]));
els.fileInput.addEventListener("change",e=>loadFile(e.target.files[0]));
[els.zoomRange,els.brightnessRange,els.contrastRange].forEach(el=>el.addEventListener("input",update));
els.grayBtn.addEventListener("click",()=>{state.mode="grayscale";draw();analyze()});
els.invertBtn.addEventListener("click",()=>{state.mode="invert";draw();analyze()});
els.edgeBtn.addEventListener("click",()=>{state.mode="edges";draw();analyze()});
els.resetImageBtn.addEventListener("click",()=>{state.mode="original";els.brightnessRange.value=100;els.contrastRange.value=100;draw();analyze()});
els.exportBtn.addEventListener("click",exportPng);
els.resetBtn.addEventListener("click",()=>{els.fileInput.value="";els.zoomRange.value=100;els.brightnessRange.value=100;els.contrastRange.value=100;resetUI()});
resetUI();
