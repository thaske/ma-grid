// ==UserScript==
// @name         MA Grid
// @namespace    https://github.com/thaske/ma-grid
// @version      1.1.1
// @description  GitHub-style activity graph for Math Academy
// @author       thaske
// @match        https://mathacademy.com/learn
// @match        https://www.mathacademy.com/learn
// @icon         data:image/png;base64,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
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @connect      mathacademy.com
// @connect      www.mathacademy.com
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/thaske/ma-grid/master/dist/ma-grid.user.js
// @downloadURL  https://raw.githubusercontent.com/thaske/ma-grid/master/dist/ma-grid.user.js
// ==/UserScript==

var Ne=Object.defineProperty;var Fe=(_,D,p)=>D in _?Ne(_,D,{enumerable:!0,configurable:!0,writable:!0,value:p}):_[D]=p;var te=(_,D,p)=>Fe(_,typeof D!="symbol"?D+"":D,p);(function(){"use strict";const _={async getItem(n){try{return await GM.getValue(n,null)}catch(e){return console.error(`[MA-Grid] Failed to get item "${n}":`,e),null}},async setItem(n,e){try{await GM.setValue(n,e)}catch(a){console.error(`[MA-Grid] Failed to set item "${n}":`,a)}},async removeItem(n){try{await GM.deleteValue(n)}catch(e){console.error(`[MA-Grid] Failed to remove item "${n}":`,e)}}},D=()=>{},p={log:D,warn:D,error:D},L="local:maGridActivitiesCache",ae=200,ie=200,re=1e3,oe={default:"#incompleteTasks",sidebar:"#sidebar"},se="ma-grid-calendar";function de(n,e,a,r,o){const g=le(n.xp),t=document.createElement("div");return t.className=`ma-grid__cell ma-grid__cell--${g}`,t.style.gridRow=String(e+1),t.style.gridColumn=String(a+1),t.addEventListener("mouseenter",m=>r(n,m.clientX,m.clientY)),t.addEventListener("mousemove",m=>r(n,m.clientX,m.clientY)),t.addEventListener("mouseleave",()=>o()),t}function le(n){return n===0?"none":n<15?"low":n<30?"medium":"high"}function ce(n,e,a,r){let o=null;const g=[];n.length!==0&&n[0].length!==0&&n[0].forEach((h,f)=>{const w=new Date(h.date+"T12:00:00").toLocaleDateString("en-US",{month:"short"});w!==o&&(g.push({label:w,colStart:f}),o=w)});const t=e.cellSize+e.cellGap,m=document.createElement("div");m.className="ma-grid__wrapper";const s=document.createElement("div");s.className="ma-grid__month-labels",s.style.position="relative";let i=null,u=-1;g.forEach(h=>{const f=document.createElement("div");if(f.className="ma-grid__month-label",f.style.position="absolute",f.style.left=`${h.colStart*t}px`,f.textContent=h.label,i){const y=typeof i.style.left=="string"&&i.style.left.endsWith("px")?parseFloat(i.style.left):u*t,w=i.offsetWidth||e.labelWidth;h.colStart*t-(y+w)<=0&&s.removeChild(i)}s.appendChild(f),i=f,u=h.colStart});const l=document.createElement("div");l.className="ma-grid__grid";const d=document.createElement("div");d.className="ma-grid__weekday-labels",["","M","","W","","F",""].forEach(h=>{const f=document.createElement("div");f.className="ma-grid__weekday-label",f.textContent=h,d.appendChild(f)});const c=document.createElement("div");return c.className="ma-grid__days",n.forEach((h,f)=>{h.forEach((y,w)=>{const C=de(y,f,w,a,r);c.appendChild(C)})}),l.appendChild(d),l.appendChild(c),m.appendChild(s),m.appendChild(l),m}function pe(n){const e=document.createElement("div");e.className="ma-grid__header";const a=document.createElement("h3");return a.className="ma-grid__title",a.textContent="Activity",e.appendChild(a),n&&e.appendChild(n),e}const ge=["none","low","medium","high"];function me(){const n=document.createElement("div");n.className="ma-grid__legend";const e=document.createElement("span");e.className="ma-grid__legend-label",e.textContent="Less",n.appendChild(e),ge.forEach(r=>{const o=document.createElement("div");o.className=`ma-grid__legend-box ma-grid__legend-box--${r}`,n.appendChild(o)});const a=document.createElement("span");return a.className="ma-grid__legend-label",a.textContent="More",n.appendChild(a),n}function ue(n){const e=document.createElement("div");return e.className="ma-grid__stats",[{value:n.streak,label:"Current Streak"},{value:n.avgXP,label:"Avg Daily XP"},{value:n.maxXP,label:"Max Daily XP"}].forEach(r=>{const o=document.createElement("div");o.className="ma-grid__stat",o.innerHTML=`
      <div class="ma-grid__stat-value">${r.value}</div>
      <div class="ma-grid__stat-label">${r.label}</div>
    `,e.appendChild(o)}),e}function fe(){const n=document.createElement("div");return n.className="ma-grid__tooltip",n.style.display="none",{element:n,show:(r,o,g)=>{const t=r.xp===0?"No activity":`${r.xp} XP`,[m,s,i]=r.date.split("-").map(Number),l=new Date(m,s-1,i).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});n.innerHTML=`
      <div class="ma-grid__tooltip-date">${l}</div>
      <div class="ma-grid__tooltip-xp">${t}</div>
    `,n.style.display="block";const d=10,c=n.getBoundingClientRect();let h=o+d;h+c.width>window.innerWidth&&(h=o-d-c.width),n.style.left=`${Math.max(0,h)}px`,n.style.top=`${g+d}px`},hide:()=>{n.style.display="none"}}}const he={default:{cellSize:10,cellGap:2,labelWidth:12},sidebar:{cellSize:12,cellGap:2,labelWidth:12}},j=22;function Y(n,e,a){const r=be(n.grid,e),o=he[e],{cellSize:g,cellGap:t,labelWidth:m}=o,s=fe(),i=document.createElement("div");return i.id=se,i.className=e==="sidebar"?"ma-grid ma-grid--sidebar":"ma-grid",i.style.setProperty("--cell-size",`${g}px`),i.style.setProperty("--cell-gap",`${t}px`),i.style.setProperty("--label-width",`${m}px`),i.appendChild(pe(a)),i.appendChild(ue(n.stats)),i.appendChild(ce(r,o,s.show,s.hide)),i.appendChild(me()),i.appendChild(s.element),i}function be(n,e){return e!=="sidebar"||n.length===0||n[0].length<=j?n:n.map(r=>r.slice(-j))}function xe(n,e,a){const r=document.createElement("div");r.className="ma-grid__loading",r.textContent="Loading activity...";let o=!0,g=null;async function t(){var m;try{const s=await e.fetchData();if(s.error||!s.data){r.className="ma-grid__error",r.textContent=s.error||"No activity data available";return}const i=Y(s.data,n,a);(m=r.parentNode)==null||m.replaceChild(i,r),g=i,s.isStale&&e.onUpdate(u=>{var l;if(u.data&&o&&g){p.log("[MA-Grid] Received fresh data, updating calendar");const d=Y(u.data,n,a);(l=g.parentNode)==null||l.replaceChild(d,g),g=d}})}catch(s){p.error("[MA-Grid] Failed to load calendar:",s),r.className="ma-grid__error",r.textContent=s instanceof Error?s.message:"Failed to load activity data"}}return t(),r}const z="maGridAnchor",G="maGridHideXpFrame";function _e(n){return n==="incompleteTasks"||n==="sidebar"}function ye(n){const e=document.createElement("button");return e.className="ma-grid-settings-btn",e.setAttribute("aria-label","Settings"),e.title="Settings",e.innerHTML=`
    <svg height="16" width="16" viewBox="0 0 512 512"  xml:space="preserve">
    <g>
      <path class="st0" d="M502.325,307.303l-39.006-30.805c-6.215-4.908-9.665-12.429-9.668-20.348c0-0.084,0-0.168,0-0.252
        c-0.014-7.936,3.44-15.478,9.667-20.396l39.007-30.806c8.933-7.055,12.093-19.185,7.737-29.701l-17.134-41.366
        c-4.356-10.516-15.167-16.86-26.472-15.532l-49.366,5.8c-7.881,0.926-15.656-1.966-21.258-7.586
        c-0.059-0.06-0.118-0.119-0.177-0.178c-5.597-5.602-8.476-13.36-7.552-21.225l5.799-49.363
        c1.328-11.305-5.015-22.116-15.531-26.472L337.004,1.939c-10.516-4.356-22.646-1.196-29.701,7.736l-30.805,39.005
        c-4.908,6.215-12.43,9.665-20.349,9.668c-0.084,0-0.168,0-0.252,0c-7.935,0.014-15.477-3.44-20.395-9.667L204.697,9.675
        c-7.055-8.933-19.185-12.092-29.702-7.736L133.63,19.072c-10.516,4.356-16.86,15.167-15.532,26.473l5.799,49.366
        c0.926,7.881-1.964,15.656-7.585,21.257c-0.059,0.059-0.118,0.118-0.178,0.178c-5.602,5.598-13.36,8.477-21.226,7.552
        l-49.363-5.799c-11.305-1.328-22.116,5.015-26.472,15.531L1.939,174.996c-4.356,10.516-1.196,22.646,7.736,29.701l39.006,30.805
        c6.215,4.908,9.665,12.429,9.668,20.348c0,0.084,0,0.167,0,0.251c0.014,7.935-3.44,15.477-9.667,20.395L9.675,307.303
        c-8.933,7.055-12.092,19.185-7.736,29.701l17.134,41.365c4.356,10.516,15.168,16.86,26.472,15.532l49.366-5.799
        c7.882-0.926,15.656,1.965,21.258,7.586c0.059,0.059,0.118,0.119,0.178,0.178c5.597,5.603,8.476,13.36,7.552,21.226l-5.799,49.364
        c-1.328,11.305,5.015,22.116,15.532,26.472l41.366,17.134c10.516,4.356,22.646,1.196,29.701-7.736l30.804-39.005
        c4.908-6.215,12.43-9.665,20.348-9.669c0.084,0,0.168,0,0.251,0c7.936-0.014,15.478,3.44,20.396,9.667l30.806,39.007
        c7.055,8.933,19.185,12.093,29.701,7.736l41.366-17.134c10.516-4.356,16.86-15.168,15.532-26.472l-5.8-49.366
        c-0.926-7.881,1.965-15.656,7.586-21.257c0.059-0.059,0.119-0.119,0.178-0.178c5.602-5.597,13.36-8.476,21.225-7.552l49.364,5.799
        c11.305,1.328,22.117-5.015,26.472-15.531l17.134-41.365C514.418,326.488,511.258,314.358,502.325,307.303z M281.292,329.698
        c-39.68,16.436-85.172-2.407-101.607-42.087c-16.436-39.68,2.407-85.171,42.087-101.608c39.68-16.436,85.172,2.407,101.608,42.088
        C339.815,267.771,320.972,313.262,281.292,329.698z"/>
    </g>
    </svg>
  `,e.addEventListener("click",a=>{a.preventDefault(),a.stopPropagation(),n()}),e}function q(n){const e=document.createElement("div");e.className="ma-grid-settings-modal",e.innerHTML=`
    <div class="ma-grid-settings-overlay">
      <div class="ma-grid-settings-panel">
        <main class="popup" aria-label="MA Grid settings">
          <header class="popup__header">
            <h1 class="popup__title">MA Grid</h1>
            <button class="ma-grid-settings-close" aria-label="Close settings">&times;</button>
          </header>

          <section class="popup__section" aria-labelledby="settings-title">
            <div class="popup__section-header">
              <h2 id="settings-title" class="popup__section-title">Settings</h2>
            </div>
            <div class="popup__card">
              <form class="popup__form" aria-label="Calendar placement">
                <fieldset class="popup__fieldset">
                  <legend class="popup__legend">Placement</legend>
                  <label class="popup__option">
                    <input type="radio" name="anchor" value="incompleteTasks" />
                    <span>Incomplete tasks</span>
                  </label>
                  <label class="popup__option">
                    <input type="radio" name="anchor" value="sidebar" />
                    <span>Sidebar</span>
                  </label>
                </fieldset>
                <fieldset class="popup__fieldset">
                  <legend class="popup__legend">Display</legend>
                  <label class="popup__option">
                    <input type="checkbox" id="ma-grid-hide-xp" />
                    <span>Hide XP panel</span>
                  </label>
                </fieldset>
                <fieldset class="popup__fieldset">
                  <legend class="popup__legend">Debug</legend>
                  <button class="popup__button" type="button" id="ma-grid-clear-cache">
                    Clear cache
                  </button>
                </fieldset>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  `;const a=e.querySelector(".ma-grid-settings-overlay"),r=e.querySelector(".ma-grid-settings-close"),o=Array.from(e.querySelectorAll('input[name="anchor"]')),g=e.querySelector("#ma-grid-hide-xp"),t=e.querySelector("#ma-grid-clear-cache");function m(){e.remove()}a.addEventListener("click",i=>{i.target===a&&m()}),r.addEventListener("click",m);const s=i=>{i.key==="Escape"&&(m(),document.removeEventListener("keydown",s))};return document.addEventListener("keydown",s),o.forEach(i=>{i.addEventListener("change",async u=>{const l=u.target;l instanceof HTMLInputElement&&l.name==="anchor"&&_e(l.value)&&(await _.setItem(z,l.value),n.onSettingsChange())})}),g&&g.addEventListener("change",async()=>{await _.setItem(G,g.checked),n.onSettingsChange()}),t&&t.addEventListener("click",async()=>{const i=t.textContent??"";t.disabled=!0,t.textContent="Clearing...";try{await _.removeItem(L)}catch(u){console.error("[MA-Grid] Failed to clear cache:",u)}t.textContent="Cleared",window.setTimeout(()=>{t.textContent=i,t.disabled=!1},1200),n.onSettingsChange()}),(async()=>{const i=await _.getItem(z)??"incompleteTasks",u=await _.getItem(G)??!1;o.forEach(l=>{l.checked=l.value===i}),g&&(g.checked=u)})(),e}const B=Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC",we=new Intl.DateTimeFormat("en-CA",{timeZone:B}),ve=new Intl.DateTimeFormat("en-US",{timeZone:B,weekday:"short"}),De=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],I=n=>we.format(n);function U(n){const[e,a,r]=n.split("-").map(Number);return new Date(e,a-1,r)}const Z=n=>{const e=ve.format(n),a=De.indexOf(e);return a===-1?n.getDay():a};function N(n){if(n.length===0)return{grid:[],stats:{activeDays:0,totalDays:0,streak:0,maxXP:0,avgXP:0}};const e=new Map;if(n.forEach(b=>{const v=Date.parse(b.completed);if(!Number.isFinite(v))return;const A=new Date(v),M=I(A);e.has(M)||e.set(M,{date:M,xp:0,weekday:Z(A)});const K=e.get(M);K.xp+=b.pointsAwarded}),e.size===0)return{grid:[],stats:{activeDays:0,totalDays:0,streak:0,maxXP:0,avgXP:0}};const a=new Date(Math.max(...Array.from(e.keys()).map(b=>U(b).getTime()))),o=I(new Date),g=U(o),t=new Date(Math.max(a.getTime(),g.getTime())),m=new Date(t);m.setDate(m.getDate()-364);const s=(m.getDay()+7)%7,i=new Date(m);i.setDate(i.getDate()-s);const u=(6-t.getDay()+7)%7,l=new Date(t);l.setDate(l.getDate()+u);const d=Array.from({length:7},()=>[]),c=new Date(i);let h=0;for(;c<=l&&h<53;){for(let b=0;b<7;b++){const v=I(c),A=e.get(v);d[b].push(A||{date:v,xp:0,weekday:Z(c)}),c.setDate(c.getDate()+1)}h++}const f=d.flat(),y=f.filter(b=>b.xp>0),w=y.length,C=f.length,R=Math.max(...f.map(b=>b.xp),0),W=w>0?Math.round(y.reduce((b,v)=>b+v.xp,0)/w):0;let P=0,k=U(o);const $=e.get(o);for((!$||$.xp===0)&&k.setDate(k.getDate()-1);;){const b=I(k),v=e.get(b);if(v&&v.xp>0)P++,k.setDate(k.getDate()-1);else break}return{grid:d,stats:{activeDays:w,totalDays:C,streak:P,maxXP:R,avgXP:W}}}const Ee=1e3;async function V(){try{const n=await storage.getItem(L);if(!n)return[];if(Array.isArray(n.items))return n.items}catch(n){p.warn("[MA-Grid] Failed to read cached activities:",n)}return[]}async function Ce(n=30*Ee){try{const e=await storage.getItem(L);return!e||!e.updatedAt?!1:Date.now()-new Date(e.updatedAt).getTime()<n}catch(e){return p.warn("[MA-Grid] Failed to check cache freshness:",e),!1}}const J=24*60*60*1e3,ke=3*365*J,H=Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC",Ae=new Intl.DateTimeFormat("en-US",{timeZone:H,weekday:"short",month:"short",day:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),Me=new Intl.DateTimeFormat("en-US",{timeZone:H,timeZoneName:"long"});async function Q(n){var l;p.log("[MA Grid] Activity base URL:",`${n}/api/previous-tasks/`);const e=await V();e.length>0&&p.log("[MA Grid] Loaded",e.length,"cached activities.");const a=Date.now(),r=a-ke,o=new Date(r),g=new Set;for(const d of e){const c=d==null?void 0:d.id;typeof c=="number"&&g.add(c)}p.log("[MA Grid] Fetching activities since",o.toISOString());let t={cursor:new Date(a),lastCursorMs:a,fresh:[]};for(let d=0;d<ae;d++){const c=Ae.formatToParts(t.cursor),f=((l=Me.formatToParts(t.cursor).find(x=>x.type==="timeZoneName"))==null?void 0:l.value)||H,y=-t.cursor.getTimezoneOffset(),w=y>=0?"+":"-",C=Math.abs(y),R=String(Math.floor(C/60)).padStart(2,"0"),W=String(C%60).padStart(2,"0"),P=`GMT${w}${R}${W}`,k=c.reduce((x,T)=>(x[T.type]=T.value,x),{}),{weekday:$,month:b,day:v,year:A,hour:M,minute:K,second:ze}=k,Ge=encodeURIComponent(`${$} ${b} ${v} ${A} ${M}:${K}:${ze} ${P} (${f})`),Ie=`${n}/api/previous-tasks/${Ge}`,S=await fetch(Ie,{credentials:"include"});if(!S.ok){const x=S.statusText?` ${S.statusText}`:"";throw new Error(`Request failed: ${S.status}${x}`)}const O=await S.json();if(!Array.isArray(O))throw new Error("Unexpected response: expected an array");if(p.log(`[MA Grid] Page ${d+1} size:`,O.length),O.length===0)t={...t,stopReason:"empty_page"};else{const x=[...t.fresh];let T=!1,X=1/0;for(const E of O){const ee=E==null?void 0:E.id;typeof ee=="number"&&g.has(ee)?T=!0:x.push(E);const ne=Date.parse(E.completed);Number.isFinite(ne)&&(X=Math.min(X,ne))}if(T)t={...t,fresh:x,stopReason:"cached_id"};else{const E=Number.isFinite(X)?new Date(X-1):new Date(t.cursor.getTime()-re*J);E.getTime()===t.lastCursorMs?t={...t,fresh:x,stopReason:"cursor_stuck"}:E<o?t={...t,fresh:x,cursor:E,stopReason:"window_exceeded"}:t={...t,fresh:x,cursor:E,lastCursorMs:E.getTime()}}}if(t.stopReason){t.stopReason==="cached_id"?p.log("[MA Grid] Reached cached activity, stopping pagination."):t.stopReason==="cursor_stuck"?p.warn("[MA Grid] Cursor did not move; ending pagination."):t.stopReason==="window_exceeded"?p.log("[MA Grid] Cursor moved past window start; finishing."):t.stopReason==="empty_page"&&p.log("[MA Grid] Received empty page from API; stopping pagination.");break}await new Promise(x=>setTimeout(x,ie))}const m=[...t.fresh,...e],s=new Map,i=[];for(const d of m){const c=d==null?void 0:d.id;typeof c=="number"?s.has(c)||s.set(c,d):i.push(d)}const u=[...s.values(),...i].filter(d=>{const c=Date.parse(d.completed);return Number.isFinite(c)&&c>=r&&c<=a});return u.sort((d,c)=>{const h=Date.parse(d.completed),f=Date.parse(c.completed);return(Number.isFinite(f)?f:-1/0)-(Number.isFinite(h)?h:-1/0)}),await storage.setItem(L,{items:u,updatedAt:new Date().toISOString()}),p.log("[MA Grid] Total activities after deduplication:",u.length),u}class Se{constructor(){te(this,"updateCallback",null)}onUpdate(e){this.updateCallback=e}async fetchData(){try{const e=await Ce(),a=await V();if(e&&a.length>0)return p.log("[MA-Grid] Returning fresh cached data:",a.length,"activities"),{data:N(a),isFresh:!0};if(!e&&a.length>0){p.log("[MA-Grid] Returning stale cached data, refreshing in background...");const g=N(a);return this.backgroundRefresh(),{data:g,isStale:!0}}p.log("[MA-Grid] Cache empty, fetching fresh data...");const r=await Q(window.location.origin),o=N(r);return p.log("[MA-Grid] Calendar data built:",o.stats),{data:o,isFresh:!0}}catch(e){return p.error("[MA-Grid] Error:",e),{error:e instanceof Error?e.message:String(e)}}}async backgroundRefresh(){try{p.log("[MA-Grid] Starting background refresh...");const e=await Q(window.location.origin),a=N(e);p.log("[MA-Grid] Background refresh complete"),this.updateCallback&&this.updateCallback({data:a,isFresh:!0})}catch(e){p.error("[MA-Grid] Background refresh failed:",e)}}}const Te=`/* MA Grid - GitHub-style contribution calendar */

body {
  margin: 0;

  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu,
    Cantarell, "Helvetica Neue", sans-serif;
  font-family: "Futura Light", "Trebuchet MS", Arial, sans-serif;
}

.ma-grid {
  --cell-size: 10px;
  --cell-gap: 2px;
  --label-width: 12px;
  --weeks: 53;

  background: #fff;
  border: 1px solid rgb(234, 234, 234);
  border-radius: 2px;
  padding: 16px;
  margin: 0 0 16px;
  width: 682px;
  box-sizing: border-box;
}

.ma-grid--sidebar {
  --cell-size: 12px;
  --cell-gap: 2px;
  --label-width: 12px;

  border: 1px solid rgb(224, 224, 224);
  border-radius: 3px;
  width: 352px;
  padding: 12px;
}

.ma-grid__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.ma-grid__title {
  font-size: 16px;
  font-weight: 600;
  color: rgb(30, 25, 78);
  margin: 0;
}

.ma-grid--sidebar .ma-grid__title {
  font-size: 14px;
}

.ma-grid__refresh {
  font-size: 11px;
  padding: 4px 8px;
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  color: #656d76;
  cursor: pointer;
  font-family: inherit;
}

.ma-grid__refresh:hover {
  background: #f3f4f6;
  border-color: #c9d1d9;
  color: #24292f;
}

.ma-grid__refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Stats bar */
.ma-grid__stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #d0d7de;
}

.ma-grid--sidebar .ma-grid__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
}

.ma-grid__stat {
  display: flex;
  flex-direction: column;
}

.ma-grid__stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #24292f;
}

.ma-grid--sidebar .ma-grid__stat-value {
  font-size: 16px;
}

.ma-grid__stat-label {
  font-size: 12px;
  color: #656d76;
}

.ma-grid--sidebar .ma-grid__stat-label {
  font-size: 11px;
}

/* Calendar wrapper */
.ma-grid__wrapper {
  display: flex;
  flex-direction: column;
}

/* Month labels */
.ma-grid__month-labels {
  display: flex;
  margin-bottom: 2px;
  margin-left: calc(var(--label-width) + var(--cell-gap));
  font-size: 9px;
  color: #656d76;
  height: 12px;
}

.ma-grid--sidebar .ma-grid__month-labels {
  font-size: 8px;
  height: 12px;
  margin-bottom: 2px;
}

.ma-grid__month-label {
  text-align: left;
  white-space: nowrap;
  position: relative;
}

/* Grid container */
.ma-grid__grid {
  display: flex;
  gap: var(--cell-gap);
}

/* Weekday labels */
.ma-grid__weekday-labels {
  display: grid;
  grid-template-rows: repeat(7, var(--cell-size));
  gap: var(--cell-gap);
  width: var(--label-width);
  flex-shrink: 0;
}

.ma-grid__weekday-label {
  font-size: 9px;
  color: #656d76;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 2px;
  height: var(--cell-size);
}

.ma-grid--sidebar .ma-grid__weekday-label {
  font-size: 8px;
  padding-right: 1px;
}

/* Days grid */
.ma-grid__days {
  display: grid;
  grid-template-rows: repeat(7, var(--cell-size));
  grid-auto-flow: column;
  grid-auto-columns: var(--cell-size);
  gap: var(--cell-gap);
}

.ma-grid__cell {
  width: var(--cell-size);
  height: var(--cell-size);
  border-radius: 2px;
  outline: 1px solid rgba(27, 31, 35, 0.06);
  outline-offset: -1px;
  cursor: pointer;
}

.ma-grid__cell:hover {
  outline: 1px solid rgba(27, 31, 35, 0.3);
}

.ma-grid__cell--none {
  background-color: #ebedf0;
}

.ma-grid__cell--low {
  background-color: #9be9a8;
}

.ma-grid__cell--medium {
  background-color: #40c463;
}

.ma-grid__cell--high {
  background-color: #30a14e;
}

/* Legend */
.ma-grid__legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 12px;
  font-size: 10px;
  color: #656d76;
}

.ma-grid--sidebar .ma-grid__legend {
  margin-top: 10px;
  font-size: 9px;
}

.ma-grid__legend-label {
  margin: 0 2px;
}

.ma-grid__legend-box {
  width: var(--cell-size);
  height: var(--cell-size);
  border-radius: 2px;
  outline: 1px solid rgba(27, 31, 35, 0.06);
  outline-offset: -1px;
}

.ma-grid__legend-box--none {
  background-color: #ebedf0;
}

.ma-grid__legend-box--low {
  background-color: #9be9a8;
}

.ma-grid__legend-box--medium {
  background-color: #40c463;
}

.ma-grid__legend-box--high {
  background-color: #30a14e;
}

/* Tooltip */
.ma-grid__tooltip {
  position: fixed;
  background: rgba(36, 41, 47, 0.95);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  z-index: 10000;
  max-width: 200px;
}

.ma-grid__tooltip-date {
  font-weight: 600;
  margin-bottom: 2px;
}

.ma-grid__tooltip-xp {
  color: #8b949e;
}

/* Loading state */
.ma-grid__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #656d76;
  font-size: 14px;
  background: #fff;
  border: 1px solid rgb(234, 234, 234);
  border-radius: 2px;
  margin: 16px 0;
  width: fit-content;
  width: 682px;
  box-sizing: border-box;
}

.ma-grid__loading--sidebar {
  width: 352px;
  padding: 16px;
  border: 1px solid rgb(224, 224, 224);
  border-radius: 3px;
}

/* Error state */
.ma-grid__error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #cf222e;
  font-size: 14px;
  background: #fff;
  border: 1px solid rgb(234, 234, 234);
  border-radius: 2px;
  margin: 16px 0;
  width: fit-content;
  width: 682px;
  box-sizing: border-box;
}

.ma-grid__error--sidebar {
  width: 352px;
  padding: 16px;
  border: 1px solid rgb(224, 224, 224);
  border-radius: 3px;
}

/* Refreshing state - stale data being updated */
.ma-grid--refreshing {
  opacity: 0.7;
  transition: opacity 0.3s ease-in-out;
  position: relative;
}

/* Subtle pulsing border to indicate refresh */
.ma-grid--refreshing::before {
  content: "";
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border: 2px solid rgba(101, 109, 118, 0.3);
  border-radius: 2px;
  animation: refresh-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

.ma-grid--sidebar.ma-grid--refreshing::before {
  border-radius: 3px;
}

@keyframes refresh-pulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

/* Smooth transition when fresh data arrives */
.ma-grid:not(.ma-grid--refreshing) {
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}
`,Le=`/**
 * Settings modal styles for userscript
 * Based on popup styles but adapted for in-page modal
 */

/* Settings button in calendar header */
.ma-grid-settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  color: #6c6c6c;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.ma-grid-settings-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #656d76;
}

.ma-grid-settings-btn:active {
  transform: scale(0.95);
}

.ma-grid-settings-btn .st0 {
  fill: currentColor;
}

/* Modal overlay */
.ma-grid-settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999999;
}

.ma-grid-settings-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ma-grid-fade-in 0.2s ease;
}

@keyframes ma-grid-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Modal panel */
.ma-grid-settings-panel {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 420px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  animation: ma-grid-slide-up 0.2s ease;
}

@keyframes ma-grid-slide-up {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes ma-grid-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.ma-grid-settings-modal.ma-grid-fading-out .ma-grid-settings-overlay {
  animation: ma-grid-fade-out 0.15s ease forwards;
}

.ma-grid-settings-modal.ma-grid-fading-out .ma-grid-settings-panel {
  animation: ma-grid-fade-out 0.15s ease forwards;
}

/* Close button */
.ma-grid-settings-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #656d76;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
  padding: 0;
  margin-left: auto;
}

.ma-grid-settings-close:hover {
  background: #f6f8fa;
  color: #24292f;
}

/* Popup styles - copied from popup/style.css */
.ma-grid-settings-panel {
  color-scheme: light;
  --ink: #24292f;
  --muted: #656d76;
  --surface: #ffffff;
  --surface-weak: #f6f8fa;
  --line: #d0d7de;
  --soft-line: rgb(234, 234, 234);
  --focus: rgba(46, 164, 79, 0.25);
}

.ma-grid-settings-panel * {
  box-sizing: border-box;
}

.ma-grid-settings-panel .popup {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  font-family: "Futura Light", "Trebuchet MS", Arial, sans-serif;
  color: var(--ink);
  background: var(--surface);
}

.ma-grid-settings-panel .popup__header {
  display: flex;
  align-items: center;
}

.ma-grid-settings-panel .popup__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: rgb(30, 25, 78);
}

.ma-grid-settings-panel .popup__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ma-grid-settings-panel .popup__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ma-grid-settings-panel .popup__section-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}

.ma-grid-settings-panel .popup__card {
  padding: 12px;
  border-radius: 6px;
  background: var(--surface-weak);
  border: 1px solid var(--soft-line);
}

.ma-grid-settings-panel .popup__form {
  margin: 0;
  display: grid;
  gap: 12px;
}

.ma-grid-settings-panel .popup__fieldset {
  margin: 0;
  padding: 0;
  border: 0;
  display: grid;
  gap: 8px;
  margin-bottom: 4px;
}

.ma-grid-settings-panel .popup__legend {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 6px;
}

.ma-grid-settings-panel .popup__option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
}

.ma-grid-settings-panel .popup__option input {
  margin: 0;
}

.ma-grid-settings-panel .popup__option input:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

.ma-grid-settings-panel .popup__button {
  display: inline-flex;
  align-items: center;
  font-family: inherit;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
  text-align: left;
  width: fit-content;
}

.ma-grid-settings-panel .popup__button:hover {
  background: var(--surface-weak);
}

.ma-grid-settings-panel .popup__button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
`;globalThis.storage=_;const F=_;(async function(){p.log("[MA-Grid] Userscript loaded");const n=new Se;let e=await F.getItem(G)??!1,a=await F.getItem(z)??"incompleteTasks",r=null,o=null;function g(){const s=document.querySelector("#xpFrame");s&&(e?s.style.setProperty("display","none","important"):s.style.removeProperty("display"))}function t(){if(!o)return;const s=async()=>{const u=a;if(e=await F.getItem(G)??!1,a=await F.getItem(z)??"incompleteTasks",g(),u!==a&&o){const l=o.querySelector(".ma-grid-settings-modal");if(l&&(l.classList.add("ma-grid-fading-out"),await new Promise(d=>setTimeout(d,150))),m(),o){await new Promise(c=>setTimeout(c,50));const d=q({onSettingsChange:s});o.appendChild(d)}}},i=q({onSettingsChange:s});o.appendChild(i)}function m(){var y;r&&(r.remove(),r=null,o=null);const s=document.querySelector("#ma-grid");s&&(p.log("[MA-Grid] Removing existing element from previous session"),s.remove());const i=a==="sidebar"?"sidebar":"default",u=document.querySelector(oe[i]);if(!u){p.log("[MA-Grid] Anchor element not found, will retry");return}p.log("[MA-Grid] Dashboard detected, injecting calendar");const l=document.createElement("div");l.id="ma-grid";const d=l.attachShadow({mode:"open"}),c=document.createElement("style");c.textContent=Te+`

`+Le,d.appendChild(c);const h=ye(t),f=xe(i,n,h);d.appendChild(f),a==="sidebar"?(y=u.querySelector("#courseFrame"))==null||y.insertAdjacentElement("afterend",l):u.insertBefore(l,u.firstChild),r=l,o=d}g(),m(),p.log("[MA-Grid] Userscript initialized")})()})();
