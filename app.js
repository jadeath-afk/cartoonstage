const canvas=document.getElementById('stage'),ctx=canvas.getContext('2d');
const audio=document.getElementById('audio'),songInput=document.getElementById('song'),portraitInput=document.getElementById('portrait');
const playBtn=document.getElementById('play'),stopBtn=document.getElementById('stop'),exportBtn=document.getElementById('export');
const state=document.getElementById('state'),stageStatus=document.getElementById('stageStatus');
const img=new Image();img.src='character.png';let imageReady=false;img.onload=()=>{imageReady=true;draw()};
let audioCtx,analyser,source,streamDest,raf=0,recording=false,recorder,chunks=[],startedAt=0,motion=.7,level=0,blinkUntil=0,nextBlink=performance.now()+2500;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function setupAudio(){if(!audioCtx){audioCtx=new(window.AudioContext||window.webkitAudioContext)();analyser=audioCtx.createAnalyser();analyser.fftSize=1024;source=audioCtx.createMediaElementSource(audio);source.connect(analyser);analyser.connect(audioCtx.destination);streamDest=audioCtx.createMediaStreamDestination();source.connect(streamDest)}return audioCtx.resume()}
function draw(){ctx.clearRect(0,0,720,960);ctx.fillStyle='#171321';ctx.fillRect(0,0,720,960);if(!imageReady){ctx.fillStyle='white';ctx.font='28px system-ui';ctx.fillText('Loading your character…',190,470);return}
const scale=Math.min(720/img.width,960/img.height),w=img.width*scale,h=img.height*scale,x=(720-w)/2,y=(960-h)/2;
const t=performance.now(),playing=!audio.paused&&!audio.ended;
if(playing&&analyser){const data=new Uint8Array(analyser.fftSize);analyser.getByteTimeDomainData(data);let sum=0;for(const v of data){const z=(v-128)/128;sum+=z*z}const rms=Math.sqrt(sum/data.length);level=level*.68+clamp(rms*4.2,0,1)*.32}else level*=.88;
if(t>nextBlink){blinkUntil=t+145;nextBlink=t+2600+Math.random()*2300}const blink=t<blinkUntil;
const bob=playing?Math.sin(t/270)*3*motion:Math.sin(t/1800)*1.2;
ctx.save();ctx.translate(0,bob);ctx.drawImage(img,x,y,w,h);ctx.restore();
// Coordinates are tuned to the included portrait; overlays create a simple singing illusion.
const mx=360,my=571,open=playing?clamp(level*motion*30,1.5,22):1.8;
if(open>3){ctx.save();ctx.fillStyle='#351018';ctx.beginPath();ctx.ellipse(mx,my+2,clamp(25+open*.42,25,37),open,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#8d3e42';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(mx,my+2,clamp(25+open*.42,25,37),open,0,Math.PI,Math.PI*2);ctx.stroke();ctx.restore()}
if(blink){ctx.save();ctx.strokeStyle='#3b2527';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(267,424);ctx.lineTo(310,427);ctx.moveTo(409,427);ctx.lineTo(452,424);ctx.stroke();ctx.restore()}
// Tiny stage indicator
ctx.fillStyle='#d9c5ff';ctx.font='18px system-ui';ctx.fillText(playing?'♪  SINGING':'♫  CARTOONSTAGE',24,925);
}
function loop(){draw();raf=requestAnimationFrame(loop)}loop();
portraitInput.addEventListener('change',()=>{const f=portraitInput.files[0];if(!f)return;const u=URL.createObjectURL(f);const next=new Image();next.onload=()=>{img.src=u;imageReady=true};next.src=u});
songInput.addEventListener('change',()=>{const f=songInput.files[0];if(!f)return;audio.src=URL.createObjectURL(f);audio.load();playBtn.disabled=false;exportBtn.disabled=false;stageStatus.textContent='Song loaded. Ready to perform.';state.textContent='Song loaded'});
document.getElementById('motion').addEventListener('input',e=>{motion=Number(e.target.value)/100;document.getElementById('motionVal').textContent=e.target.value+'%'});
playBtn.addEventListener('click',async()=>{try{await setupAudio();await audio.play();state.textContent='Performing';stageStatus.textContent='Your character is singing';stopBtn.disabled=false;playBtn.disabled=true}catch(e){alert('Could not play audio: '+e.message)}});
function stop(){audio.pause();audio.currentTime=0;playBtn.disabled=!audio.src;stopBtn.disabled=true;state.textContent='Ready';stageStatus.textContent='Ready for another take'}
stopBtn.addEventListener('click',stop);audio.addEventListener('ended',()=>{playBtn.disabled=false;stopBtn.disabled=true;state.textContent='Finished';stageStatus.textContent='Performance complete'});audio.addEventListener('pause',()=>{if(!recording){playBtn.disabled=!audio.src;stopBtn.disabled=true}});
exportBtn.addEventListener('click',async()=>{if(!audio.src)return;try{await setupAudio();if(!canvas.captureStream||!window.MediaRecorder)throw new Error('This browser does not support canvas video recording. Try Chrome on Android.');audio.pause();audio.currentTime=0;const video=canvas.captureStream(30),tracks=[...video.getVideoTracks(),...streamDest.stream.getAudioTracks()],combined=new MediaStream(tracks);let mime='video/webm;codecs=vp9,opus';if(!MediaRecorder.isTypeSupported(mime))mime='video/webm';if(MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2'))mime='video/mp4;codecs=avc1,mp4a.40.2';recorder=new MediaRecorder(combined,{mimeType:mime});chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>{const blob=new Blob(chunks,{type:recorder.mimeType});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='cartoonstage-performance.'+(recorder.mimeType.includes('mp4')?'mp4':'webm');a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);recording=false;state.textContent='Export ready';stageStatus.textContent='Video saved. Check Downloads.';exportBtn.disabled=false;playBtn.disabled=false;stopBtn.disabled=true};recording=true;exportBtn.disabled=true;playBtn.disabled=true;state.textContent='Recording';stageStatus.textContent='Recording performance in real time…';recorder.start(500);await audio.play();audio.onended=()=>{if(recorder&&recorder.state!=='inactive')recorder.stop()};}catch(e){recording=false;exportBtn.disabled=false;alert('Export could not start: '+e.message)}});
