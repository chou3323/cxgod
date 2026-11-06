/* CX神 工具層：全圖鑑篩選、重量範圍、自己配置、我的倉庫（原創程式） */
const WR=(D.wr||{}).parts||{},WRS=(D.wr||{}).sources||{};
const LS={get(k,d){try{return JSON.parse(localStorage.getItem('cx_'+k))??d}catch(e){return d}},set(k,v){localStorage.setItem('cx_'+k,JSON.stringify(v))}};
const f2=x=>x==null?'—':(+x).toFixed(2).replace(/0$/,'');
const LV={'多樣本':'lv-ok','樣本不足':'lv-mid','推斷合計':'lv-mid','僅參考值':'lv-ref','無資料':'lv-no'};
const wtyp=id=>{const r=WR[id];if(!r||r.min==null)return P[id]?.spec?.official_g??null;return r.med};
/* inventory: {pid:{q:n,w:[g..]}} seeded from build-time ownership */
function INV(){let v=LS.get('inv',null);if(!v){v={};for(const p of Object.values(P))if(p.own)v[p.id]={q:p.own,w:[]};for(const w of W)if(w.g!=null&&P[w.part]){(v[w.part]=v[w.part]||{q:1,w:[]}).w.push(w.g)}LS.set('inv',v)}return v}
const invQ=id=>(INV()[id]||{}).q||0;
function myW(id){const s=new Set((WR[id]?.mine||[]).map(m=>m.g));(INV()[id]?.w||[]).forEach(g=>s.add(g));return[...s]}
function posOf(r,g){if(!r||r.min==null)return'';if(g<r.typ[0])return'偏輕';if(r.top&&r.n>=3&&g>=r.top[0]&&g>r.typ[1]-1e-9)return'頂重';return'一般'}
function rangeCard(id,compact){const r=WR[id];const mine=myW(id);
 if(!r||r.level==='無資料')return compact?'<span class="b lv-no">無資料</span>':`<div class="wrc"><div class="wrh"><b>重量範圍</b><span class="b lv-no">無資料</span></div><p class="muted">目前找不到任何實測或參考重量，不自行估算。</p></div>`;
 if(compact)return `<span class="wr-mini"><b>${f2(r.typ[0])}${r.typ[1]!==r.typ[0]?'–'+f2(r.typ[1]):''}g</b>${r.top?` <span class="muted">頂 ${f2(r.max)}</span>`:''} <span class="b ${LV[r.level]}">${r.level}${r.n?' '+r.n:''}</span></span>`;
 const lo=Math.min(r.min,...mine,r.ref??r.min),hi=Math.max(r.max,...mine,r.ref??r.max),pad=Math.max((hi-lo)*.15,0.05),a=lo-pad,b=hi+pad,X=v=>((v-a)/(b-a)*100).toFixed(2)+'%',Wd=(u,v)=>Math.max(((v-u)/(b-a)*100),1.2).toFixed(2)+'%';
 const dots=(r.samples||[]).map(s=>`<i class="sd" style="left:${X(s.g)}" title="${s.g}"></i>`).join('');
 const me=mine.map(g=>`<span class="me" style="left:${X(g)}"><em>${g}</em></span>`).join('');
 const srcs=[...new Map((r.samples||[]).map(s=>[s.src,s.src])).keys()].map(u=>{const n=u.includes('kyoganken')?'競技玩具研究所':u.includes('beybase')?'BeyBase':u.includes('hamusuke')?'ハムすけ':u.includes('okuyama')?'おくろぐ':u.includes('carousell')?'Carousell':u;return `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`});
 return `<div class="wrc"><div class="wrh"><b>重量範圍</b><span class="b ${LV[r.level]}">${r.level}｜${r.n} 筆實測</span></div>
 <div class="wrt"><div><small>最輕</small><b>${f2(r.min)}</b></div><div><small>一般</small><b>${f2(r.typ[0])}${r.typ[1]!==r.typ[0]?'–'+f2(r.typ[1]):''}</b></div><div><small>頂重</small><b class="top">${r.top?f2(r.top[0])+(r.top[1]!==r.top[0]?'–'+f2(r.top[1]):''):'—'}</b></div></div>
 <div class="wbar"><span class="wtyp" style="left:${X(r.typ[0])};width:${Wd(r.typ[0],r.typ[1])}"></span>${r.top?`<span class="wtop" style="left:${X(r.top[0])};width:${Wd(r.top[0],r.top[1])}"></span>`:''}${r.ref!=null?`<span class="wref" style="left:${X(r.ref)}"></span>`:''}${dots}${me}</div>
 <div class="wax"><span>${f2(a)}g</span><span>${f2(b)}g</span></div>
 <div class="wlg"><span><i class="lg typ"></i>一般</span><span><i class="lg top"></i>頂重</span><span><i class="lg ref"></i>參考 ${f2(r.ref)}g</span>${mine.length?'<span><i class="lg me"></i>我的</span>':''}</div>
 ${mine.length?`<div class="wme">${mine.map(g=>`我的 <b>${g}g</b> → <b class="${posOf(r,g)==='偏輕'?'bad':posOf(r,g)==='頂重'?'ok':''}">${posOf(r,g)}</b>`).join('｜')}</div>`:''}
 ${r.note?`<p class="muted" style="margin:6px 0 0">${esc(r.note)}</p>`:r.level!=='多樣本'?'<p class="muted" style="margin:6px 0 0">樣本少，範圍僅供參考（推斷）。</p>':''}
 <details><summary>全部 ${r.n} 筆實測</summary><div class="wsl">${(r.samples||[]).map(s=>`<div><b>${s.g}</b> <span class="muted">${esc(s.note)}</span></div>`).join('')||'<span class="muted">只有資料庫參考值</span>'}</div></details>
 <div class="src">來源：${srcs.join('、')||'phstudy 參考值'}</div></div>`}
/* part page: insert range card */
const _part=part;part=function(id){_part(id);const p=P[id];if(!p)return;const sc=app.querySelector('.speccard')||app.querySelector('dl');const h=document.createElement('div');h.innerHTML=(p.custom?`<p><a class="btn ghost" href="#/newpart/${encodeURIComponent(id)}">編輯自訂零件</a></p>`:'')+rangeCard(id)+invCtl(id)+unitList(id);app.insertAdjacentHTML('beforeend',packTable(p)+srcPanel(p));(sc?sc.after(...h.childNodes):app.prepend(...h.childNodes));bindInv();app.querySelectorAll('.wch a[data-a=x]').forEach(a=>a.onclick=()=>{const v=INV();v[a.dataset.id].w.splice(+a.dataset.i,1);LS.set('inv',v);route()})};
function invCtl(id){const v=INV()[id]||{q:0,w:[]};return `<div class="invc" data-id="${esc(id)}"><b>我的倉庫</b><span class="step"><button data-a="-">−</button><b>${v.q}</b><button data-a="+">＋</button></span><input type="number" step="0.01" inputmode="decimal" placeholder="新增秤重 g"><button data-a="w">記錄</button></div>`}
function bindInv(){app.querySelectorAll('.invc').forEach(el=>{const id=el.dataset.id;el.onclick=e=>{const a=e.target.dataset.a;if(!a)return;const v=INV();const r=v[id]||{q:0,w:[]};if(a==='+')r.q++;if(a==='-')r.q=Math.max(0,r.q-1);if(a==='w'){const g=parseFloat(el.querySelector('input').value);if(!(g>0))return;r.w.push(g)}if(a==='x'){r.w.splice(+e.target.dataset.i,1)}v[id]=r;LS.set('inv',v);route()}})}
function packTable(p){const L=p.plist||[];if(!L.length)return `<h2>收錄包裝</h2><div class="card muted">無資料</div>`;
 const tt=L.filter(r=>!r.brand.startsWith('Hasbro')),hb=L.filter(r=>r.brand.startsWith('Hasbro'));
 const row=r=>`<tr><td>${r.kid?`<a href="#/pack/${encodeURIComponent(r.kid)}">${esc(r.code)}</a>`:esc(r.code)}</td><td>${esc(r.name||'')}${r.color?` <small class="muted">${esc(r.color)}</small>`:''}${r.price?` <small class="muted">${esc(r.price)}</small>`:''}</td><td>${esc(r.release||'—')}</td><td>${r.w!=null?r.w:'—'}</td></tr>`;
 return `<h2>收錄包裝（${L.length}）</h2><div class="ptab"><table><tr><th>包號</th><th>商品／版本</th><th>發售</th><th>g</th></tr>${tt.map(row).join('')}${hb.length?`<tr><td colspan="4" class="muted"><b>Hasbro（歐美版）${hb.length}</b></td></tr>`+hb.map(row).join(''):''}</table></div><p class="muted" style="font-size:12px">包裝清單：beyblade.phstudy.org（日版、Hasbro）＋ BeybladeHub；g 為 phstudy 參考值。</p>`}
function srcPanel(p){const r=WR[p.id]||{};const sp=p.spec||{};const f=(k,v,u)=>`<div class="sr2"><span>${k}</span><b>${u?`<a href="${u}" target="_blank" rel="noopener">${esc(v)}</a>`:esc(v)}</b></div>`;
 return `<h2>資料來源</h2><div class="specgrid">${f('攻防持數值',sp.stats?'phstudy（官方）':'無資料',sp.stats?'https://beyblade.phstudy.org/':'')}${f('規格／高度／齒數',sp.gid?'phstudy':'無資料',sp.gid?'https://beyblade.phstudy.org/':'')}${f('包裝清單',(p.plist||[]).length?'phstudy＋BeybladeHub':'無資料','https://beyblade.phstudy.org/')}${f('重量範圍',r.level||'無資料','')}${f('圖片／類型',p.img?'BeybladeHub':'無圖','https://beybladehub.app/')}${f('緊度／優缺點',p.tight||p.pros?'CX神 整理（見各段來源）':'無資料','')}</div>`}
function unitList(id){const u=units(id);return u.length?`<div class="wch">${u.map((g,i)=>`<span class="vchip"><b>個體 #${i+1}</b><small>${g}g ${posOf(WR[id],g)||''}</small><a data-a="x" data-i="${i}" data-id="${esc(id)}">✕</a></span>`).join('')}</div>`:''}
/* pack page: add parts listed by phstudy */
const _pack=pack;pack=function(id){_pack(id);if(!K[id])return;const L=Object.values(P).filter(p=>(p.plist||[]).some(r=>r.kid===id));if(L.length)app.insertAdjacentHTML('beforeend',`<h2>這包的零件（phstudy，${L.length}）</h2><div class="plist">${L.map(p=>`<a class="prow" href="#/part/${encodeURIComponent(p.id)}">${img(p.img,'pth','')}<span class="grow"><b>${esc(p.name)}</b> <span class="muted">${TZ[p.cat]}</span><br>${rangeCard(p.id,1)}</span></a>`).join('')}</div>`)};
/* ownership follows 倉庫 */
for(const p of Object.values(P)){const q=(INV()[p.id]||{}).q;if(q!=null)p.own=q;else if(p.own)p.own=0}
const _need=need;need=function(){_need();const own=Object.values(MI.need||[]).filter(x=>invQ(x.pid)>0);if(own.length)app.insertAdjacentHTML('afterbegin',`<div class="warn">倉庫已記錄你有：${own.map(x=>esc(x.item)).join('、')}（以倉庫為準，可以不用再買）</div>`)};
/* 全圖鑑 */
parts=function(q){const cat=q.get('cat')||'all',o=q.get('own'),s=q.get('s')||'def',t=(q.get('t')||'').toLowerCase(),lv=q.get('lv')||'',pk=q.get('pk')||'';
 const set=(k,v)=>{const n=new URLSearchParams(q);v?n.set(k,v):n.delete(k);return '#/parts?'+n};
 let L=Object.values(P).filter(p=>(cat==='all'||p.cat===cat)&&(!o||invQ(p.id)>0)&&(!lv||WR[p.id]?.level===lv)&&(!pk||(p.plist||[]).some(f=>String(f.code).startsWith(pk))||(p.packs||[]).some(f=>f.pack.startsWith(pk)))&&(!t||[p.name,p.code,p.en,p.jp].join(' ').toLowerCase().includes(t)));
 const k={def:(a,b)=>Object.keys(TZ).indexOf(a.cat)-Object.keys(TZ).indexOf(b.cat),wd:(a,b)=>(wtyp(b.id)??-1)-(wtyp(a.id)??-1),wa:(a,b)=>(wtyp(a.id)??1e9)-(wtyp(b.id)??1e9),top:(a,b)=>(WR[b.id]?.max??-1)-(WR[a.id]?.max??-1),n:(a,b)=>(WR[b.id]?.n||0)-(WR[a.id]?.n||0),nm:(a,b)=>String(a.name).localeCompare(b.name,'zh-Hant')}[s]||(()=>0);L.sort(k);
 const cnt={};Object.values(P).forEach(p=>cnt[p.cat]=(cnt[p.cat]||0)+1);
 app.innerHTML=`<h1>全圖鑑 <small class="muted">${L.length}／${Object.keys(P).length}</small></h1>
 <input class="fin" id="pt" placeholder="篩選名稱／代號／英文" value="${esc(t)}">
 <div class="chips">${[['all','全部'],...Object.entries(TZ)].map(([c,n])=>`<a class="chip ${c===cat?'on':''}" href="${set('cat',c==='all'?'':c)}">${n}${c!=='all'?` <small>${cnt[c]||0}</small>`:''}</a>`).join('')}</div>
 <div class="frow"><select id="ps">${[['def','類型'],['wd','重量 重→輕'],['wa','重量 輕→重'],['top','頂重'],['n','實測筆數'],['nm','名稱']].map(([v,n])=>`<option value="${v}" ${v===s?'selected':''}>排序：${n}</option>`).join('')}</select>
 <select id="pl"><option value="">資料：全部</option>${Object.keys(LV).map(x=>`<option ${x===lv?'selected':''}>${x}</option>`).join('')}</select>
 <select id="pk"><option value="">系列：全部</option>${['CX','UX','BX'].map(x=>`<option ${x===pk?'selected':''}>${x}</option>`).join('')}</select>
 <a class="chip ${o?'on':''}" href="${set('own',o?'':'1')}">只看我有</a></div>
 <div class="plist">${L.map(p=>`<a class="prow" href="#/part/${encodeURIComponent(p.id)}">${img(p.img,'pth','')}<span class="grow"><b>${esc(p.name)}</b> <span class="muted">${TZ[p.cat]}${p.en?'｜'+esc(p.en):''}</span><br>${rangeCard(p.id,1)}</span>${invQ(p.id)?`<span class="b own">×${invQ(p.id)}</span>`:''}</a>`).join('')||'<p class="muted">沒有符合的零件</p>'}</div>`;
 const go=(k,v)=>{location.hash=set(k,v)};$('#ps').onchange=e=>go('s',e.target.value==='def'?'':e.target.value);$('#pl').onchange=e=>go('lv',e.target.value);$('#pk').onchange=e=>go('pk',e.target.value);
 let tm;$('#pt').oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{history.replaceState(null,'',set('t',e.target.value));const v=e.target.value;parts(new URLSearchParams(set('t',v).split('?')[1]));const i=$('#pt');i.focus();i.setSelectionRange(v.length,v.length)},250)}};
/* 自己配置／我的陀螺／自訂零件 */
const SLOTS={cx:[['chip','鎖定紋章',1],['main','主刃',1],['over','超越刃（選配）',0],['assist','輔助刃',1],['ratchet','固鎖',1],['bit','軸心',1]],bx:[['blade','上蓋',1],['ratchet','固鎖',1],['bit','軸心',1]]};
const units=id=>(INV()[id]?.w)||[];
function CMB(){let L=LS.get('combos',null);if(!LS.get('seeded',0)){L=L||[];let n=0;for(const T of (MI.teams||[])){const grp=/備選/.test(T.name)?'備選':'最強隊';for(const b of T.beys){const sl={};b.slots.forEach(s=>{const c=P[s.id]?.cat;if(c)sl[c]=s.id});L.push({id:'k'+Date.now()+(n++),name:b.name,mode:'cx',slots:sl,units:{},grp,fav:grp==='最強隊'?1:0,note:'',g:null,at:new Date().toISOString().slice(0,10)})}}LS.set('combos',L);LS.set('seeded',1)}
 return (L||[]).map((c,i)=>{if(!c.id)c.id='k'+i+Date.now();if(!c.slots&&c.ids){c.slots={};c.ids.forEach(id=>{if(P[id])c.slots[P[id].cat]=id})}c.units=c.units||{};return c})}
function cw(c){let t=0,lo=0,hi=0,miss=0;const st={atk:0,def:0,sta:0,dash:0,burst:0};
 for(const [cat,id] of Object.entries(c.slots||{})){if(!id||!P[id])continue;const u=c.units?.[cat],uw=u!=null?units(id)[u]:null;const r=WR[id],w=uw??wtyp(id);
  if(w==null){miss++}else{t+=w;lo+=uw??r?.min??w;hi+=uw??r?.max??w}const s=P[id]?.spec?.stats;if(s)for(const k in st)st[k]+=+s[k]||0}
 return{t,lo,hi,miss,st}}
const statBars=st=>`<div class="stats">${[['攻','atk','c-atk'],['防','def','c-def'],['持','sta','c-sta'],['速','dash','c-dash'],['爆','burst','c-burst']].map(([l,k,c])=>`<div class="stat"><span class="sl">${l}</span><span class="sv ${c}">${st[k]}</span><span class="sbar"><i style="width:${Math.min(100,st[k]/2)}%"></i></span></div>`).join('')}</div>`;
function build(){const cur=LS.get('cur',{mode:'cx',slots:{},units:{}});cur.slots=cur.slots||{};cur.units=cur.units||{};const slots=SLOTS[cur.mode]||SLOTS.cx;
 const opt=(c,v)=>`<option value="">— ${c==='over'?'不裝':'選擇'} —</option>`+Object.values(P).filter(p=>p.cat===c).sort((a,b)=>(!!b.custom-!!a.custom)||(invQ(b.id)>0)-(invQ(a.id)>0)||String(a.name).localeCompare(b.name,'zh-Hant')).map(p=>`<option value="${esc(p.id)}" ${p.id===v?'selected':''}>${p.custom?'✏️ ':invQ(p.id)?'✅ ':''}${esc(p.name)}${wtyp(p.id)!=null?'｜'+f2(wtyp(p.id))+'g':''}</option>`).join('');
 const r=cw(cur);const editing=cur.edit?CMB().find(c=>c.id===cur.edit):null;
 app.innerHTML=`<h1>${editing?'編輯陀螺':'自己配置'}</h1><div class="chips"><a class="chip ${cur.mode==='cx'?'on':''}" data-m="cx">CX（紋章＋主刃＋輔助）</a><a class="chip ${cur.mode==='bx'?'on':''}" data-m="bx">BX／UX 上蓋</a><a class="chip" href="#/newpart">＋ 自訂零件</a></div>
 <div class="bld">${slots.map(([c,n])=>{const id=cur.slots[c];const us=id?units(id):[];return `<div class="bs">${img(P[id]?.img,'pth','')}<span class="grow"><small class="muted">${n}</small><select data-c="${c}">${opt(c,id)}</select>${us.length?`<select class="usel" data-u="${c}"><option value="">用範圍（未指定個體）</option>${us.map((g,i)=>`<option value="${i}" ${String(cur.units[c])===String(i)?'selected':''}>個體 #${i+1}｜${g}g｜${posOf(WR[id],g)||''}</option>`).join('')}</select>`:''}</span></div>`}).join('')}</div>
 <div class="tot"><div><small>合計（一般）</small><b>${r.t?f2(r.t)+' g':'—'}</b></div><div><small>最輕～頂重</small><b>${r.t?f2(r.lo)+'–'+f2(r.hi):'—'}</b></div><div><small>零件</small><b>${Object.values(cur.slots).filter(Boolean).length}</b></div></div>
 ${r.miss?`<p class="warn">${r.miss} 個零件無重量資料，未計入合計。</p>`:''}${statBars(r.st)}<p class="muted">指定個體時用你秤的重量；否則用實測範圍。數值為官方攻防持加總。</p>
 <input class="fin" id="bn" placeholder="陀螺名稱（例：帝王爆擊 W9-60H）" value="${esc(editing?.name||'')}"><textarea class="fin ta" id="bt" placeholder="備註">${esc(editing?.note||'')}</textarea><input class="fin" id="bg" type="number" step="0.01" inputmode="decimal" placeholder="整顆實秤重量 g（選填）" value="${editing?.g??''}">
 <div class="frow"><button class="btn" id="bsv">${editing?'儲存修改':'存成我的陀螺'}</button>${editing?'<button class="btn ghost" id="bsn">另存新陀螺</button>':''}<button class="btn ghost" id="bcl">清空</button></div>`;
 const save=()=>LS.set('cur',cur);
 app.querySelectorAll('[data-m]').forEach(a=>a.onclick=()=>{LS.set('cur',{mode:a.dataset.m,slots:{},units:{}});build()});
 app.querySelectorAll('select[data-c]').forEach(s=>s.onchange=()=>{cur.slots[s.dataset.c]=s.value;delete cur.units[s.dataset.c];save();build()});
 app.querySelectorAll('select[data-u]').forEach(s=>s.onchange=()=>{s.value===''?delete cur.units[s.dataset.u]:cur.units[s.dataset.u]=+s.value;save();build()});
 const store=asNew=>{const L=CMB();const ids=Object.values(cur.slots).filter(Boolean);if(!ids.length)return alert('先選零件');const g=parseFloat($('#bg').value);
  const c={id:(!asNew&&editing)?editing.id:'k'+Date.now(),name:$('#bn').value.trim()||ids.map(id=>P[id]?.code||'').join(' '),mode:cur.mode,slots:{...cur.slots},units:{...cur.units},note:$('#bt').value,g:g>0?g:null,fav:(!asNew&&editing)?editing.fav:0,grp:(!asNew&&editing)?editing.grp:'',at:new Date().toISOString().slice(0,10)};
  const i=L.findIndex(x=>x.id===c.id);i>=0?L[i]=c:L.unshift(c);LS.set('combos',L);LS.set('cur',{mode:cur.mode,slots:{},units:{}});location.hash='#/my'};
 $('#bsv').onclick=()=>store(0);if(editing)$('#bsn').onclick=()=>store(1);
 $('#bcl').onclick=()=>{LS.set('cur',{mode:cur.mode,slots:{},units:{}});build()}}
function my(q){const L=CMB();const f=q.get('f')||'';
 const card=c=>{const r=cw(c);const ids=Object.values(c.slots).filter(id=>id&&P[id]);return `<div class="card cmb" data-id="${c.id}"><div class="row"><span class="grow"><b>${esc(c.name)}</b>${c.grp?` <span class="b ${c.grp==='最強隊'?'own':'ord'}">${esc(c.grp)}</span>`:''}<br><span class="muted">${r.t?`一般 ${f2(r.t)}g｜${f2(r.lo)}–${f2(r.hi)}g`:'無重量資料'}${c.g?`｜實秤 <b>${c.g}g</b>`:''}</span></span><button class="star ${c.fav?'on':''}" data-a="fav">${c.fav?'★':'☆'}</button></div>
  <div class="cparts">${ids.map(id=>{const cat=P[id].cat,u=c.units?.[cat];return `<a href="#/part/${encodeURIComponent(id)}">${img(P[id].img,'pth','')}<small>${esc(P[id].code||P[id].name)}${u!=null&&units(id)[u]!=null?`<br>#${u+1} ${units(id)[u]}g`:''}</small></a>`}).join('')}</div>
  ${statBars(r.st)}<textarea class="fin ta" data-a="note" placeholder="備註（自動儲存）">${esc(c.note||'')}</textarea>
  <div class="frow"><button class="btn ghost" data-a="edit">編輯</button><button class="btn ghost" data-a="dup">複製</button><button class="btn ghost" data-a="del">刪除</button></div></div>`};
 const S=L.filter(c=>!f||c.fav);const grp=g=>S.filter(c=>(c.grp||'')===g);
 app.innerHTML=`<h1>我的陀螺</h1><p class="muted">${L.length} 顆。存在這台手機，倉庫頁可匯出／匯入。</p><div class="frow"><a class="btn" href="#/build" id="nb">＋ 新陀螺</a><a class="btn ghost" href="#/newpart">＋ 自訂零件</a><a class="chip ${f?'on':''}" href="#/my${f?'':'?f=1'}">★ 只看最愛</a></div>
 ${[['最強隊','最強隊'],['備選','備選'],['','我自己組的']].map(([g,t])=>grp(g).length?`<h2>${t}（${grp(g).length}）</h2>${grp(g).map(card).join('')}`:'').join('')||'<p class="muted">還沒有陀螺</p>'}
 <p><a href="#/team">→ 最強隊 tier 卡與組裝說明</a>｜<a href="#/deck">組隊重複檢查</a></p>
 <h2>阿銘 3CX（參考）</h2>${(D.teams||[]).map(x=>`<div class="card"><h3>${esc(x.name)}</h3>${x.ids.map(i=>CMAP[i]?comboCard(CMAP[i]):'').join('')}<p class="muted">${esc(x.note||'')}</p></div>`).join('')}`;
 $('#nb').onclick=()=>LS.set('cur',{mode:'cx',slots:{},units:{}});
 app.querySelectorAll('.cmb').forEach(el=>{const id=el.dataset.id;const upd=fn=>{const L=CMB();const i=L.findIndex(x=>x.id===id);fn(L,i);LS.set('combos',L)};
  el.querySelector('textarea').oninput=e=>upd((L,i)=>L[i].note=e.target.value);
  el.onclick=e=>{const a=e.target.dataset.a;if(!a||a==='note')return;
   if(a==='fav'){upd((L,i)=>L[i].fav=L[i].fav?0:1);my(q)}
   if(a==='del'&&confirm('刪除這顆陀螺？')){upd((L,i)=>L.splice(i,1));my(q)}
   if(a==='dup'){upd((L,i)=>L.splice(i+1,0,{...L[i],id:'k'+Date.now(),name:L[i].name+'（複製）',grp:'',fav:0}));my(q)}
   if(a==='edit'){const c=CMB().find(x=>x.id===id);LS.set('cur',{mode:c.mode||'cx',slots:{...c.slots},units:{...c.units},edit:id});location.hash='#/build'}}})}
function newpart(eid){const L=LS.get('cparts',[]);const e=L.find(x=>x.id===eid)||{};
 app.innerHTML=`<h1>${e.id?'編輯':'新增'}自訂零件</h1><p class="muted">會出現在圖鑑、搜尋、倉庫和配置。存在這台手機。</p>
 <label class="lab">類型<select class="fin" id="nc">${Object.entries(TZ).map(([c,n])=>`<option value="${c}" ${e.cat===c?'selected':''}>${n}</option>`).join('')}</select></label>
 <label class="lab">名稱<input class="fin" id="nn" value="${esc(e.name||'')}" placeholder="例：金色帝王（中國版）"></label>
 <label class="lab">我的重量 g<input class="fin" id="ng" type="number" step="0.01" inputmode="decimal" value="${e.g??''}"></label>
 <label class="lab">來源／包裝<input class="fin" id="ns" value="${esc(e.src||'')}" placeholder="例：CX-00 限定、蝦皮"></label>
 <label class="lab">攻／防／持（選填）<span class="frow">${['atk','def','sta'].map(k=>`<input class="fin" style="flex:1" type="number" id="n_${k}" value="${e.stats?.[k]??''}" placeholder="${{atk:'攻',def:'防',sta:'持'}[k]}">`).join('')}</span></label>
 <label class="lab">備註<textarea class="fin ta" id="nt">${esc(e.note||'')}</textarea></label>
 <label class="lab">照片（選填，存在手機）<input type="file" id="np" accept="image/*"></label><div id="pv">${e.photo?`<img src="${e.photo}" class="pth" style="width:96px;height:96px">`:''}</div>
 <div class="frow"><button class="btn" id="nsv">儲存</button>${e.id?'<button class="btn ghost" id="ndl">刪除</button>':''}</div>`;
 let photo=e.photo||null;
 $('#np').onchange=ev=>{const f=ev.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{const s=Math.min(1,320/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);photo=c.toDataURL('image/jpeg',.8);$('#pv').innerHTML=`<img src="${photo}" class="pth" style="width:96px;height:96px">`};im.src=URL.createObjectURL(f)};
 $('#nsv').onclick=()=>{const name=$('#nn').value.trim();if(!name)return alert('請輸入名稱');const g=parseFloat($('#ng').value);const st={};['atk','def','sta'].forEach(k=>{const v=parseFloat($('#n_'+k).value);if(v>=0)st[k]=v});
  const c={id:e.id||'c:'+Date.now(),cat:$('#nc').value,name,g:g>0?g:null,src:$('#ns').value.trim(),note:$('#nt').value,photo,stats:Object.keys(st).length?st:null};
  const i=L.findIndex(x=>x.id===c.id);i>=0?L[i]=c:L.push(c);try{LS.set('cparts',L)}catch(err){return alert('照片太大，存不下')}
  const v=INV();if(!v[c.id])v[c.id]={q:1,w:c.g?[c.g]:[]};LS.set('inv',v);location.hash='#/part/'+encodeURIComponent(c.id);location.reload()};
 if(e.id)$('#ndl').onclick=()=>{if(!confirm('刪除這個自訂零件？'))return;LS.set('cparts',L.filter(x=>x.id!==e.id));const v=INV();delete v[e.id];LS.set('inv',v);location.hash='#/parts';location.reload()}}
/* 我的倉庫 */
function inv(q){const v=INV();const L=Object.entries(v).filter(([id,r])=>P[id]&&(r.q>0||r.w.length)).sort((a,b)=>Object.keys(TZ).indexOf(P[a[0]].cat)-Object.keys(TZ).indexOf(P[b[0]].cat));
 const tot=L.reduce((a,[,r])=>a+r.q,0);
 app.innerHTML=`<h1>我的倉庫</h1><p class="muted">${L.length} 種、${tot} 個零件。資料存在這台手機的瀏覽器（localStorage），換手機請用匯出／匯入。</p>
 <div class="frow"><button class="btn" id="iex">匯出 JSON</button><label class="btn ghost">匯入 JSON（含 phstudy 倉庫）<input type="file" id="iim" accept="application/json" hidden></label><button class="btn ghost" id="irs">重設為網站預設</button></div>
 ${L.map(([id,r])=>{const p=P[id],R=WR[id];return `<div class="card"><a class="row" style="color:inherit" href="#/part/${encodeURIComponent(id)}">${img(p.img,'pth','')}<span class="grow"><b>${esc(p.name)}</b> <span class="muted">${TZ[p.cat]}</span><br>${rangeCard(id,1)}</span></a>${invCtl(id)}${r.w.length?`<div class="wch">${r.w.map((g,i)=>`<span class="vchip"><b>${g}g</b><small>${posOf(R,g)||''}</small><a data-a="x" data-i="${i}" data-id="${esc(id)}">✕</a></span>`).join('')}</div>`:''}</div>`}).join('')||'<p class="muted">倉庫是空的，到零件頁按＋加入。</p>'}`;
 bindInv();app.querySelectorAll('.wch a').forEach(a=>a.onclick=()=>{const v=INV();v[a.dataset.id].w.splice(+a.dataset.i,1);LS.set('inv',v);inv(q)});
 $('#iex').onclick=()=>{const blob=new Blob([JSON.stringify({app:'cxgod',v:1,at:new Date().toISOString(),inv:INV(),combos:CMB(),cparts:LS.get('cparts',[])},null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='cxgod-backup.json';a.click()};
 $('#iim').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{const d=JSON.parse(t);if(Array.isArray(d.parts)){const v={};let n=0,miss=0;for(const x of d.parts){const id=D.phid[x.partId];if(!id){miss++;continue}(v[id]=v[id]||{q:0,w:[]}).q++;n++}const cur=INV();for(const k in cur)if(cur[k].w.length)(v[k]=v[k]||{q:0,w:[]}).w=cur[k].w;LS.set('inv',v);alert(`已匯入 phstudy 倉庫：${n} 個零件${miss?`，${miss} 個對不到`:''}`);inv(q);return}if(d.inv)LS.set('inv',d.inv);if(d.combos){LS.set('combos',d.combos);LS.set('seeded',1)}if(d.cparts){LS.set('cparts',d.cparts);setTimeout(()=>location.reload(),300)}alert('已匯入');inv(q)}).catch(()=>alert('檔案格式不對'))};
 $('#irs').onclick=()=>{if(confirm('清除這台裝置的倉庫紀錄，恢復網站預設？')){localStorage.removeItem('cx_inv');inv(q)}}}
home=function(){const fav=CMB().filter(c=>c.fav);
 app.innerHTML=`<h1>CX 神</h1><input class="fin home-q" id="hq" type="search" placeholder="搜尋零件／陀螺／包號"><div class="grid hgrid">${[['#/my','我的陀螺','main:爆擊'],['#/parts','全圖鑑','main:極變'],['#/build','自己配置','assist:W'],['#/inv','我的倉庫','chip:帝王'],['#/team','最強隊','chip:戰神'],['#/weights','秤重紀錄','assist:H'],['#/need','還缺什麼','ratchet:9-60'],['#/mine','我的收藏','chip:天馬'],['#/packs','包裝','bit:K'],['#/combos','全部配置','main:閃擊'],['#/ratchets','固鎖教學','ratchet:7-60'],['#/sources','來源','bit:U']].map(a=>`<a class="tile" href="${a[0]}">${img(P[a[2]]?.img,'')}<div>${a[1]}</div></a>`).join('')}</div>${fav.length?`<p class="muted" style="margin-top:14px">★ 最愛陀螺：${fav.map(c=>esc(c.name)).join('、')}　<a href="#/my">→ 我的陀螺</a></p>`:''}`;
 $('#hq').oninput=e=>{const q=$('#q');q.value=e.target.value;q.dispatchEvent(new Event('input'));q.focus()}};
route();
