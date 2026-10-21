import {ConvexError} from 'convex/values';
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ConvexReactClient,useQuery,useMutation,useConvexAuth} from 'convex/react';
import {ConvexAuthProvider,useAuthActions} from '@convex-dev/auth/react';
import {anyApi} from 'convex/server';
import {LayoutDashboard,Newspaper,ShoppingBag,Video,Radio,Users,CalendarDays,Settings,GraduationCap,Plus,Search,LogOut,Save,Upload,Eye,EyeOff,CheckCircle,AlertCircle,X} from 'lucide-react';
import './style.css';
import {RequestsPanel} from './RequestsPanel';
const api=anyApi;
type Section='products'|'news'|'media'|'stream'|'matches'|'players'|'academy'|'settings'|'standings';
type Field={key:string;label:string;type?:'number'|'textarea'|'select'|'url';options?:string[]};
const sections:Array<{id:Section;label:string;icon:any;description:string;fields:Field[]}>= [
 {id:'products',label:'المتجر والأسعار',icon:ShoppingBag,description:'المنتجات والصور والأسعار بالدينار العراقي',fields:[{key:'price',label:'السعر — د.ع',type:'number'},{key:'category',label:'التصنيف',type:'select',options:['jerseys','training','accessories']},{key:'image',label:'رابط صورة المنتج',type:'url'}]},
 {id:'news',label:'الأخبار',icon:Newspaper,description:'أخبار النادي والتقارير والتصريحات',fields:[{key:'category',label:'التصنيف',type:'select',options:['أخبار','تقارير','تصريحات','صور','فيديو']},{key:'date',label:'التاريخ'},{key:'image',label:'رابط الصورة',type:'url'},{key:'content',label:'نص الخبر',type:'textarea'}]},
 {id:'media',label:'الصور والفيديو',icon:Video,description:'ارفع صورة أو فيديو، أو أضف رابط فيديو',fields:[{key:'type',label:'نوع الوسائط',type:'select',options:['photo','video']},{key:'category',label:'التصنيف',type:'select',options:['matches','training','backstage']},{key:'imgSrc',label:'رابط الصورة أو غلاف الفيديو',type:'url'},{key:'url',label:'رابط الفيديو أو YouTube',type:'url'},{key:'description',label:'الوصف',type:'textarea'}]},
 {id:'stream',label:'البث',icon:Radio,description:'رابط بث YouTube أو فيديو مسجل. المصدر الأول المنشور يظهر في التطبيق.',fields:[{key:'url',label:'رابط البث أو الفيديو',type:'url'},{key:'description',label:'وصف البث',type:'textarea'}]},
 {id:'players',label:'اللاعبون',icon:Users,description:'بيانات وصور لاعبي الفريق الأول',fields:[{key:'number',label:'رقم القميص',type:'number'},{key:'position',label:'المركز',type:'select',options:['حراس','دفاع','وسط','هجوم']},{key:'posName',label:'وصف المركز'},{key:'nationality',label:'الجنسية'},{key:'age',label:'العمر',type:'number'},{key:'height',label:'الطول'},{key:'matches',label:'عدد المباريات',type:'number'},{key:'goals',label:'الأهداف',type:'number'},{key:'imgUrl',label:'رابط الصورة',type:'url'}]},
 {id:'matches',label:'المباريات',icon:CalendarDays,description:'جدول المباريات والنتائج وأسعار التذاكر',fields:[{key:'opponent',label:'الفريق المنافس'},{key:'competition',label:'البطولة'},{key:'stadium',label:'الملعب'},{key:'date',label:'التاريخ'},{key:'time',label:'الوقت'},{key:'status',label:'الحالة',type:'select',options:['upcoming','live','finished']},{key:'ticketPrice',label:'سعر التذكرة',type:'number'}]},
 {id:'academy',label:'الأكاديمية',icon:GraduationCap,description:'الإعلانات والبرامج والفئات العمرية للأكاديمية',fields:[{key:'category',label:'الفئة العمرية'},{key:'image',label:'رابط الصورة',type:'url'},{key:'description',label:'تفاصيل البرنامج',type:'textarea'}]},
 {id:'standings',label:'ترتيب الدوري',icon:CalendarDays,description:'ترتيب الفرق ونقاط البطولة',fields:[{key:'p',label:'لعب',type:'number'},{key:'w',label:'فاز',type:'number'},{key:'d',label:'تعادل',type:'number'},{key:'l',label:'خسر',type:'number'},{key:'pts',label:'النقاط',type:'number'}]}, {id:'settings',label:'بيانات النادي',icon:Settings,description:'اسم النادي ووسائل التواصل والنص الرئيسي',fields:[{key:'subtitle',label:'النص الرئيسي'},{key:'phone',label:'رقم الهاتف'},{key:'email',label:'البريد الإلكتروني'},{key:'address',label:'العنوان'}]},
];
const labels:Record<string,string>={jerseys:'أطقم النادي',training:'التدريبات',accessories:'الإكسسوارات',photo:'صورة',video:'فيديو',matches:'المباريات',backstage:'خلف الكواليس',upcoming:'قادمة',live:'مباشرة',finished:'منتهية'};
function message(error:unknown){return error instanceof ConvexError&&typeof error.data==='string'?error.data:error instanceof Error?error.message:'تعذر إتمام العملية، حاول مرة أخرى';}
function Admin(){
 const {isLoading,isAuthenticated}=useConvexAuth();const {signIn,signOut}=useAuthActions();
 const user=useQuery(api.content.me,isAuthenticated?{}:'skip');
 const authStatus=useQuery(api.content.authStatus,{});
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function login(){setBusy(true);setError('');try{await signIn('google',{redirectTo:location.origin+import.meta.env.BASE_URL});}catch(e){setError(message(e));setBusy(false);}}
 if(isLoading||(isAuthenticated&&user===undefined))return <div className="center"><div className="loader"/>جارٍ التحقق من الحساب…</div>;
 if(!isAuthenticated)return <div className="center"><section className="login"><img src={`${import.meta.env.BASE_URL}rajaa-logo.png`} alt="نادي الرجاء العراقي"/><span className="eyebrow">لوحة الإدارة</span><h1>نادي الرجاء العراقي</h1><p>أدر المحتوى، الأسعار، الصور والبث من مكان واحد.</p><button className="primary" disabled={busy||!authStatus?.googleReady} onClick={login}>{busy?'جاري الانتقال…':'المتابعة باستخدام Google'}</button>{error&&<p role="alert" className="error">{error}</p>}{authStatus&&!authStatus.googleReady&&<p className="notice">تسجيل Google قيد التجهيز. ستتاح اللوحة بعد إكمال إعداد الحساب.</p>}<small>الدخول مخصص لحساب إدارة النادي المعتمد.</small></section></div>;
 if(!user?.isAdmin)return <div className="center"><section className="login"><AlertCircle/><h1>الحساب غير مخوّل</h1><p>هذا الحساب مسجل، لكنه لا يملك صلاحية إدارة النادي.</p><button onClick={()=>void signOut()}>الخروج واختيار حساب آخر</button></section></div>;
 return <Dashboard user={user} signOut={signOut}/>;
}
function Dashboard({user,signOut}:{user:any;signOut:()=>Promise<void>}){
 const [requestsOpen,setRequestsOpen]=useState(false);
 const [section,setSection]=useState<Section>('products');const [search,setSearch]=useState('');
 const [editing,setEditing]=useState<any|null>(null);const [notice,setNotice]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const current=sections.find(s=>s.id===section)!;const Icon=current.icon;
 const rows=useQuery(api.content.listAdmin,{section});const archive=useMutation(api.content.archive);const initialize=useMutation(api.content.initialize);
 async function seed(){setBusy(true);setError('');try{await initialize({});setNotice('تم استيراد المحتوى الأصلي بنجاح');}catch(e){setError(message(e));}finally{setBusy(false);}}
 async function hide(row:any){setError('');try{await archive({id:row._id});setNotice('تم إخفاء العنصر من التطبيق؛ يمكنك إعادة نشره من التعديل.');}catch(e){setError(message(e));}}
 return <div className="dashboard"><aside><div className="brand"><img src={`${import.meta.env.BASE_URL}rajaa-logo.png`} alt="شعار النادي"/><div><strong>الرجاء العراقي</strong><small>إدارة المحتوى</small></div></div><nav aria-label="أقسام الإدارة">{sections.map(({id,label,icon:TabIcon})=><button key={id} className={id===section?'active':''} onClick={()=>{setSection(id);setSearch('');setError('');setNotice('');}}><TabIcon size={19}/><span>{label}</span></button>)}<button onClick={()=>setRequestsOpen(true)}><Users size={19}/><span>طلبات الجماهير والأكاديمية</span></button></nav><div className="account"><strong>{user.name||'إدارة النادي'}</strong><small dir="ltr">{user.email}</small><button onClick={()=>void signOut()}><LogOut size={16}/>تسجيل الخروج</button></div></aside>
 <main><header className="topbar"><div><span className="eyebrow">مساحة النادي</span><h1><Icon size={26}/>{current.label}</h1><p>{current.description}</p></div><a className="outline" href="https://alrajja28.github.io/alrajja-club/" target="_blank" rel="noreferrer"><Eye size={17}/>عرض التطبيق</a></header>
 <section className="summary"><div><span>عناصر القسم</span><strong>{rows?.length??'—'}</strong></div><div><span>منشورة للجمهور</span><strong>{rows?.filter((r:any)=>r.published).length??'—'}</strong></div><div><span>المسودات</span><strong>{rows?.filter((r:any)=>!r.published).length??'—'}</strong></div></section>
 <div className="toolbar"><label className="search"><Search size={17}/><input aria-label="البحث في المحتوى" placeholder="ابحث بالعنوان…" value={search} onChange={e=>setSearch(e.target.value)}/></label><button className="primary" onClick={()=>setEditing({section,slug:crypto.randomUUID(),title:'',data:{},published:false,sort:rows?.length??0})}><Plus size={18}/>إضافة جديد</button></div>
 {notice&&<p role="status" className="notice"><CheckCircle size={17}/>{notice}</p>}{error&&<p role="alert" className="error">{error}</p>}
 {rows===undefined?<div className="empty">جارٍ تحميل المحتوى…</div>:rows.length===0?<div className="empty"><LayoutDashboard size={34}/><h2>القسم جاهز لمحتواك</h2><p>أضف عنصرًا جديدًا، أو استورد المحتوى الأصلي إذا كانت قاعدة البيانات جديدة بالكامل.</p><button className="outline" onClick={seed} disabled={busy}>استيراد المحتوى الأصلي مرة واحدة</button></div>:<div className="records">{rows.filter((r:any)=>r.title.includes(search)).map((row:any)=><article key={row._id}><div className="record-icon"><Icon size={24}/></div><div className="record-body"><span className={row.published?'status published':'status'}>{row.published?'منشور':'مسودة'}</span><h2>{row.title}</h2><p>{section==='products'?`${Number(row.data.price||0).toLocaleString('ar-IQ')} د.ع`:row.data.description||row.data.posName||row.data.category||'محتوى النادي'}</p><small>آخر تحديث: {new Date(row.updatedAt).toLocaleDateString('ar-IQ')}</small></div><div className="record-actions"><button className="outline" onClick={()=>setEditing(row)}>تعديل</button>{row.published&&<button aria-label={`إخفاء ${row.title}`} onClick={()=>void hide(row)}><EyeOff size={17}/></button>}</div></article>)}</div>}
 <footer>نادي الرجاء العراقي · المحتوى محفوظ في قاعدة النادي</footer></main>
 {requestsOpen&&<RequestsPanel onClose={()=>setRequestsOpen(false)}/>}
 {editing&&<Editor row={editing} definition={current} onClose={()=>setEditing(null)} onSaved={()=>{setEditing(null);setNotice('تم حفظ المحتوى ومزامنته مع التطبيق');}}/>}</div>;
}
function Editor({row,definition,onClose,onSaved}:{row:any;definition:typeof sections[number];onClose:()=>void;onSaved:()=>void}){
 const [title,setTitle]=useState(row.title);const [data,setData]=useState<Record<string,any>>({...row.data});const [published,setPublished]=useState(row.published);const [sort,setSort]=useState(row.sort);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const save=useMutation(api.content.save),uploadUrl=useMutation(api.files.generateUploadUrl),register=useMutation(api.files.register);
 async function upload(file?:File){if(!file)return;setBusy(true);setError('');try{
 const max=file.type.startsWith('video/')?100*1024*1024:8*1024*1024;if(file.size>max)throw Error('الحد الأقصى: الصور 8 ميغابايت، الفيديو 100 ميغابايت');
 if(!['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'].includes(file.type))throw Error('صيغة الملف غير مدعومة');
 const url=await uploadUrl({});const response=await fetch(url,{method:'POST',headers:{'Content-Type':file.type},body:file});if(!response.ok)throw Error('تعذر رفع الملف');
 const {storageId}=await response.json();await register({storageId,filename:file.name});
 setData(prev=>({...prev,storageId,fileMime:file.type,...(definition.id==='media'?{type:file.type.startsWith('video/')?'video':'photo'}:{})}));
 }catch(e){setError(message(e));}finally{setBusy(false);}}
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{
 const normalized=JSON.parse(JSON.stringify(data));if(definition.id==='players')normalized.name=title;if(definition.id==='media'){normalized.alt=title;normalized.badgeType=normalized.type==='video'?'video':'photo';normalized.badgeValue=normalized.badgeValue||'1';}
 await save({...(row._id?{id:row._id}:{}),section:definition.id,slug:row.slug,title,data:normalized,published,sort});onSaved();
 }catch(e){setError(message(e));}finally{setBusy(false);}}
 return <div className="overlay"><section className="editor" role="dialog" aria-modal="true" aria-labelledby="editor-title"><header><div><span className="eyebrow">{definition.label}</span><h2 id="editor-title">{row._id?'تعديل المحتوى':'إضافة محتوى'}</h2></div><button aria-label="إغلاق" onClick={onClose} disabled={busy}><X/></button></header><form onSubmit={submit}>
 <label>العنوان<input required maxLength={300} value={title} onChange={e=>setTitle(e.target.value)}/></label>
 {definition.fields.map(f=><label key={f.key}>{f.label}{f.type==='textarea'?<textarea rows={5} value={data[f.key]??''} onChange={e=>setData({...data,[f.key]:e.target.value})}/>:f.type==='select'?<select value={data[f.key]??''} onChange={e=>setData({...data,[f.key]:e.target.value})}><option value="">اختر…</option>{f.options?.map(o=><option key={o} value={o}>{labels[o]||o}</option>)}</select>:<input type={f.type||'text'} min={f.type==='number'?0:undefined} value={data[f.key]??''} onChange={e=>setData({...data,[f.key]:f.type==='number'?(e.target.value===''?undefined:Number(e.target.value)):e.target.value})}/>}</label>)}
 {['products','news','media','stream','players','academy'].includes(definition.id)&&<div className="upload"><Upload size={23}/><label>رفع صورة أو فيديو<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" disabled={busy} onChange={e=>void upload(e.target.files?.[0])}/></label><small>{data.storageId?'الملف مرفوع وجاهز للحفظ':'الصور حتى 8MB · الفيديو حتى 100MB'}</small></div>}
 <div className="form-row"><label>ترتيب العرض<input type="number" min={0} value={sort} onChange={e=>setSort(Number(e.target.value))}/></label><label className="publish"><input type="checkbox" checked={published} onChange={e=>setPublished(e.target.checked)}/>نشر للجمهور</label></div>
 {error&&<p className="error" role="alert">{error}</p>}<div className="form-actions"><button className="primary" type="submit" disabled={busy}><Save size={17}/>{busy?'جاري الحفظ…':'حفظ المحتوى'}</button><button className="outline" type="button" disabled={busy} onClick={onClose}>إلغاء</button></div></form></section></div>;
}
class ErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}render(){return this.state.failed?<div className="center"><section className="login"><h1>تعذر تحميل لوحة الإدارة</h1><p>تحقق من اتصال الإنترنت ثم أعد المحاولة.</p><button onClick={()=>location.reload()}>إعادة المحاولة</button></section></div>:this.props.children}}
const convexUrl=import.meta.env.VITE_CONVEX_URL;
createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary>{convexUrl?<ConvexAuthProvider client={new ConvexReactClient(convexUrl)} storageNamespace="alrajja-admin"><Admin/></ConvexAuthProvider>:<div className="center"><section className="login"><h1>لوحة إدارة نادي الرجاء العراقي</h1><p>جارٍ تجهيز الاتصال بخدمات النادي.</p></section></div>}</ErrorBoundary></React.StrictMode>);
