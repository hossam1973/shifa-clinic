(function(){
const {CALC_CATS,CALCS,computeCalc}=window.ShifaCalcs;
const ICONS={
 dashboard:'<path d="M3 13h8V3H3zm10 8h8V11h-8zM3 21h8v-6H3zm10-18v6h8V3z"/>',
 patients:'<path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.3 0-7 1.2-7 3.5V19h7v-2.5c0-.9.4-1.9 1.3-2.7A10 10 0 0 0 8 13zm8 0c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/>',
 appointments:'<path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14zM7 11h5v5H7z"/>',
 rx:'<path d="M4 3h7a4 4 0 0 1 1 7.9l3 3.6 2.6-3.1 1.5 1.3-2.8 3.3 3.1 3.7-1.5 1.3-3-3.5-3 3.5-1.5-1.3 3.1-3.7L9.8 11H6v8H4zm2 2v4h5a2 2 0 0 0 0-4z"/>',
 billing:'<path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H4v-6h16zm0-10H4V6h16z"/>',
 calc:'<path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v4h10V4zm1 7v2h2v-2zm4 0v2h2v-2zm4 0v6h2v-6zm-8 4v2h2v-2zm4 0v2h2v-2z"/>',
 settings:'<path d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7 7 0 0 0-1.7-1L15 3h-4l-.4 2.7a7 7 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.2 1.6 2 3.5 2.5-1a7 7 0 0 0 1.7 1L11 21h4l.4-2.7a7 7 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5A3.5 3.5 0 1 1 16.5 12 3.5 3.5 0 0 1 13 15.5z"/>'
};
const NAV=[['dashboard','الرئيسية'],['patients','المرضى'],['appointments','المواعيد'],['rx','الوصفات'],['calc','الحاسبات'],['billing','الفواتير'],['settings','الإعدادات']];
const icon=k=>`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${ICONS[k]}</svg>`;
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const addDays=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const TODAY=iso(new Date());
const fmtDate=s=>{try{return new Date(s+'T00:00').toLocaleDateString('ar-EG',{weekday:'short',day:'numeric',month:'short'})}catch(e){return s}};
const fmtLong=s=>{try{return new Date(s+'T00:00').toLocaleDateString('ar-EG',{day:'numeric',month:'long',year:'numeric'})}catch(e){return s}};
const money=n=>Number(n||0).toLocaleString('ar-EG')+' '+(S.settings.currency||'ج.م');
const ageOf=b=>{if(!b)return'';const d=new Date(b),n=new Date();let a=n.getFullYear()-d.getFullYear();if(n<new Date(n.getFullYear(),d.getMonth(),d.getDate()))a--;return a};

/* ---------- storage ---------- */
const KEY='shifa-clinic-v1';
function seed(){
  const P=[
    {id:'p1',name:'أحمد محمود السيد',gender:'ذكر',birth:'1968-04-12',phone:'01001234567',blood:'A+',allergies:['البنسلين'],chronic:['سكري نوع 2','ضغط مرتفع'],notes:'يتابع كل شهر لضبط السكر.',
      visits:[{date:addDays(-30),complaint:'متابعة سكر',diagnosis:'سكري غير منضبط',bp:'145/92',pulse:84,temp:36.8,weight:91,sugar:212},{date:addDays(-2),complaint:'متابعة سكر وضغط',diagnosis:'تحسن ملحوظ',bp:'132/85',pulse:78,temp:36.7,weight:89,sugar:156}]},
    {id:'p2',name:'فاطمة علي حسن',gender:'أنثى',birth:'1991-09-03',phone:'01112345678',blood:'O+',allergies:[],chronic:['ربو'],notes:'',
      visits:[{date:addDays(-12),complaint:'ضيق تنفس ليلي',diagnosis:'نوبة ربو خفيفة',bp:'118/76',pulse:92,temp:37.1,weight:63,sugar:''}]},
    {id:'p3',name:'يوسف خالد إبراهيم',gender:'ذكر',birth:'2017-02-20',phone:'01223456789',blood:'B+',allergies:['السلفا'],chronic:[],notes:'طفل — الحضور مع ولي الأمر.',
      visits:[{date:addDays(-5),complaint:'حرارة وسعال',diagnosis:'التهاب لوزتين',bp:'',pulse:110,temp:38.6,weight:24,sugar:''}]},
    {id:'p4',name:'منى عبد الرحمن',gender:'أنثى',birth:'1979-11-30',phone:'01556789012',blood:'AB-',allergies:[],chronic:['قصور الغدة الدرقية'],notes:'',visits:[]},
    {id:'p5',name:'كريم مصطفى نور',gender:'ذكر',birth:'1985-06-15',phone:'01098765432',blood:'O-',allergies:['الأسبرين'],chronic:[],notes:'',visits:[]},
    {id:'p6',name:'سارة إسماعيل',gender:'أنثى',birth:'2000-01-08',phone:'01187654321',blood:'A-',allergies:[],chronic:[],notes:'',visits:[]}
  ];
  const A=[
    {id:uid(),pid:'p1',date:TODAY,time:'09:30',type:'متابعة',status:'done'},
    {id:uid(),pid:'p3',date:TODAY,time:'10:15',type:'كشف',status:'waiting'},
    {id:uid(),pid:'p4',date:TODAY,time:'11:00',type:'كشف',status:'booked'},
    {id:uid(),pid:'p2',date:TODAY,time:'12:30',type:'استشارة',status:'booked'},
    {id:uid(),pid:'p6',date:TODAY,time:'13:15',type:'كشف',status:'cancelled'},
    {id:uid(),pid:'p5',date:addDays(1),time:'10:00',type:'كشف',status:'booked'},
    {id:uid(),pid:'p2',date:addDays(2),time:'11:30',type:'متابعة',status:'booked'},
    {id:uid(),pid:'p1',date:addDays(28),time:'09:30',type:'متابعة',status:'booked'}
  ];
  for(let i=-6;i<0;i++){const n=[3,5,4,6,2,5][i+6];for(let j=0;j<n;j++)A.push({id:uid(),pid:P[j%6].id,date:addDays(i),time:pad(9+j)+':00',type:j%2?'متابعة':'كشف',status:'done'})}
  const R=[
    {id:'rx1',pid:'p1',date:addDays(-2),dx:'سكري نوع 2 + ضغط مرتفع',items:[{drug:'Metformin 1000mg',dose:'قرص',freq:'مرتين يومياً',dur:'30 يوم'},{drug:'Amlodipine 5mg',dose:'قرص',freq:'مرة صباحاً',dur:'30 يوم'}],notes:'تقليل السكريات والملح، مشي 30 دقيقة يومياً.'},
    {id:'rx2',pid:'p3',date:addDays(-5),dx:'التهاب لوزتين',items:[{drug:'Amoxicillin 250mg/5ml',dose:'5 مل',freq:'كل 8 ساعات',dur:'7 أيام'},{drug:'Paracetamol 120mg/5ml',dose:'10 مل',freq:'عند اللزوم',dur:'5 أيام'}],notes:'سوائل دافئة وراحة.'}
  ];
  const I=[
    {id:'INV-1042',pid:'p1',date:addDays(-2),desc:'متابعة',amount:250,status:'paid'},
    {id:'INV-1043',pid:'p3',date:addDays(-5),desc:'كشف',amount:400,status:'paid'},
    {id:'INV-1044',pid:'p2',date:addDays(-12),desc:'كشف + جلسة نيبولايزر',amount:550,status:'unpaid'},
    {id:'INV-1045',pid:'p1',date:TODAY,desc:'متابعة + تحليل سكر تراكمي',amount:450,status:'unpaid'}
  ];
  return {sample:true,settings:{doctor:'د. ليلى منصور',spec:'باطنة وأمراض مزمنة',clinic:'عيادة شفاء',address:'القاهرة — مدينة نصر، شارع عباس العقاد',phone:'0222223333',fee:400,follow:250,currency:'ج.م'},patients:P,appts:A,rxs:R,invoices:I};
}
let S;
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!S.patients)S=seed();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const P=id=>S.patients.find(p=>p.id===id)||{name:'مريض محذوف',phone:''};

/* ---------- ui helpers ---------- */
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(t._t);t._t=setTimeout(()=>t.hidden=true,2200)}
const STATUS={booked:['محجوز','p-info'],waiting:['في الانتظار','p-warn'],inside:['داخل الكشف','p-ok'],done:['تم','p-mute'],cancelled:['ملغي','p-bad']};
const pill=s=>`<span class="pill ${STATUS[s][1]}">${STATUS[s][0]}</span>`;
function modal(title,html,onSubmit,afterRender){
  const r=$('#modalRoot');
  r.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet"><header><h2>${esc(title)}</h2><button class="btn ghost sm" data-close aria-label="إغلاق">✕</button></header><form id="mform">${html}<div class="actions"><button class="btn primary" type="submit">حفظ</button><button class="btn" type="button" data-close>إلغاء</button></div></form></div></div>`;
  r.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);
  r.querySelector('.modal').addEventListener('click',e=>{if(e.target.classList.contains('modal'))close()});
  const f=$('#mform');
  f.addEventListener('submit',e=>{e.preventDefault();if(onSubmit(new FormData(f),f)!==false)close()});
  afterRender&&afterRender(f);
  setTimeout(()=>{const i=f.querySelector('input,select,textarea');i&&i.focus()},30);
  function close(){r.innerHTML=''}
}
const patientOptions=sel=>S.patients.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${esc(p.name)}</option>`).join('');

/* ---------- forms ---------- */
function patientForm(p){
  p=p||{};
  modal(p.id?'تعديل بيانات المريض':'مريض جديد',`
   <label class="f full">الاسم الكامل<input id="f-name" name="name" required value="${esc(p.name)}"></label>
   <label class="f">النوع<select id="f-gender" name="gender"><option ${p.gender==='ذكر'?'selected':''}>ذكر</option><option ${p.gender==='أنثى'?'selected':''}>أنثى</option></select></label>
   <label class="f">تاريخ الميلاد<input id="f-birth" type="date" name="birth" value="${esc(p.birth)}"></label>
   <label class="f">رقم الهاتف<input id="f-phone" name="phone" inputmode="tel" value="${esc(p.phone)}"></label>
   <label class="f">فصيلة الدم<select id="f-blood" name="blood">${['','A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=>`<option ${p.blood===b?'selected':''}>${b}</option>`).join('')}</select></label>
   <label class="f full">الحساسية (افصل بفاصلة)<input id="f-all" name="allergies" value="${esc((p.allergies||[]).join('، '))}"></label>
   <label class="f full">الأمراض المزمنة (افصل بفاصلة)<input id="f-chr" name="chronic" value="${esc((p.chronic||[]).join('، '))}"></label>
   <label class="f full">ملاحظات<textarea id="f-notes" name="notes">${esc(p.notes)}</textarea></label>`,
  fd=>{
    const split=v=>v.split(/[,،]/).map(s=>s.trim()).filter(Boolean);
    const d={name:fd.get('name').trim(),gender:fd.get('gender'),birth:fd.get('birth'),phone:fd.get('phone').trim(),blood:fd.get('blood'),allergies:split(fd.get('allergies')),chronic:split(fd.get('chronic')),notes:fd.get('notes')};
    if(p.id){Object.assign(p,d);toast('تم حفظ بيانات المريض')}else{const n={id:uid(),visits:[],...d};S.patients.unshift(n);toast('تمت إضافة المريض');location.hash='patient-'+n.id}
    save();render();
  });
}
function apptForm(pre){
  pre=pre||{};
  if(!S.patients.length){toast('أضف مريضاً أولاً');return}
  modal('حجز موعد',`
   <label class="f full">المريض<select id="a-pid" name="pid">${patientOptions(pre.pid)}</select></label>
   <label class="f">التاريخ<input id="a-date" type="date" name="date" required value="${pre.date||TODAY}"></label>
   <label class="f">الوقت<input id="a-time" type="time" name="time" required value="${pre.time||'10:00'}"></label>
   <label class="f full">نوع الزيارة<select id="a-type" name="type"><option>كشف</option><option>متابعة</option><option>استشارة</option><option>إجراء</option></select></label>`,
  fd=>{
    const d=fd.get('date'),t=fd.get('time');
    if(S.appts.some(a=>a.date===d&&a.time===t&&a.status!=='cancelled')){toast('هذا الموعد محجوز بالفعل، اختر وقتاً آخر');return false}
    S.appts.push({id:uid(),pid:fd.get('pid'),date:d,time:t,type:fd.get('type'),status:'booked'});save();render();toast('تم حجز الموعد');
  });
}
function visitForm(p){
  modal('تسجيل زيارة — '+p.name,`
   <label class="f">التاريخ<input id="v-date" type="date" name="date" value="${TODAY}"></label>
   <label class="f">الشكوى<input id="v-c" name="complaint" required></label>
   <label class="f">الضغط (mmHg)<input id="v-bp" name="bp" placeholder="120/80"></label>
   <label class="f">النبض (/د)<input id="v-p" name="pulse" inputmode="numeric"></label>
   <label class="f">الحرارة (°م)<input id="v-t" name="temp" inputmode="decimal"></label>
   <label class="f">الوزن (كجم)<input id="v-w" name="weight" inputmode="decimal"></label>
   <label class="f">سكر عشوائي (mg/dL)<input id="v-s" name="sugar" inputmode="numeric"></label>
   <label class="f full">التشخيص<textarea id="v-dx" name="diagnosis"></textarea></label>`,
  fd=>{const v=Object.fromEntries(fd.entries());p.visits.push(v);p.visits.sort((a,b)=>a.date.localeCompare(b.date));
    const a=S.appts.find(x=>x.pid===p.id&&x.date===v.date&&x.status!=='cancelled');if(a)a.status='done';
    save();render();toast('تم تسجيل الزيارة')});
}
function rxForm(pid){
  if(!S.patients.length){toast('أضف مريضاً أولاً');return}
  const row=(i)=>`<div class="drugrow"><input id="d${i}" name="drug" placeholder="اسم الدواء والتركيز" aria-label="الدواء"><input id="o${i}" name="dose" placeholder="الجرعة" aria-label="الجرعة"><input id="q${i}" name="freq" placeholder="التكرار" aria-label="التكرار"><input id="u${i}" name="dur" placeholder="المدة" aria-label="المدة"><button type="button" class="btn ghost sm" data-rm aria-label="حذف السطر">✕</button></div>`;
  let n=0;
  modal('وصفة طبية جديدة',`
   <label class="f full">المريض<select id="r-pid" name="pid">${patientOptions(pid)}</select></label>
   <label class="f full">التشخيص<input id="r-dx" name="dx"></label>
   <div class="full note" style="font-weight:600">الأدوية</div>
   <div class="full" id="drugs" style="display:grid;gap:8px">${row(n++)}${row(n++)}</div>
   <div class="full"><button type="button" class="btn sm" id="addDrug">+ إضافة دواء</button></div>
   <div class="full" id="allergyWarn"></div>
   <label class="f full">تعليمات للمريض<textarea id="r-notes" name="notes"></textarea></label>`,
  fd=>{
    const dr=fd.getAll('drug'),ds=fd.getAll('dose'),fq=fd.getAll('freq'),du=fd.getAll('dur');
    const items=dr.map((d,i)=>({drug:d.trim(),dose:ds[i],freq:fq[i],dur:du[i]})).filter(x=>x.drug);
    if(!items.length){toast('أضف دواءً واحداً على الأقل');return false}
    const r={id:'rx'+uid(),pid:fd.get('pid'),date:TODAY,dx:fd.get('dx'),items,notes:fd.get('notes')};
    S.rxs.unshift(r);save();location.hash='rx-'+r.id;render();toast('تم حفظ الوصفة');
  },f=>{
    const box=f.querySelector('#drugs');
    f.querySelector('#addDrug').onclick=()=>{box.insertAdjacentHTML('beforeend',row(n++))};
    box.addEventListener('click',e=>{if(e.target.matches('[data-rm]'))e.target.parentElement.remove()});
    const warn=()=>{const p=P(f.pid.value);f.querySelector('#allergyWarn').innerHTML=(p.allergies&&p.allergies.length)?`<span class="pill p-bad">تنبيه حساسية: ${esc(p.allergies.join('، '))}</span>`:''};
    f.pid.onchange=warn;warn();
  });
}
function invoiceForm(pid){
  if(!S.patients.length){toast('أضف مريضاً أولاً');return}
  modal('فاتورة جديدة',`
   <label class="f full">المريض<select id="i-pid" name="pid">${patientOptions(pid)}</select></label>
   <label class="f">الخدمة<input id="i-desc" name="desc" value="كشف" required></label>
   <label class="f">المبلغ<input id="i-amt" name="amount" inputmode="numeric" value="${S.settings.fee}" required></label>
   <label class="f full">الحالة<select id="i-st" name="status"><option value="unpaid">غير مدفوعة</option><option value="paid">مدفوعة</option></select></label>`,
  fd=>{const max=S.invoices.reduce((m,i)=>Math.max(m,+String(i.id).replace(/\D/g,'')||0),1041);
    S.invoices.unshift({id:'INV-'+(max+1),pid:fd.get('pid'),date:TODAY,desc:fd.get('desc'),amount:+fd.get('amount')||0,status:fd.get('status')});save();render();toast('تم إنشاء الفاتورة')});
}

/* ---------- views ---------- */
function vDashboard(){
  const today=S.appts.filter(a=>a.date===TODAY).sort((a,b)=>a.time.localeCompare(b.time));
  const active=today.filter(a=>a.status!=='cancelled');
  const waiting=today.filter(a=>a.status==='waiting'||a.status==='inside').length;
  const monthKey=TODAY.slice(0,7);
  const income=S.invoices.filter(i=>i.status==='paid'&&i.date.slice(0,7)===monthKey).reduce((s,i)=>s+i.amount,0);
  const unpaid=S.invoices.filter(i=>i.status==='unpaid');
  const days=[];for(let i=-6;i<=0;i++){const d=addDays(i);days.push({d,n:S.appts.filter(a=>a.date===d&&a.status!=='cancelled').length})}
  const mx=Math.max(1,...days.map(x=>x.n));
  const upcoming=S.appts.filter(a=>a.date>TODAY&&a.status==='booked').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,4);
  const h=new Date().getHours();
  return `
  <div class="head"><div><h1>${h<12?'صباح الخير':'مساء الخير'}، ${esc(S.settings.doctor)}</h1><p>${fmtLong(TODAY)} · ${active.length} مواعيد اليوم</p></div>
   <div class="toolbar"><a class="btn" href="#calc">الحاسبات الطبية</a><button class="btn" data-act="newPatient">+ مريض جديد</button><button class="btn primary" data-act="newAppt">+ حجز موعد</button></div></div>
  ${S.sample?`<div class="example">البيانات المعروضة أمثلة توضيحية. يمكنك مسحها والبدء ببيانات عيادتك من صفحة الإعدادات.</div>`:''}
  <div class="stats">
    <div class="stat"><span>مواعيد اليوم</span><b class="num">${active.length}</b><small>${today.filter(a=>a.status==='done').length} تمت · ${waiting} في الانتظار</small></div>
    <div class="stat"><span>إجمالي المرضى</span><b class="num">${S.patients.length}</b><small>ملف طبي لكل مريض</small></div>
    <div class="stat"><span>دخل الشهر (المحصّل)</span><b class="num">${money(income)}</b><small>${new Date().toLocaleDateString('ar-EG',{month:'long'})}</small></div>
    <div class="stat"><span>فواتير غير مدفوعة</span><b class="num" style="color:${unpaid.length?'var(--warn)':'inherit'}">${unpaid.length}</b><small>${money(unpaid.reduce((s,i)=>s+i.amount,0))}</small></div>
  </div>
  <div class="grid2">
    <section class="panel"><header><h2>قائمة اليوم</h2><a class="btn sm" href="#appointments">كل المواعيد</a></header>
      ${today.length?`<ul class="list">${today.map(a=>apptRow(a,true)).join('')}</ul>`:`<div class="empty">لا مواعيد اليوم. احجز موعداً جديداً.</div>`}
    </section>
    <div style="display:flex;flex-direction:column;gap:20px;min-width:0">
      <section class="panel"><header><h2>الزيارات آخر 7 أيام</h2><span class="note num">${days.reduce((s,x)=>s+x.n,0)} زيارة</span></header>
        <div class="body"><div class="bars" role="img" aria-label="عدد الزيارات يومياً">${days.map(x=>`<div class="col ${x.d===TODAY?'today':''}"><em class="num">${x.n}</em><div class="bar" style="height:${Math.max(4,x.n/mx*100)}%"></div><span>${new Date(x.d+'T00:00').toLocaleDateString('ar-EG',{weekday:'short'})}</span></div>`).join('')}</div></div>
      </section>
      <section class="panel"><header><h2>المواعيد القادمة</h2></header>
        ${upcoming.length?`<ul class="list">${upcoming.map(a=>`<li><div class="who"><b>${esc(P(a.pid).name)}</b><small>${fmtDate(a.date)} · <span class="num">${a.time}</span> · ${a.type}</small></div></li>`).join('')}</ul>`:`<div class="empty">لا مواعيد قادمة.</div>`}
      </section>
    </div>
  </div>`;
}
function apptRow(a,actions){
  const p=P(a.pid);
  let btns='';
  if(actions){
    if(a.status==='booked')btns=`<button class="btn sm" data-st="waiting" data-id="${a.id}">وصل</button>`;
    else if(a.status==='waiting')btns=`<button class="btn sm primary" data-st="inside" data-id="${a.id}">أدخِل</button>`;
    else if(a.status==='inside')btns=`<button class="btn sm" data-visit="${a.pid}" data-id="${a.id}">سجّل الزيارة</button>`;
  }
  return `<li><span class="time num">${a.time}</span><div class="who"><b><a href="#patient-${a.pid}" style="color:inherit;text-decoration:none">${esc(p.name)}</a></b><small>${a.type}${p.allergies&&p.allergies.length?' · <span style="color:var(--bad)">حساسية</span>':''}</small></div>${pill(a.status)}${btns}</li>`;
}
let pq='',aFilter='today';
function vPatients(){
  const q=pq.trim();
  const list=S.patients.filter(p=>!q||p.name.includes(q)||(p.phone||'').includes(q));
  return `<div class="head"><div><h1>المرضى</h1><p>${S.patients.length} مريض مسجّل</p></div><button class="btn primary" data-act="newPatient">+ مريض جديد</button></div>
  <div class="toolbar"><input class="search" id="pSearch" type="search" placeholder="ابحث بالاسم أو رقم الهاتف" value="${esc(pq)}" aria-label="بحث"></div>
  <section class="panel"><div class="tablewrap"><table><thead><tr><th>الاسم</th><th>العمر</th><th class="hide-sm">الهاتف</th><th class="hide-sm">فصيلة الدم</th><th>آخر زيارة</th><th>تنبيهات</th></tr></thead><tbody>
  ${list.map(p=>{const lv=p.visits[p.visits.length-1];return `<tr class="click" data-open="${p.id}"><td><b>${esc(p.name)}</b></td><td class="num">${ageOf(p.birth)}</td><td class="num hide-sm" dir="ltr" style="text-align:end">${esc(p.phone)}</td><td class="hide-sm">${esc(p.blood)}</td><td>${lv?fmtDate(lv.date):'<span class="note">لا يوجد</span>'}</td><td>${p.allergies.length?'<span class="pill p-bad">حساسية</span> ':''}${p.chronic.length?'<span class="pill p-warn">مزمن</span>':''}</td></tr>`}).join('')||`<tr><td colspan="6" class="empty">لا نتائج مطابقة لـ "${esc(q)}".</td></tr>`}
  </tbody></table></div></section>`;
}
function vPatient(id){
  const p=S.patients.find(x=>x.id===id);
  if(!p)return `<div class="empty">المريض غير موجود. <a href="#patients">العودة لقائمة المرضى</a></div>`;
  const lv=p.visits[p.visits.length-1]||{};
  const rx=S.rxs.filter(r=>r.pid===id);
  const inv=S.invoices.filter(i=>i.pid===id);
  const next=S.appts.filter(a=>a.pid===id&&a.date>=TODAY&&a.status==='booked').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];
  const bpFlag=lv.bp&&+lv.bp.split('/')[0]>=140, tFlag=+lv.temp>=38, sFlag=+lv.sugar>=200;
  return `<div class="head"><div><a href="#patients" class="note" style="text-decoration:none">→ المرضى</a><h1>${esc(p.name)}</h1><p>${p.gender} · <span class="num">${ageOf(p.birth)}</span> سنة · ملف رقم <span class="num">${esc(p.id.toUpperCase())}</span></p></div>
   <div class="toolbar"><button class="btn" data-edit="${p.id}">تعديل</button><button class="btn" data-appt="${p.id}">حجز موعد</button><button class="btn" data-rx="${p.id}">وصفة</button><button class="btn primary" data-visit="${p.id}">تسجيل زيارة</button></div></div>
  <div class="pfile">
    <div style="display:flex;flex-direction:column;gap:20px">
      <section class="panel"><header><h2>البيانات الأساسية</h2></header><div class="body">
        <dl class="kv" style="margin:0"><dt>الهاتف</dt><dd class="num" dir="ltr" style="text-align:end">${esc(p.phone)||'—'}</dd><dt>تاريخ الميلاد</dt><dd>${p.birth?fmtLong(p.birth):'—'}</dd><dt>فصيلة الدم</dt><dd>${esc(p.blood)||'—'}</dd><dt>الموعد القادم</dt><dd>${next?fmtDate(next.date)+' · '+next.time:'—'}</dd></dl>
      </div></section>
      <section class="panel"><header><h2>تنبيهات طبية</h2></header><div class="body">
        <div class="note">الحساسية</div><div>${p.allergies.length?p.allergies.map(a=>`<span class="tag">${esc(a)}</span>`).join(''):'لا يوجد'}</div>
        <div class="note" style="margin-top:10px">أمراض مزمنة</div><div>${p.chronic.length?p.chronic.map(a=>`<span class="tag c">${esc(a)}</span>`).join(''):'لا يوجد'}</div>
        ${p.notes?`<div class="note" style="margin-top:10px">ملاحظات</div><div>${esc(p.notes)}</div>`:''}
      </div></section>
    </div>
    <div style="display:flex;flex-direction:column;gap:20px;min-width:0">
      <section class="panel"><header><h2>آخر العلامات الحيوية</h2><span class="note">${lv.date?fmtDate(lv.date):'لا توجد زيارات'}</span></header><div class="body"><div class="vitals">
        <div class="vital"><span>الضغط</span><b class="num" style="${bpFlag?'color:var(--bad)':''}">${esc(lv.bp)||'—'}</b><small>mmHg</small></div>
        <div class="vital"><span>النبض</span><b class="num">${esc(lv.pulse)||'—'}</b><small>نبضة/د</small></div>
        <div class="vital"><span>الحرارة</span><b class="num" style="${tFlag?'color:var(--bad)':''}">${esc(lv.temp)||'—'}</b><small>°م</small></div>
        <div class="vital"><span>سكر عشوائي</span><b class="num" style="${sFlag?'color:var(--bad)':''}">${esc(lv.sugar)||'—'}</b><small>mg/dL</small></div>
      </div></div></section>
      <section class="panel"><header><h2>سجل الزيارات</h2><span class="note num">${p.visits.length}</span></header><div class="body">
        ${p.visits.length?`<ul class="timeline">${p.visits.slice().reverse().map(v=>`<li><small>${fmtLong(v.date)}</small><div><b>${esc(v.complaint)}</b></div><div>التشخيص: ${esc(v.diagnosis)||'—'}</div><small class="num">${[v.bp&&'ضغط '+v.bp,v.pulse&&'نبض '+v.pulse,v.temp&&'حرارة '+v.temp,v.weight&&'وزن '+v.weight+' كجم'].filter(Boolean).join(' · ')}</small></li>`).join('')}</ul>`:'<div class="empty">لم تُسجَّل زيارات بعد.</div>'}
      </div></section>
      <section class="panel"><header><h2>الوصفات</h2></header>
        ${rx.length?`<ul class="list">${rx.map(r=>`<li><div class="who"><b>${esc(r.dx)||'وصفة'}</b><small>${fmtDate(r.date)} · ${r.items.length} أدوية</small></div><a class="btn sm" href="#rx-${r.id}">عرض</a></li>`).join('')}</ul>`:'<div class="empty">لا وصفات.</div>'}
      </section>
      <section class="panel"><header><h2>الفواتير</h2></header>
        ${inv.length?`<ul class="list">${inv.map(i=>`<li><div class="who"><b class="num">${i.id}</b><small>${esc(i.desc)} · ${fmtDate(i.date)}</small></div><span class="num">${money(i.amount)}</span><span class="pill ${i.status==='paid'?'p-ok':'p-warn'}">${i.status==='paid'?'مدفوعة':'غير مدفوعة'}</span></li>`).join('')}</ul>`:'<div class="empty">لا فواتير.</div>'}
      </section>
    </div>
  </div>`;
}
function vAppointments(){
  const f={today:a=>a.date===TODAY,upcoming:a=>a.date>TODAY,past:a=>a.date<TODAY,all:()=>true}[aFilter];
  const list=S.appts.filter(f).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  if(aFilter==='past')list.reverse();
  const groups={};list.forEach(a=>(groups[a.date]=groups[a.date]||[]).push(a));
  const labels={today:'اليوم',upcoming:'القادمة',past:'السابقة',all:'الكل'};
  return `<div class="head"><div><h1>المواعيد</h1><p>رسوم الكشف ${money(S.settings.fee)} · المتابعة ${money(S.settings.follow)}</p></div><button class="btn primary" data-act="newAppt">+ حجز موعد</button></div>
  <div class="toolbar"><div class="seg" role="group" aria-label="تصفية">${Object.keys(labels).map(k=>`<button data-af="${k}" aria-pressed="${aFilter===k}">${labels[k]}</button>`).join('')}</div></div>
  ${Object.keys(groups).length?Object.entries(groups).slice(0,30).map(([d,arr])=>`<section class="panel"><header><h2>${fmtLong(d)}</h2><span class="note num">${arr.filter(a=>a.status!=='cancelled').length} موعد</span></header><ul class="list">${arr.map(a=>apptRow(a,d===TODAY).replace('</li>',`${a.status==='booked'?`<button class="btn ghost sm danger" data-st="cancelled" data-id="${a.id}">إلغاء</button>`:''}</li>`)).join('')}</ul></section>`).join(''):`<section class="panel"><div class="empty">لا مواعيد في هذا القسم.</div></section>`}`;
}
function vRx(id){
  if(id){
    const r=S.rxs.find(x=>x.id===id);if(!r)return '<div class="empty">الوصفة غير موجودة.</div>';
    const p=P(r.pid),s=S.settings;
    return `<div class="head"><div><a href="#rx" class="note" style="text-decoration:none">→ الوصفات</a><h1>وصفة طبية</h1></div><div class="toolbar no-print"><button class="btn" data-copyrx="${r.id}">نسخ نص الوصفة</button><button class="btn primary" data-act="print">طباعة</button></div></div>
    <article class="rx">
      <div class="rxhead"><div><h2>${esc(s.doctor)}</h2><small>${esc(s.spec)}</small><small>${esc(s.clinic)} — ${esc(s.address)}</small></div><div style="text-align:end"><small>التاريخ</small><b>${fmtLong(r.date)}</b><small class="num" dir="ltr">${esc(s.phone)}</small></div></div>
      <dl class="kv"><dt>المريض</dt><dd>${esc(p.name)}</dd><dt>العمر</dt><dd class="num">${ageOf(p.birth)} سنة</dd><dt>التشخيص</dt><dd>${esc(r.dx)||'—'}</dd>${p.allergies&&p.allergies.length?`<dt>حساسية</dt><dd style="color:var(--bad)">${esc(p.allergies.join('، '))}</dd>`:''}</dl>
      <div class="rxsym" style="margin:14px 0 4px" dir="ltr">℞</div>
      <div class="tablewrap"><table><thead><tr><th>#</th><th>الدواء</th><th>الجرعة</th><th>التكرار</th><th>المدة</th></tr></thead><tbody>
      ${r.items.map((it,i)=>`<tr><td class="num">${i+1}</td><td><b dir="ltr">${esc(it.drug)}</b></td><td>${esc(it.dose)}</td><td>${esc(it.freq)}</td><td>${esc(it.dur)}</td></tr>`).join('')}</tbody></table></div>
      ${r.notes?`<p style="margin:16px 0 0"><b>تعليمات:</b> ${esc(r.notes)}</p>`:''}
      <p class="note" style="margin:24px 0 0;border-top:1px dashed var(--line);padding-top:10px">توقيع الطبيب: ____________________</p>
    </article>`;
  }
  return `<div class="head"><div><h1>الوصفات الطبية</h1><p>${S.rxs.length} وصفة</p></div><button class="btn primary" data-act="newRx">+ وصفة جديدة</button></div>
  <section class="panel">${S.rxs.length?`<ul class="list">${S.rxs.map(r=>`<li><div class="who"><b>${esc(P(r.pid).name)}</b><small>${esc(r.dx)||'—'} · ${fmtDate(r.date)} · ${r.items.map(i=>esc(i.drug.split(' ')[0])).join('، ')}</small></div><a class="btn sm" href="#rx-${r.id}">عرض</a></li>`).join('')}</ul>`:'<div class="empty">لا وصفات بعد.</div>'}</section>`;
}
function vBilling(){
  const paid=S.invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+i.amount,0);
  const due=S.invoices.filter(i=>i.status==='unpaid').reduce((s,i)=>s+i.amount,0);
  return `<div class="head"><div><h1>الفواتير</h1><p>محصّل ${money(paid)} · مستحق ${money(due)}</p></div><button class="btn primary" data-act="newInv">+ فاتورة جديدة</button></div>
  <section class="panel"><div class="tablewrap"><table><thead><tr><th>رقم الفاتورة</th><th>المريض</th><th>الخدمة</th><th>التاريخ</th><th>المبلغ</th><th>الحالة</th><th></th></tr></thead><tbody>
  ${S.invoices.map(i=>`<tr><td class="num">${i.id}</td><td>${esc(P(i.pid).name)}</td><td>${esc(i.desc)}</td><td>${fmtDate(i.date)}</td><td class="num">${money(i.amount)}</td><td><span class="pill ${i.status==='paid'?'p-ok':'p-warn'}">${i.status==='paid'?'مدفوعة':'غير مدفوعة'}</span></td><td>${i.status==='unpaid'?`<button class="btn sm" data-pay="${i.id}">تسجيل الدفع</button>`:''}</td></tr>`).join('')||'<tr><td colspan="7" class="empty">لا فواتير.</td></tr>'}
  </tbody></table></div></section>`;
}
let confirmReset=false;
function vSettings(){
  const s=S.settings;
  return `<div class="head"><div><h1>الإعدادات</h1><p>بيانات العيادة تظهر في رأس الوصفة الطبية</p></div></div>
  <section class="panel"><header><h2>بيانات العيادة والطبيب</h2></header><div class="body">
   <form id="sform" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
    <label class="f">اسم الطبيب<input id="s-doc" name="doctor" value="${esc(s.doctor)}"></label>
    <label class="f">التخصص<input id="s-spec" name="spec" value="${esc(s.spec)}"></label>
    <label class="f">اسم العيادة<input id="s-clinic" name="clinic" value="${esc(s.clinic)}"></label>
    <label class="f">هاتف العيادة<input id="s-phone" name="phone" value="${esc(s.phone)}"></label>
    <label class="f" style="grid-column:1/-1">العنوان<input id="s-addr" name="address" value="${esc(s.address)}"></label>
    <label class="f">رسوم الكشف<input id="s-fee" name="fee" inputmode="numeric" value="${esc(s.fee)}"></label>
    <label class="f">رسوم المتابعة<input id="s-follow" name="follow" inputmode="numeric" value="${esc(s.follow)}"></label>
    <label class="f">العملة<input id="s-cur" name="currency" value="${esc(s.currency)}"></label>
    <div style="grid-column:1/-1"><button class="btn primary">حفظ الإعدادات</button></div>
   </form></div></section>
  <section class="panel"><header><h2>البيانات</h2></header><div class="body" style="display:flex;flex-direction:column;gap:12px">
    <p class="note" style="margin:0">تُحفظ البيانات على هذا الجهاز وهذا المتصفح فقط. لا تُرسل إلى أي خادم ولا تظهر على أجهزة أخرى. صدّر نسخة احتياطية بانتظام، ويمكنك استيرادها على جهاز آخر.</p>
    <div class="toolbar"><button class="btn" data-act="export">تصدير نسخة احتياطية</button><label class="btn" for="importFile">استيراد نسخة احتياطية</label><input type="file" id="importFile" accept="application/json,.json" hidden></div>
    <div class="toolbar">
      ${confirmReset?`<span>سيتم حذف كل المرضى والمواعيد والوصفات والفواتير.</span><button class="btn danger" data-act="wipe">تأكيد المسح</button><button class="btn" data-act="cancelWipe">تراجع</button>`
      :`<button class="btn danger" data-act="askWipe">مسح كل البيانات والبدء من جديد</button><button class="btn" data-act="reseed">استعادة البيانات التوضيحية</button>`}
    </div></div></section>`;
}

let calcCat='all',calcQ='';const calcVals={};
function calcResult(c){
  const r=computeCalc(c,calcVals[c.id]);
  if(!r)return `<div class="cres empty-r"><b>—</b><span>أدخل القيم المطلوبة لعرض النتيجة.</span></div>`;
  const note=[r.note,c.note&&c.note!==r.note?c.note:''].filter(Boolean);
  return `<div class="cres lv-${r.lvl}"><div class="cnum"><b class="num">${esc(r.v)}</b>${r.max!=null?`<small class="num">/ ${r.max}</small>`:''}${r.unit?`<small>${esc(r.unit)}</small>`:''}</div>
   <span class="pill p-${r.lvl==='ok'?'ok':r.lvl==='warn'?'warn':r.lvl==='bad'?'bad':'info'}">${esc(r.label)}</span>
   ${r.rows?`<dl class="kv crow">${r.rows.map(x=>`<dt>${esc(x[0])}</dt><dd class="num">${esc(x[1])}</dd>`).join('')}</dl>`:''}
   ${note.map(n=>`<p class="cnote">${esc(n)}</p>`).join('')}</div>`;
}
function calcInputs(c){
  const st=calcVals[c.id]||{};
  return c.inputs.map(i=>{const fid=`c-${c.id}-${i.id}`;
    if(i.t==='n')return `<label class="f" for="${fid}"><span>${esc(i.label)}${i.unit?` <span class="unit">(${esc(i.unit)})</span>`:''}</span><input id="${fid}" data-ci="${i.id}" inputmode="decimal" autocomplete="off" placeholder="${esc(i.ph)}" value="${esc(st[i.id]??'')}"></label>`;
    if(i.t==='s')return `<label class="f" for="${fid}">${esc(i.label)}<select id="${fid}" data-ci="${i.id}">${i.opts.map((o,k)=>`<option value="${k}" ${String(st[i.id]??0)===String(k)?'selected':''}>${esc(o[0])}${c.calc||o[1]===0?'':` (+${o[1]})`}</option>`).join('')}</select></label>`;
    return `<label class="chk" for="${fid}"><input type="checkbox" id="${fid}" data-ci="${i.id}" ${st[i.id]?'checked':''}><span>${esc(i.label)}</span><em class="num">+${i.pts}</em></label>`;
  }).join('');
}
function vCalc(id){
  const c=id&&CALCS.find(x=>x.id===id);
  const counts={};CALCS.forEach(x=>counts[x.cat]=(counts[x.cat]||0)+1);
  const q=calcQ.trim().toLowerCase();
  const list=CALCS.filter(x=>(calcCat==='all'||x.cat===calcCat)&&(!q||(x.name+' '+x.ar+' '+CALC_CATS[x.cat]).toLowerCase().includes(q)));
  const chips=`<div class="chips" role="group" aria-label="التخصصات"><button data-cc="all" aria-pressed="${calcCat==='all'}">الكل <span class="num">${CALCS.length}</span></button>${Object.keys(CALC_CATS).filter(k=>counts[k]).map(k=>`<button data-cc="${k}" aria-pressed="${calcCat===k}">${CALC_CATS[k]} <span class="num">${counts[k]}</span></button>`).join('')}</div>`;
  const listHtml=`<ul class="list clist">${list.map(x=>`<li ${c&&c.id===x.id?'class="sel"':''}><a href="#calc-${x.id}"><b dir="auto">${esc(x.name)}</b><small>${esc(x.ar)}</small></a><span class="pill p-mute">${CALC_CATS[x.cat]}</span></li>`).join('')||`<li class="empty">لا حاسبة مطابقة لـ "${esc(calcQ)}".</li>`}</ul>`;
  const detail=c?`<section class="panel cdetail" id="cdetail"><header><div style="min-width:0"><span class="note">${CALC_CATS[c.cat]}</span><h2 dir="auto">${esc(c.name)}</h2><p class="note" style="margin:0">${esc(c.ar)}</p></div><button class="btn sm" data-creset="${c.id}">مسح</button></header>
     <div class="body cgrid"><form class="cform" id="cform" data-cid="${c.id}" onsubmit="return false">${calcInputs(c)}</form><div id="cout" aria-live="polite">${calcResult(c)}</div></div>
     <footer class="cref">المرجع: <span dir="ltr">${esc(c.ref)}</span></footer></section>`
    :`<section class="panel cdetail cintro"><div class="body"><h2>اختر حاسبة</h2><p class="note">${CALCS.length} حاسبة سريرية في ${Object.keys(counts).length} تخصصات. النتيجة تُحسب فوراً أثناء الإدخال، مع التفسير والمرجع العلمي لكل حاسبة.</p></div></section>`;
  return `<div class="head"><div>${c?'<a href="#calc" class="note back-sm" style="text-decoration:none">→ كل الحاسبات</a>':''}<h1>الحاسبات الطبية</h1><p>أداة مساعدة لاتخاذ القرار ولا تغني عن التقييم السريري</p></div></div>
  <div class="toolbar"><input class="search" id="cSearch" type="search" placeholder="ابحث: SOFA، الكلى، صوديوم…" value="${esc(calcQ)}" aria-label="بحث في الحاسبات"></div>
  ${chips}
  <div class="clayout ${c?'has-sel':''}"><section class="panel cside">${listHtml}</section>${detail}</div>`;
}
function bindCalc(){
  const f=document.getElementById('cform');
  if(f){const c=CALCS.find(x=>x.id===f.dataset.cid);
    const upd=e=>{const el=e.target;if(!el.dataset.ci)return;const st=calcVals[c.id]=calcVals[c.id]||{};st[el.dataset.ci]=el.type==='checkbox'?el.checked:el.value;document.getElementById('cout').innerHTML=calcResult(c)};
    f.addEventListener('input',upd);f.addEventListener('change',upd);}
  const s=document.getElementById('cSearch');
  if(s)s.oninput=e=>{calcQ=e.target.value;const pos=e.target.selectionStart;render();const n=document.getElementById('cSearch');n.focus();n.setSelectionRange(pos,pos)};
}

/* ---------- router ---------- */
function route(){const h=(location.hash||'#dashboard').slice(1);return h}
function render(){
  const h=route();
  const base=h.startsWith('patient-')?'patients':h.startsWith('rx')?'rx':h.startsWith('calc')?'calc':h;
  const navHtml=NAV.map(([k,l])=>`<a class="nav" href="#${k}" ${base===k?'aria-current="page"':''}>${icon(k)}<span>${l}</span></a>`).join('');
  $('#railnav').innerHTML=navHtml;
  $('#tabbar').innerHTML=NAV.filter(n=>!['settings','billing','rx'].includes(n[0])).concat([['settings','المزيد']]).map(([k,l])=>`<a class="nav" href="#${k}" ${base===k||(k==='settings'&&(base==='billing'||base==='rx'))?'aria-current="page"':''}>${icon(k)}<span>${l}</span></a>`).join('');
  $('#docName').textContent=S.settings.doctor;$('#docSpec').textContent=S.settings.spec;$('#docAv').textContent=(S.settings.doctor.replace('د.','').trim()[0]||'د');
  let html;
  if(h.startsWith('patient-'))html=vPatient(h.slice(8));
  else if(h.startsWith('rx-'))html=vRx(h.slice(3));
  else if(h.startsWith('calc-'))html=vCalc(h.slice(5));
  else html=({dashboard:vDashboard,patients:vPatients,appointments:vAppointments,rx:()=>vRx(),billing:vBilling,calc:()=>vCalc(),settings:()=>vSettings()+`<div class="toolbar"><a class="btn" href="#billing">الفواتير</a><a class="btn" href="#rx">الوصفات</a></div>`}[h]||vDashboard)();
  $('#view').innerHTML=html;
  const ps=$('#pSearch');if(ps){ps.oninput=e=>{pq=e.target.value;const pos=e.target.selectionStart;render();const n=$('#pSearch');n.focus();n.setSelectionRange(pos,pos)}}
  bindCalc();
  const sf=$('#sform');if(sf)sf.onsubmit=e=>{e.preventDefault();const fd=new FormData(sf);for(const[k,v]of fd.entries())S.settings[k]=(k==='fee'||k==='follow')?+v||0:v;save();render();toast('تم حفظ الإعدادات')};
}
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act],[data-open],[data-st],[data-visit],[data-edit],[data-appt],[data-rx],[data-pay],[data-af],[data-copyrx],[data-cc],[data-creset]');
  if(!t)return;
  const d=t.dataset;
  if(d.open){location.hash='patient-'+d.open;return}
  if(d.af){aFilter=d.af;render();return}
  if(d.cc){calcCat=d.cc;render();return}
  if(d.creset){delete calcVals[d.creset];render();return}
  if(d.st){const a=S.appts.find(x=>x.id===d.id);a.status=d.st;save();render();toast(STATUS[d.st][0]);return}
  if(d.visit){const p=S.patients.find(x=>x.id===d.visit);if(d.id){const a=S.appts.find(x=>x.id===d.id);a&&(a.status='done');save()}visitForm(p);return}
  if(d.edit){patientForm(S.patients.find(x=>x.id===d.edit));return}
  if(d.appt){apptForm({pid:d.appt});return}
  if(d.rx){rxForm(d.rx);return}
  if(d.pay){S.invoices.find(i=>i.id===d.pay).status='paid';save();render();toast('تم تسجيل الدفع');return}
  if(d.copyrx){const r=S.rxs.find(x=>x.id===d.copyrx),p=P(r.pid);const txt=`${S.settings.doctor} — ${S.settings.clinic}\nالمريض: ${p.name}\nالتاريخ: ${fmtLong(r.date)}\nالتشخيص: ${r.dx}\n\n`+r.items.map((i,n)=>`${n+1}. ${i.drug} — ${i.dose} — ${i.freq} — ${i.dur}`).join('\n')+(r.notes?`\n\nتعليمات: ${r.notes}`:'');
    try{navigator.clipboard.writeText(txt).then(()=>toast('تم نسخ الوصفة'),()=>toast('تعذّر النسخ، حدّد النص يدوياً'))}catch(err){toast('تعذّر النسخ، حدّد النص يدوياً')}return}
  switch(d.act){
    case'newPatient':patientForm();break;
    case'newAppt':apptForm();break;
    case'newRx':rxForm();break;
    case'newInv':invoiceForm();break;
    case'askWipe':confirmReset=true;render();break;
    case'cancelWipe':confirmReset=false;render();break;
    case'wipe':{const st=S.settings;S={sample:false,settings:st,patients:[],appts:[],rxs:[],invoices:[]};confirmReset=false;save();render();toast('تم مسح البيانات');break}
    case'print':window.print();break;
    case'export':{try{const blob=new Blob([JSON.stringify({app:'shifa',version:1,exported:new Date().toISOString(),data:S},null,2)],{type:'application/json'});
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='shifa-backup-'+TODAY+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('تم تصدير النسخة الاحتياطية')}catch(err){toast('تعذّر التصدير في هذا المتصفح')}break}
    case'reseed':S=seed();save();render();toast('تمت استعادة البيانات التوضيحية');break;
  }
});
document.addEventListener('change',e=>{
  if(e.target.id!=='importFile'||!e.target.files[0])return;
  const fr=new FileReader();
  fr.onload=()=>{try{const j=JSON.parse(fr.result),d=j&&j.app==='shifa'?j.data:j;
      if(!d||!Array.isArray(d.patients)||!Array.isArray(d.appts)||!d.settings)throw new Error('bad');
      d.rxs=d.rxs||[];d.invoices=d.invoices||[];S=d;save();render();toast('تم استيراد '+S.patients.length+' مريض')}
    catch(err){toast('الملف ليس نسخة احتياطية صالحة من شفاء')}};
  fr.readAsText(e.target.files[0]);e.target.value='';
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#modalRoot').innerHTML=''});
render();
})();
