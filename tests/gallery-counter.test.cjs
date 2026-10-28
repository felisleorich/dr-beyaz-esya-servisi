const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const current = fs.readFileSync(path.join(root, 'assets/customer-experience.js'), 'utf8');
function boot(code) {
  const events = {}, windowEvents = {}, buttons = {};
  const status = {textContent:''};
  const controls = {hidden:true};
  for (const name of ['prev','next']) buttons[name] = {parentElement:controls, disabled:false, addEventListener:(event,fn)=>buttons[name][event]=fn};
  const track = {
    clientWidth:0,scrollWidth:0,scrollLeft:0,
    classList:{contains:()=>true},
    children:Array.from({length:3},()=>({offsetLeft:0,getBoundingClientRect:()=>({left:0,width:0})})),
    addEventListener:(event,fn)=>events[event]=fn,
    scrollTo:({left})=>{track.scrollLeft=left;events.scroll();},
    scrollBy:({left})=>{track.scrollLeft+=left;events.scroll();}
  };
  const gallery = {querySelector:s=>s==='.gx-frames'?track:s==='[data-gx-prev]'?buttons.prev:s==='[data-gx-next]'?buttons.next:status};
  const window = {
    addEventListener:(e,f)=>windowEvents[e]=f,
    getComputedStyle:()=>({columnGap:'0px'}),
    matchMedia:()=>({matches:true}),
    ResizeObserver:class{constructor(fn){this.fn=fn;}observe(){this.fn();}},
    IntersectionObserver:class{observe(){}}
  };
  vm.runInNewContext(code,{document:{readyState:'complete',getElementById:()=>null,querySelector:()=>null,querySelectorAll:s=>s==='.gx-gallery'?[gallery]:[]},window,matchMedia:window.matchMedia,setTimeout:fn=>{fn();return 1;},clearTimeout:()=>{}});
  return {track,status,buttons,events,windowEvents};
}
const test = boot(current);const {track,status,buttons,events,windowEvents}=test;
assert.equal(status.textContent,'1 / 3');
assert.equal(buttons.next.disabled,true);
track.clientWidth=320;track.scrollWidth=960;windowEvents.resize();
assert.equal(buttons.next.disabled,false);
buttons.next.click();assert.equal(status.textContent,'2 / 3');assert.equal(track.scrollLeft,320);
buttons.next.click();assert.equal(status.textContent,'3 / 3');assert.equal(buttons.next.disabled,true);
track.scrollLeft=-80;events.scroll();assert.equal(status.textContent,'1 / 3');
track.scrollLeft=1200;events.scroll();assert.equal(status.textContent,'3 / 3');
track.scrollLeft=NaN;events.scroll();assert.equal(status.textContent,'1 / 3');
track.scrollLeft=320;events.scroll();track.clientWidth=0;events.load();assert.equal(status.textContent,'2 / 3');
track.clientWidth=167.333;track.scrollWidth=501.999;track.scrollLeft=334.666;windowEvents.pageshow();assert.equal(status.textContent,'3 / 3');
let prevented=false;events.keydown({target:track,key:'ArrowLeft',preventDefault(){prevented=true;},stopPropagation(){}});
assert.equal(prevented,true);assert.equal(status.textContent,'2 / 3');
const before=track.scrollLeft;events.keydown({target:{},key:'ArrowRight'});assert.equal(track.scrollLeft,before);
console.log(JSON.stringify({checks:12,errors:[]}));
