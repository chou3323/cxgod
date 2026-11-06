/* 自訂零件：在 app.js 之前注入，讓圖鑑／搜尋／倉庫／配置都看得到 */
(function(){try{const L=JSON.parse(localStorage.getItem('cx_cparts')||'[]');const D=window.DB;D.wr=D.wr||{parts:{}};
 for(const c of L){D.parts[c.id]={id:c.id,cat:c.cat,code:c.name,name:c.name,en:'自訂',jp:null,img:c.photo||null,btype:null,desc:c.note||'',packs:[],plist:c.src?[{code:c.src,name:'自訂來源',brand:'自訂',release:null,w:c.g??null,kid:null}]:[],custom:1,spec:{stats:c.stats||null,official_g:c.g??null}};
  D.wr.parts[c.id]=c.g!=null?{n:1,samples:[{g:c.g,note:'我的實測（自訂零件）',src:''}],ref:null,mine:[],level:'自訂',min:c.g,max:c.g,med:c.g,typ:[c.g,c.g],top:null}:{level:'無資料',n:0,samples:[],mine:[]}}
}catch(e){console.warn(e)}})();
