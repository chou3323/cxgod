/* CX神 工具層：全圖鑑篩選、重量範圍、自己配置、我的倉庫（原創程式） */
const WR=(D.wr||{}).parts||{},WRS=(D.wr||{}).sources||{};
const LS={get(k,d){try{return JSON.parse(localStorage.getItem('cx_'+k))??d}catch(e){return d}},set(k,v){localStorage.setItem('cx_'+k,JSON.stringify(v))}};
const f2=x=>x==null?'—':(+x).toFixed(2).replace(/0$/,'');
const LV={'多樣本':'lv-ok','樣本不足':'lv-mid','僅參考值':'lv-ref','無資料':'lv-no'};
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
 ${r.level!=='多樣本'?'<p class="muted" style="margin:6px 0 0">樣本少，範圍僅供參考（推斷）。</p>':''}
 <details><summary>全部 ${r.n} 筆實測</summary><div class="wsl">${(r.samples||[]).map(s=>`<div><b>${s.g}</b> <span class="muted">${esc(s.note)}</span></div>`).join('')||'<span class="muted">只有資料庫參考值</span>'}</div></details>
 <div class="src">來源：${srcs.join('、')||'phstudy 參考值'}</div></div>`}
/* part page: insert range card */
const _part=part;part=function(id){_part(id);const p=P[id];if(!p)return;const sc=app.querySelector('.speccard')||app.querySelector('dl');const h=document.createElement('div');h.innerHTML=rangeCard(id)+invCtl(id);(sc?sc.after(...h.childNodes):app.prepend(...h.childNodes));bindInv()};
function invCtl(id){const v=INV()[id]||{q:0,w:[]};return `<div class="invc" data-id="${esc(id)}"><b>我的倉庫</b><span class="step"><button data-a="-">−</button><b>${v.q}</b><button data-a="+">＋</button></span><input type="number" step="0.01" inputmode="decimal" placeholder="新增秤重 g"><button data-a="w">記錄</button></div>`}
function bindInv(){app.querySelectorAll('.invc').forEach(el=>{const id=el.dataset.id;el.onclick=e=>{const a=e.target.dataset.a;if(!a)return;const v=INV();const r=v[id]||{q:0,w:[]};if(a==='+')r.q++;if(a==='-')r.q=Math.max(0,r.q-1);if(a==='w'){const g=parseFloat(el.querySelector('input').value);if(!(g>0))return;r.w.push(g)}if(a==='x'){r.w.splice(+e.target.dataset.i,1)}v[id]=r;LS.set('inv',v);route()}})}
/* 全圖鑑 */
parts=function(q){const cat=q.get('cat')||'all',o=q.get('own'),s=q.get('s')||'def',t=(q.get('t')||'').toLowerCase(),lv=q.get('lv')||'',pk=q.get('pk')||'';
 const set=(k,v)=>{const n=new URLSearchParams(q);v?n.set(k,v):n.delete(k);return '#/parts?'+n};
 let L=Object.values(P).filter(p=>(cat==='all'||p.cat===cat)&&(!o||invQ(p.id)>0)&&(!lv||WR[p.id]?.level===lv)&&(!pk||(p.packs||[]).some(f=>f.pack.startsWith(pk)))&&(!t||[p.name,p.code,p.en,p.jp].join(' ').toLowerCase().includes(t)));
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
/* 自己配置 */
const SL=[['chip','鎖定紋章'],['main','主刃'],['assist','輔助刃'],['ratchet','固鎖'],['bit','軸心']];
function build(){const cur=LS.get('cur',{mode:'cx'});const bx=cur.mode==='bx';const slots=bx?[['blade','上蓋'],['ratchet','固鎖'],['bit','軸心']]:SL;
 const opt=(c,v)=>`<option value="">— 選擇${TZ[c]} —</option>`+Object.values(P).filter(p=>p.cat===c||(c==='main'&&p.cat==='over')).sort((a,b)=>(invQ(b.id)>0)-(invQ(a.id)>0)||String(a.name).localeCompare(b.name,'zh-Hant')).map(p=>`<option value="${esc(p.id)}" ${p.id===v?'selected':''}>${invQ(p.id)?'✅ ':''}${esc(p.name)}${wtyp(p.id)!=null?'｜'+f2(wtyp(p.id))+'g':''}</option>`).join('');
 const ids=slots.map(s=>cur[s[0]]).filter(Boolean);let t=0,lo=0,hi=0,miss=0;const st={atk:0,def:0,sta:0,dash:0,burst:0};
 ids.forEach(id=>{const r=WR[id],w=wtyp(id);if(w==null){miss++;return}t+=w;lo+=r?.min??w;hi+=r?.max??w;const s=P[id]?.spec?.stats;if(s)for(const k in st)st[k]+=+s[k]||0});
 const saved=LS.get('combos',[]);
 app.innerHTML=`<h1>自己配置</h1><div class="chips"><a class="chip ${bx?'':'on'}" data-m="cx">CX（紋章＋主刃＋輔助）</a><a class="chip ${bx?'on':''}" data-m="bx">BX／UX 上蓋</a></div>
 <div class="bld">${slots.map(([c,n])=>`<label class="bs">${img(P[cur[c]]?.img,'pth','')}<span class="grow"><small class="muted">${n}</small><select data-c="${c}">${opt(c,cur[c])}</select></span></label>`).join('')}</div>
 <div class="tot"><div><small>合計（一般）</small><b>${t?f2(t)+' g':'—'}</b></div><div><small>最輕～頂重</small><b>${t?f2(lo)+'–'+f2(hi):'—'}</b></div><div><small>零件</small><b>${ids.length}/${slots.length}</b></div></div>
 ${miss?`<p class="warn">${miss} 個零件無重量資料，未計入合計。</p>`:''}
 <div class="stats">${[['攻','atk','c-atk'],['防','def','c-def'],['持','sta','c-sta'],['速','dash','c-dash'],['爆','burst','c-burst']].map(([l,k,c])=>`<div class="stat"><span class="sl">${l}</span><span class="sv ${c}">${st[k]}</span><span class="sbar"><i style="width:${Math.min(100,st[k]/2)}%"></i></span></div>`).join('')}</div>
 <p class="muted">數值為官方攻防持加總（phstudy 規格），僅供比較。</p>
 <div class="frow"><input class="fin" id="bn" placeholder="配置名稱（例：帝王爆擊 W9-60H）" style="flex:1"><button class="btn" id="bsv">儲存</button><button class="btn ghost" id="bcl">清空</button></div>
 <h2>已存配置（${saved.length}）</h2>${saved.map((c,i)=>{const tw=c.ids.reduce((a,id)=>a+(wtyp(id)||0),0);return `<div class="card row"><span class="grow"><b>${esc(c.name)}</b><br><span class="muted">${c.ids.map(id=>esc(P[id]?.code||P[id]?.name||id)).join(' ／ ')}｜${f2(tw)}g</span></span><button class="btn ghost" data-l="${i}">載入</button><button class="btn ghost" data-d="${i}">刪</button></div>`}).join('')||'<p class="muted">還沒有</p>'}`;
 app.querySelectorAll('[data-m]').forEach(a=>a.onclick=()=>{LS.set('cur',{mode:a.dataset.m});build()});
 app.querySelectorAll('select[data-c]').forEach(s=>s.onchange=()=>{cur[s.dataset.c]=s.value;LS.set('cur',cur);build()});
 $('#bsv').onclick=()=>{if(!ids.length)return;const name=$('#bn').value.trim()||ids.map(id=>P[id]?.code||'').join(' ');saved.unshift({name,mode:cur.mode,ids,slots:Object.fromEntries(slots.map(s=>[s[0],cur[s[0]]||''])),at:new Date().toISOString().slice(0,10)});LS.set('combos',saved);build()};
 $('#bcl').onclick=()=>{LS.set('cur',{mode:cur.mode});build()};
 app.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{const c=saved[+b.dataset.l];LS.set('cur',{mode:c.mode,...c.slots});build()});
 app.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{saved.splice(+b.dataset.d,1);LS.set('combos',saved);build()})}
/* 我的倉庫 */
function inv(q){const v=INV();const L=Object.entries(v).filter(([id,r])=>P[id]&&(r.q>0||r.w.length)).sort((a,b)=>Object.keys(TZ).indexOf(P[a[0]].cat)-Object.keys(TZ).indexOf(P[b[0]].cat));
 const tot=L.reduce((a,[,r])=>a+r.q,0);
 app.innerHTML=`<h1>我的倉庫</h1><p class="muted">${L.length} 種、${tot} 個零件。資料存在這台手機的瀏覽器（localStorage），換手機請用匯出／匯入。</p>
 <div class="frow"><button class="btn" id="iex">匯出 JSON</button><label class="btn ghost">匯入 JSON<input type="file" id="iim" accept="application/json" hidden></label><button class="btn ghost" id="irs">重設為網站預設</button></div>
 ${L.map(([id,r])=>{const p=P[id],R=WR[id];return `<div class="card"><a class="row" style="color:inherit" href="#/part/${encodeURIComponent(id)}">${img(p.img,'pth','')}<span class="grow"><b>${esc(p.name)}</b> <span class="muted">${TZ[p.cat]}</span><br>${rangeCard(id,1)}</span></a>${invCtl(id)}${r.w.length?`<div class="wch">${r.w.map((g,i)=>`<span class="vchip"><b>${g}g</b><small>${posOf(R,g)||''}</small><a data-a="x" data-i="${i}" data-id="${esc(id)}">✕</a></span>`).join('')}</div>`:''}</div>`}).join('')||'<p class="muted">倉庫是空的，到零件頁按＋加入。</p>'}`;
 bindInv();app.querySelectorAll('.wch a').forEach(a=>a.onclick=()=>{const v=INV();v[a.dataset.id].w.splice(+a.dataset.i,1);LS.set('inv',v);inv(q)});
 $('#iex').onclick=()=>{const blob=new Blob([JSON.stringify({app:'cxgod',v:1,at:new Date().toISOString(),inv:INV(),combos:LS.get('combos',[])},null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='cxgod-backup.json';a.click()};
 $('#iim').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{const d=JSON.parse(t);if(d.inv)LS.set('inv',d.inv);if(d.combos)LS.set('combos',d.combos);alert('已匯入');inv(q)}).catch(()=>alert('檔案格式不對'))};
 $('#irs').onclick=()=>{if(confirm('清除這台裝置的倉庫紀錄，恢復網站預設？')){localStorage.removeItem('cx_inv');inv(q)}}}
route();
