const D=window.DB,P=D.parts,K=D.packs,CO=D.combos,S=D.src,TZ=D.typezh;
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CMAP=Object.fromEntries(CO.map(c=>[c.id,c]));
const packId=x=>K[x]?x:(K[x.replace(/-\d\d$/,'')]?x.replace(/-\d\d$/,''):null);
const tag=t=>`<span class="b ${['阿銘','推斷','查無','chou轉述'].includes(t)?'t-'+t:'t-x'}">${esc(t==='阿銘'?'阿銘認證':t==='推斷'?'推斷':t)}</span>`;
const kind=k=>`<span class="b k-${esc(k)}">${esc(k)}</span>`;
const img=(src,cls='thumb',alt='')=>src?`<img class="${cls}" src="${src}" alt="${esc(alt)}" loading="lazy">`:`<div class="${cls} ph">無圖</div>`;
const own=p=>p.own?`<span class="b own">✅ 已有 ×${p.own}</span>`:'';
const ord=p=>p.ord?`<span class="b ord">🛒 已下單 ×${p.ord}</span>`:'';
const ownb=p=>(own(p)+ord(p))||'<span class="b no">❌ 沒有</span>';
const srcs=a=>(a||[]).map(k=>S[k]?`<a href="${S[k][1]}" target="_blank" rel="noopener">▶ ${esc(S[k][0])}</a>`:'').join('');
const pname=id=>P[id]?P[id].name:id;
const plink=id=>`<a href="#/part/${encodeURIComponent(id)}">${esc(pname(id))}</a>`;
const kname=x=>{const i=packId(x);return i?`${x} ${K[i].name||''}`:x};
const klink=x=>{const i=packId(x);return i?`<a href="#/pack/${encodeURIComponent(i)}">${esc(kname(x))}</a>`:esc(x)};
const stars=n=>n?`<span class="stars">${'★'.repeat(n)}${'☆'.repeat(3-n)}</span>`:'';
const comboName=c=>esc(c.name);
function cimg(c){const m=P[c.slots[1]?.[0]]||P[c.slots[0][0]];return m?.img}

/* ---------- search ---------- */
const IDX=[];
for(const c of CO)IDX.push({t:'配置',h:'#/combo/'+c.id,title:c.name,sub:`${c.creator}｜${c.style}`,img:cimg(c),k:(c.name+' '+c.creator+' '+c.group+' '+c.style+' '+(c.orig||'')+' '+c.slots.map(s=>pname(s[0])+' '+(P[s[0]]?.code||'')).join(' ')).toLowerCase()});
for(const p of Object.values(P))IDX.push({t:'零件',h:'#/part/'+encodeURIComponent(p.id),title:p.name,sub:`${TZ[p.cat]}${p.own?'｜✅已有':p.ord?'｜🛒已下單':''}`,img:p.img,code:p.code.toLowerCase(),k:[p.name,p.code,p.en,p.jp,TZ[p.cat],p.id].join(' ').toLowerCase()});
for(const k of Object.values(K))IDX.push({t:'包裝',h:'#/pack/'+encodeURIComponent(k.id),title:`${k.id} ${k.name||''}`,sub:(k.beys||[]).map(b=>b.name).join('、').slice(0,60),img:k.img,code:k.id.toLowerCase(),k:[k.id,k.code,k.name,k.en,k.jp,k.aka,...(k.beys||[]).map(b=>b.name+' '+b.combo+' '+b.en)].join(' ').toLowerCase()});
function search(q){q=q.trim().toLowerCase();if(!q)return[];
  const v=q.replace(/-\d\d$/,'');const terms=q.split(/\s+/);
  return IDX.map(e=>{let s=0;if(e.code===q)s=100;else if(e.code&&e.code===v)s=90;else if(e.title.toLowerCase()===q)s=95;else if(e.title.toLowerCase().startsWith(q))s=60;else if(terms.every(t=>e.k.includes(t)))s=30;else return null;
   if(e.t==='零件'&&s>=30&&q.length<=2&&e.code!==q)s-=15;return[s,e]}).filter(Boolean).sort((a,b)=>b[0]-a[0]).map(x=>x[1])}
const qi=$('#q'),sr=$('#sres');let sel=-1;
function renderS(){const r=search(qi.value);sel=-1;if(!qi.value.trim()){sr.hidden=true;return}
  const g={'配置':[],'零件':[],'包裝':[]};r.forEach(e=>g[e.t].length<8&&g[e.t].push(e));
  let h='';for(const[t,a]of Object.entries(g))if(a.length)h+=`<div class="sg">${t}</div>`+a.map(e=>`<a class="sr" href="${e.h}">${e.img?`<img src="${e.img}" alt="">`:'<div class="ph">—</div>'}<span>${esc(e.title)}<small>${esc(e.sub)}</small></span></a>`).join('');
  sr.innerHTML=h||'<div class="sg">找不到</div>';sr.hidden=false}
qi.addEventListener('input',renderS);qi.addEventListener('focus',renderS);
qi.addEventListener('keydown',e=>{const a=[...sr.querySelectorAll('.sr')];if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+a.length)%a.length;a.forEach((x,i)=>x.classList.toggle('on',i===sel))}else if(e.key==='Enter'&&a.length){location.hash=(a[sel<0?0:sel]).getAttribute('href');qi.blur();sr.hidden=true}else if(e.key==='Escape'){sr.hidden=true}});
document.addEventListener('click',e=>{if(!e.target.closest('.sbox'))sr.hidden=true;else if(e.target.closest('.sr')){sr.hidden=true;qi.blur()}});

/* ---------- views ---------- */
function slotRow(s){const p=P[s[0]];return `<a class="slot" href="#/part/${encodeURIComponent(s[0])}">${img(p?.img,'')}<span class="grow"><span class="muted">${TZ[p?.cat]||''}</span> ${kind('正選')}<br><b>${esc(pname(s[0]))}</b> ${p?ownb(p):''}${p?.best?`<br><span class="muted">最佳包：${esc(kname(p.best.pack))}</span>`:''}</span></a>`+
 (s[1].length?`<div class="alts">${s[1].map(a=>`<div>${kind(a[1])} ${plink(a[0])} ${tag(a[2])} <span class="muted">${esc(a[3])}</span></div>`).join('')}</div>`:'')}
function comboCard(c){return `<a class="card row" href="#/combo/${c.id}" style="color:inherit">${img(cimg(c))}<span class="grow"><b>${comboName(c)}</b><br><span class="muted">${esc(c.creator)}｜${esc(c.style)}</span><br>${tag(c.tag)}</span></a>`}
function home(){const t=D.teams;app.innerHTML=`<h1>CX 神 總攻略</h1><p class="muted">以阿銘為主、阿土／深藏blue／雪兔／WBO 為輔。點陀螺 → 看每個零件 → 看哪包出、最緊版本、平替、怕什麼。沒有 G 輔助（暫不買），EVA 整組收藏不拆。</p>
<div class="info">標籤：${tag('阿銘')} 影片/留言親口說 ${tag('chou轉述')} ${tag('阿土')} 其他創作者／賽果 ${tag('推斷')} 沒人實證，先測試 ${tag('查無')}</div>
<h2>推薦 3CX 隊伍</h2>${t.map(x=>`<div class="card"><h3>${esc(x.name)} ${tag(x.tag)}</h3>${x.ids.map(i=>comboCard(CMAP[i])).join('')}<p class="muted">${esc(x.note)}</p><a href="#/deck/${x.ids.join(',')}">→ 組隊重複檢查</a></div>`).join('')}
<h2>快速入口</h2><div class="grid">${[['#/combos','全部配置',P['main:爆擊']?.img],['#/guide','爆擊 & 極變',P['main:極變']?.img],['#/ratchets','固鎖應對',P['ratchet:9-60']?.img],['#/spares','原價囤備品',P['assist:W']?.img],['#/parts?own=1','我的零件',P['chip:天馬']?.img],['#/deck','組隊檢查',P['bit:K']?.img]].map(a=>`<a class="tile" href="${a[0]}">${img(a[2],'')}<div>${a[1]}</div></a>`).join('')}</div>`}
function combos(q){const f=q.get('c')||'全部';const gs=['全部',...new Set(CO.map(c=>c.creator))];
 app.innerHTML=`<h1>配置</h1><div class="chips">${gs.map(g=>`<a class="chip ${g===f?'on':''}" href="#/combos?c=${encodeURIComponent(g)}">${esc(g)}</a>`).join('')}</div>`+
 [...new Set(CO.filter(c=>f==='全部'||c.creator===f).map(c=>c.group))].map(g=>`<h2>${esc(g)}</h2>`+CO.filter(c=>c.group===g&&(f==='全部'||c.creator===f)).map(comboCard).join('')).join('')}
function combo(id){const c=CMAP[id];if(!c)return nf();const parts=c.slots.map(s=>s[0]);
 app.innerHTML=`<p class="muted"><a href="#/combos">配置</a> › ${esc(c.creator)}</p><h1>${comboName(c)}</h1><div>${tag(c.tag)} <span class="muted">${esc(c.style)}</span></div>
 ${c.orig?`<div class="info">原版：${esc(c.orig)}</div>`:''}${c.note?`<div class="info">${esc(c.note)}</div>`:''}
 <div class="grid" style="grid-template-columns:repeat(${parts.length},1fr);gap:4px">${parts.map(p=>`<a href="#/part/${encodeURIComponent(p)}" class="tile" style="padding:4px">${img(P[p]?.img,'')}<div style="font-size:11px">${esc(P[p]?.code||p)}</div></a>`).join('')}</div>
 <h2>零件（點擊看詳細）｜正選／次選／平替</h2>${c.slots.map(slotRow).join('')}
 ${c.play?`<h2>打法／發射</h2><div class="card">${esc(c.play)}</div>`:''}
 ${(c.pros||c.cons)?`<div class="card"><b class="ok">優勢</b><ul class="pros">${(c.pros||[]).map(x=>`<li>${esc(x)}</li>`).join('')||'<li>查無</li>'}</ul><b class="bad">缺點</b><ul class="cons">${(c.cons||[]).map(x=>`<li>${esc(x)}</li>`).join('')||'<li>查無</li>'}</ul></div>`:''}
 <h2>組裝步驟</h2><div class="card"><ol>${c.slots.map(s=>{const p=P[s[0]];return `<li>${TZ[p?.cat]}：${plink(s[0])} ← ${p?.best?klink(p.best.pack):(p?.packs?.[0]?klink(p.packs[0].pack):'查無')}</li>`}).join('')}<li>鎖片 → 主刃 →（超越刃）→ 輔助刃 對齊缺口，用軸心當扳手轉到「喀」。上蓋要緊不能晃（阿銘）。</li><li>配好就不拆，常拆會磨鬆卡榫。</li></ol></div>
 <h2>來源</h2><div class="src">${srcs(c.src)||'—'}</div><p><a href="#/deck/${id}">→ 放進組隊檢查</a></p>`}
function part(id){const p=P[id];if(!p)return nf();const used=(p.usedIn||[]).map(i=>CMAP[i]).filter(Boolean);
 const b=p.best;app.innerHTML=`<p class="muted"><a href="#/parts?cat=${p.cat}">${TZ[p.cat]}</a></p>
 ${img(p.img,'hero',p.name)}<h1>${esc(p.name)}</h1><div>${ownb(p)} ${p.spare?`<span class="b t-推斷">備品 ${stars(p.spare)}</span>`:''} ${p.noBuy?'<span class="b no">暫不買</span>':''}</div>
 <dl>${p.en?`<dt>英文</dt><dd>${esc(p.en)}</dd>`:''}${p.jp?`<dt>日文</dt><dd>${esc(p.jp)}</dd>`:''}${p.btype?`<dt>類型</dt><dd>${esc(p.btype)}${p.spin?'｜'+esc(p.spin):''}</dd>`:''}${p.weight?`<dt>重量</dt><dd>${esc(p.weight)}${typeof p.weight==='number'?' g':'（Hub 等級）'}</dd>`:''}${p.shape?`<dt>形狀</dt><dd>${esc(p.shape)}</dd>`:''}</dl>
 ${p.desc?`<div class="card muted">${esc(p.desc)}</div>`:''}
 ${b?`<h2>⭐ 評價最好／最緊版本</h2><div class="card">${(()=>{const k=K[packId(b.pack)];return `<div class="row">${img(k?.img)}<span class="grow"><b>${klink(b.pack)}</b> ${tag(b.tag)}<br>${esc(b.why)}</span></div>`})()}<div class="src">${srcs(b.src)}</div></div>`:''}
 ${p.tight?`<h2>緊度</h2><div class="card">${esc(p.tight)}</div>`:''}
 <h2>💰 平替／替代</h2>${p.alts&&p.alts.length?p.alts.map(a=>`<div class="card row">${img(P[a.id]?.img)}<span class="grow">${plink(a.id)} ${tag(a.tag)}<br><span class="muted">${esc(a.note)}</span><div class="src">${srcs(a.src)}</div></span></div>`).join(''):'<div class="card muted">沒有阿銘／阿土給過的替代（查無）。更便宜的拿法看下面「哪些包有」挑你已有或便宜的包（推斷）。</div>'}
 ${(p.pros||p.cons)?`<div class="card"><b class="ok">優勢</b><ul class="pros">${(p.pros||[]).map(x=>`<li>${esc(x)}</li>`).join('')||'<li>查無</li>'}</ul><b class="bad">缺點</b><ul class="cons">${(p.cons||[]).map(x=>`<li>${esc(x)}</li>`).join('')||'<li>查無</li>'}</ul></div>`:''}
 ${p.win||p.fears?`<div class="card"><dl><dt>有利</dt><dd>${esc(p.win||'查無')}</dd><dt>怕</dt><dd class="bad">${esc(p.fears||'查無')}</dd>${p.atu?`<dt>阿土出處</dt><dd>${esc(p.atu)}（A＝#10、B＝0~9 固鎖解析、C＝4月天梯）</dd>`:''}</dl></div>`:''}
 ${p.play?`<h2>打法</h2><div class="card">${esc(p.play)}</div>`:''}${p.spareWhy?`<div class="warn">備品：${esc(p.spareWhy)}</div>`:''}${p.comp?`<div class="card muted">賽場：${esc(p.comp)}</div>`:''}
 <h2>用在哪些配置（${used.length}）</h2>${used.map(comboCard).join('')||'<p class="muted">資料庫配置未使用</p>'}
 <h2>哪些包有（${p.packs.length}）</h2>${p.packs.map(f=>{const k=K[f.pack];return `<a class="card row" style="color:inherit" href="#/pack/${encodeURIComponent(f.pack)}">${img(k?.img)}<span class="grow"><b>${esc(f.pack)} ${esc(f.pname||k?.name||'')}</b> ${k?.own?'<span class="b own">✅</span>':''}${k?.ord?'<span class="b ord">🛒</span>':''}<br><span class="muted">${esc(f.bey||'')}${f.rare?'｜稀有':''}${f.color?'｜'+esc(f.color):''}${f.twd?'｜NT$'+f.twd:''}${f.jpy?'｜¥'+f.jpy:''}</span></span></a>`}).join('')||'<p class="muted">查無</p>'}`}
function parts(q){const cat=q.get('cat')||'chip',o=q.get('own');const cats=Object.keys(TZ);
 let L=Object.values(P).filter(p=>p.cat===cat&&(!o||p.own||p.ord));L.sort((a,b)=>(!!b.best-!!a.best)||((b.own||0)+(b.ord||0))-((a.own||0)+(a.ord||0)));
 app.innerHTML=`<h1>零件</h1><div class="chips">${cats.map(c=>`<a class="chip ${c===cat?'on':''}" href="#/parts?cat=${c}${o?'&own=1':''}">${TZ[c]}</a>`).join('')}<a class="chip ${o?'on':''}" href="#/parts?cat=${cat}${o?'':'&own=1'}">只看我有的</a></div>
 <div class="grid">${L.map(p=>`<a class="tile" href="#/part/${encodeURIComponent(p.id)}">${img(p.img,'')}<div>${esc(p.name)}</div>${p.own?'<span class="b own">✅'+p.own+'</span>':''}${p.ord?'<span class="b ord">🛒'+p.ord+'</span>':''}${p.best?'<span class="b t-阿銘">攻略</span>':''}</a>`).join('')}</div>`}
function packs(q){const f=q.get('l')||'CX';const L=Object.values(K).filter(k=>f==='我的'?(k.own||k.ord):k.id.startsWith(f));
 app.innerHTML=`<h1>包裝</h1><div class="chips">${['CX','UX','BX','我的'].map(x=>`<a class="chip ${x===f?'on':''}" href="#/packs?l=${x}">${x}</a>`).join('')}</div><div class="grid">${L.map(k=>`<a class="tile" href="#/pack/${encodeURIComponent(k.id)}">${img(k.img,'')}<div>${esc(k.id)}</div><span class="muted">${esc(k.name||'')}</span><br>${k.own?'<span class="b own">✅'+k.own+'</span>':''}${k.ord?'<span class="b ord">🛒'+k.ord+'</span>':''}</a>`).join('')}</div>`}
function pack(id){const k=K[id];if(!k)return nf();const inP=Object.values(P).filter(p=>p.packs.some(f=>f.pack===id));
 app.innerHTML=`<p class="muted"><a href="#/packs">包裝</a></p>${img(k.img,'hero',k.name)}<h1>${esc(k.id)} ${esc(k.name||'')}</h1><div>${k.own?`<span class="b own">✅ 已有 ×${k.own}${k.ownv.length?'（'+k.ownv.join('、')+'）':''}</span>`:''}${k.ord?`<span class="b ord">🛒 已下單 ×${k.ord}${k.ordv.length?'（'+k.ordv.join('、')+'）':''}</span>`:''}</div>
 <dl>${k.en?`<dt>英文</dt><dd>${esc(k.en)}</dd>`:''}${k.jp?`<dt>日文</dt><dd>${esc(k.jp)}</dd>`:''}${k.aka?`<dt>別名</dt><dd>${esc(k.aka)}</dd>`:''}<dt>日本發售</dt><dd>${esc(k.date||'—')}</dd><dt>價格</dt><dd>${k.twd?'NT$'+k.twd:'台灣價未確認'}${k.jpy?'｜¥'+k.jpy:''}</dd></dl>
 ${k.desc?`<div class="card muted">${esc(k.desc)}</div>`:''}<h2>內容</h2>${(k.beys||[]).map((b,i)=>`<div class="card"><b>#${String(i+1).padStart(2,'0')} ${esc(b.name)}</b><br><span class="muted">${esc(b.combo||'')}</span></div>`).join('')}
 <h2>可拆出的零件</h2><div class="grid">${inP.map(p=>`<a class="tile" href="#/part/${encodeURIComponent(p.id)}">${img(p.img,'')}<div>${esc(p.name)}</div><span class="muted">${TZ[p.cat]}</span></a>`).join('')}</div>
 ${k.id.startsWith('CX-00-eva')?'<div class="warn">EVA 整組只收藏，不拆（含零號機）。</div>':''}${k.src?`<p class="src"><a href="${k.src}" target="_blank" rel="noopener">BeybladeHub 原頁</a></p>`:''}`}
const SPARE=[['assist:W','CX-08-01 魔犬烈焰','唯一純黑 W，比紫色耐用約一倍（阿土 #10）',3],['main:閃擊','CX-13 龍王閃擊','一般版只有這包；紋路磨平馬上換（阿銘）',3],['ratchet:7-60','CX-05 巨鯨怒濤（Vol.6）','Reddit 專抽這包拿 7-60；UX-06 偏鬆避開；爆 5～6 次換',3],['assist:H','CX-11 帝王威能（日版）','美版模具較鬆；九成新以上極變才會復活（阿土 #27 5:19）',2],['ratchet:9-60','UX-05-02 忍者闇影（黑）','巴哈作者驗證最緊（單一來源）',2],['ratchet:1-60','BX-31-05 鮫鯊鋒鰭（黑）','巴哈說最緊（單一來源）',2],['ratchet:3-60','BX-14 鮫鯊（黑綠）','阿銘推薦（來源包推斷）',2],['ratchet:9-70','UX-18-04 焰神勇氣／UX-07','無版本差資料',1],['ratchet:6-70','BX-45 武士魂斬','唯一出處',1],['ratchet:7-70','CX-08-05 玄冥戰甲','可跟黑 W 一起抽（推斷）',1]];
function spares(){app.innerHTML=`<h1>原價看到就囤</h1><p class="muted">每個零件只挑一包（緊度 → 重量 → 評價）。鬆緊主要還是個體差，照買不保證一定緊。</p>${SPARE.map(s=>{const p=P[s[0]];return `<a class="card row" style="color:inherit" href="#/part/${encodeURIComponent(s[0])}">${img(p?.img)}<span class="grow"><b>${esc(p?.name)}</b> ${stars(s[3])} ${p?ownb(p):''}<br>→ <b>${esc(s[1])}</b><br><span class="muted">${esc(s[2])}</span></span></a>`}).join('')}
<div class="info">不用囤：K 軸（阿土：越磨越強）；Nr、U、L、LR、H 軸沒人說會磨耗。G 輔助：暫不買。</div>`}
const RM=[['鯊魚（大刃切固鎖）','9-60／1-60','避開 0-70、6／7 系列、3-60、80 系列'],['神杖','7-70／6-70／0-70','70 高度配 W 往下壓；9 系列難轉贏'],['左旋','9-60／9-70／0-70','極變轉不贏左旋，換別顆上'],['右旋攻擊','6-60／6-70','6 系列易轉贏右旋；沒有先用 9-60'],['時鐘／鳳凰／鯨魚／天馬','查無','影片沒講（鳳凰靠 7-60 → 怕鯊魚，推斷）']];
function ratchets(){const L=['9-60','9-70','7-70','6-70','0-70','7-60','3-60','1-60','1-50','5-70','2-60'].map(r=>P['ratchet:'+r]).filter(Boolean);
 app.innerHTML=`<h1>固鎖應對教學</h1><p class="muted">主要出處阿土 #10、0~9 全固鎖解析、26 年 4 月天梯（語音轉文字可能聽錯）。</p><h2>遇到 X 換什麼</h2>${RM.map(r=>`<div class="card"><b>遇 ${esc(r[0])}</b> → <b class="ok">${esc(r[1])}</b><br><span class="muted">${esc(r[2])}</span></div>`).join('')}
 <h2>每個固鎖</h2>${L.map(p=>`<a class="card row" style="color:inherit" href="#/part/${encodeURIComponent(p.id)}">${img(p.img)}<span class="grow"><b>${esc(p.name)}</b> ${ownb(p)}<br><span class="ok">利：${esc(p.win||'—')}</span>｜<span class="bad">怕：${esc(p.fears||'—')}</span><br><span class="muted">${esc((p.pros||[]).join('；'))}</span></span></a>`).join('')}
 <div class="warn">0-70 可能自爆；7-60 爆 5～6 次換；1-50 會晃。</div>`}
function guide(){const bars=(a)=>{const m=Math.max(...a.map(x=>x[1]));return a.map(x=>`<div class="row" style="margin:4px 0"><span style="width:56px">${x[0]}</span><span class="grow"><div class="bar2" style="width:${x[1]/m*100}%"></div></span><span class="muted">${x[1]}</span></div>`).join('')};
 app.innerHTML=`<h1>爆擊 & 極變 完全攻略</h1><div class="info">同隊最強：帝王 爆擊 W9-70H ＋ 獨角 極變 P H3-60K，零件全不重複。P 超越刃固定放「平衡」位置。</div>
 ${['main:爆擊','main:極變'].map(id=>{const p=P[id];return `<a class="card row" style="color:inherit" href="#/part/${encodeURIComponent(id)}">${img(p.img)}<span class="grow"><b>${p.name}</b> ${ownb(p)}<br><span class="muted">${esc(p.play||'')}</span></span></a>`}).join('')}
 <h2>爆擊 規格</h2><div class="card"><dl><dt>重量</dt><dd>主刃 32.78g（BeyBase）</dd><dt>官方數值</dt><dd>攻 50／防 10／持 15</dd><dt>形狀</dt><dd>三片刃，刃尖往下打 Smash</dd><dt>鬆緊</dt><dd>模號 A1 鬆、A4 緊（Reddit）</dd></dl></div>
 <h3>爆擊 配置</h3>${[['帝王 爆擊 H9-60K','賽果','WBO 14 冠'],['帝王 爆擊 H9-60LR','賽果','WBO 9 冠，K 被極變用掉時首選'],['天馬 爆擊 H3-60K','賽果','WBO 21 次前段'],['帝王 爆擊 W9-70H','阿銘','3CX 冠軍隊'],['戰神 爆擊 W6-70H','阿土','#10 持久重量版'],['爆擊 W＋WB 軸','推斷','wiki 分析，剋神杖/銀狼/天蠍，無賽果']].map(x=>`<div class="card">${esc(x[0])} ${tag(x[1])}<br><span class="muted">${esc(x[2])}</span></div>`).join('')}
 <h3>爆擊 WBO 固鎖得分</h3><div class="card">${bars([['9-60',594],['3-60',238],['7-60',99],['1-50',98],['1-60',96]])}</div><h3>爆擊 軸心得分</h3><div class="card">${bars([['K',383],['LR',266],['R',185],['Hexa',137],['Level',92]])}</div>
 <h2>極變 規格</h2><div class="card"><dl><dt>重量</dt><dd>金屬戰刃 27.88g；P 3.46g；O 4.43g</dd><dt>形狀</dt><dd>橢圓、底部中空、刻意不平衡；P 切換攻/平/防</dd><dt>鬆緊</dt><dd>越緊越強（阿土）</dd></dl></div>
 <h3>極變 配置</h3>${[['帝王 極變 P H9-60K','賽果','WBO 6 冠'],['獨角 極變 P H3-60K','賽果','WBO 5 冠、首位率 66.7%'],['獨角 極變 P H1-50K','賽果','WBO 4 冠，超低重心'],['戰神 極變 H9-60K','阿銘','9-60 換 7-60「可」、K 換 J「也可」'],['帝王 極變 H9-60 K／Nr／FB','阿土','#27 三種打法'],['戰神 極變 H 9-60Nr／3-60Nr','阿銘','IG；3-60 推鮫鯊黑綠色']].map(x=>`<div class="card">${esc(x[0])} ${tag(x[1])}<br><span class="muted">${esc(x[2])}</span></div>`).join('')}
 <h3>極變 WBO 固鎖得分</h3><div class="card">${bars([['3-60',101],['9-60',94],['1-50',27],['1-60',14],['7-60',5]])}</div><h3>極變 軸心得分</h3><div class="card">${bars([['K',129],['LR',59],['Jolt',14],['R',12],['Orb',10]])}</div>
 <h2>對主流</h2>${[['左旋','極變不利（阿土）'],['鮫鯊 LR／鳳凰／時鐘／飛龍','極變 K 有利（阿土 #27）'],['神杖、銀狼、天蠍','爆擊 W 有利（wiki，推斷）'],['空力天馬、衝擊龍神','爆擊 W 不利（上蓋高）'],['堡壘＋T','爆擊不利（維辰）'],['1-60H 神杖','極變難（阿銘）']].map(x=>`<div class="card"><b>${esc(x[0])}</b>：${esc(x[1])}</div>`).join('')}
 <h2>常見錯誤</h2><div class="card"><ol><li>極變調攻擊模式全力射 → 自爆</li><li>同隊兩顆都用 H 輔助或 K 軸 → 違規</li><li>同隊兩個帝王 → 違規</li><li>紋章沒鎖緊就上場</li><li>一直拆裝把卡榫磨鬆</li><li>用極變打左旋</li></ol></div>
 <div class="src">${srcs(['beydle_b','beydle_d','kamen','atu27','atu10','am_delta','wiki_blast'])}</div>`}
function deck(arg){const cur=(arg||'').split(',').filter(x=>CMAP[x]);while(cur.length<3)cur.push('');
 const opts=v=>`<option value="">— 選配置 —</option>`+CO.map(c=>`<option value="${c.id}" ${c.id===v?'selected':''}>${esc(c.creator)}｜${esc(c.name)}</option>`).join('');
 const used={};cur.filter(Boolean).forEach(i=>CMAP[i].slots.forEach(s=>{const base=s[0].replace(/-.*$/,'').replace(/^(\w+:)(.).*$/,(m,a,b)=>P[s[0]]?.cat==='assist'||P[s[0]]?.cat==='over'?a+P[s[0]].code:m);(used[s[0]]=used[s[0]]||[]).push(CMAP[i].name)}));
 const dup=Object.entries(used).filter(([k,v])=>v.length>1);const metal=['chip:帝王','chip:戰神'];
 app.innerHTML=`<h1>組隊重複檢查</h1><p class="muted">一隊 3 顆，鎖片、主刃、超越刃、輔助刃、固鎖、軸心都不能重複。帝王、戰神各限 1 個（阿銘；網友有異議，看比賽規則）。</p>
 ${cur.map((v,i)=>`<div class="card"><b>第 ${i+1} 顆</b><br><select data-i="${i}" style="width:100%">${opts(v)}</select>${v?`<div class="row" style="margin-top:6px;flex-wrap:wrap">${CMAP[v].slots.map(s=>`<a href="#/part/${encodeURIComponent(s[0])}" class="b ${used[s[0]].length>1?'no':'own'}">${esc(pname(s[0]))}</a>`).join('')}</div>`:''}</div>`).join('')}
 ${cur.filter(Boolean).length?(dup.length?`<div class="warn">⚠️ 重複：${dup.map(([k,v])=>`${plink(k)}（${v.map(esc).join('、')}）`).join('；')}</div>`:'<div class="info ok">✅ 零件全部不重複</div>'):''}
 ${cur.filter(Boolean).flatMap(i=>CMAP[i].slots.map(s=>s[0])).filter(x=>x==='assist:G').length?'<div class="warn">含 G 輔助：chou 目前沒有（暫不買）</div>':''}
 <h3>你缺的零件</h3><div>${[...new Set(cur.filter(Boolean).flatMap(i=>CMAP[i].slots.map(s=>s[0])))].filter(x=>!P[x]?.own&&!P[x]?.ord).map(x=>plink(x)).join('、')||'<span class="ok">全部有或已下單</span>'}</div>`;
 app.querySelectorAll('select').forEach(s=>s.onchange=()=>{cur[s.dataset.i]=s.value;location.hash='#/deck/'+cur.join(',')})}
function sources(){app.innerHTML=`<h1>來源</h1>${Object.values(S).map(s=>`<a class="card row" style="color:inherit" href="${s[1]}" target="_blank" rel="noopener"><span class="grow"><b>${esc(s[0])}</b><br><span class="muted">${esc(s[1])}</span></span></a>`).join('')}<div class="info">資料更新：${D.built}。阿銘＝影片口述或留言親回；chou轉述＝留言找不到原文；推斷＝沒人實證。</div>`}
function nf(){app.innerHTML='<h1>找不到</h1><a href="#/">回首頁</a>'}
function route(){const h=location.hash.slice(1)||'/';const[path,qs]=h.split('?');const q=new URLSearchParams(qs||'');const[,a,b]=path.split('/');const id=b&&decodeURIComponent(b);
 ({'':home,combos:()=>combos(q),combo:()=>combo(id),part:()=>part(id),parts:()=>parts(q),packs:()=>packs(q),pack:()=>pack(id),spares,ratchets,guide,deck:()=>deck(id),sources}[a||'']||nf)();
 document.querySelectorAll('nav a').forEach(x=>x.classList.toggle('on',x.getAttribute('href')==='#/'+(a||'')||(x.getAttribute('href')==='#/'&&!a)));window.scrollTo(0,0)}
addEventListener('hashchange',route);route();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js'));
