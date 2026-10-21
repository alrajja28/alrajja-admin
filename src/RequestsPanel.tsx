import {ConvexError} from 'convex/values';
import {useState} from 'react';
import {useQuery,useMutation} from 'convex/react';
import {anyApi} from 'convex/server';
const api=anyApi;
const kinds:Record<string,string>={academy:'انضمام للأكاديمية',contact:'طلب جماهيري',tickets:'حجز تذاكر'};
const statuses:Record<string,string>={pending:'بانتظار المراجعة',approved:'مقبول',rejected:'مرفوض'};
const fields:Record<string,string>={childName:'اسم اللاعب',birthYear:'سنة الميلاد',parentName:'ولي الأمر',phone:'الهاتف',position:'المركز',requestType:'نوع الطلب',details:'التفاصيل',matchTitle:'المباراة',date:'التاريخ',stadium:'الملعب',seats:'المقاعد',total:'الإجمالي — د.ع',category:'الدرجات'};
export function RequestsPanel({onClose}:{onClose:()=>void}){
 const rows=useQuery(api.submissions.listAdmin,{}),review=useMutation(api.submissions.review);
 const [busy,setBusy]=useState(''),[error,setError]=useState(''),[filter,setFilter]=useState('pending');
 async function update(id:string,status:string){setBusy(id);setError('');try{await review({id,status});}catch(e){setError(e instanceof ConvexError&&typeof e.data==='string'?e.data:'تعذر حفظ الحالة');}finally{setBusy('');}}
 return <div className="overlay"><section className="editor" role="dialog" aria-modal="true" aria-labelledby="requests-heading"><header><h2 id="requests-heading">طلبات الجماهير والأكاديمية</h2><button onClick={onClose}>إغلاق</button></header><label>الحالة<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">الكل</option>{Object.entries(statuses).map(([id,text])=><option key={id} value={id}>{text}</option>)}</select></label>{error&&<p className="error" role="alert">{error}</p>}{rows===undefined?<p>جارٍ التحميل…</p>:rows.filter((r:any)=>filter==='all'||r.status===filter).length===0?<div className="empty">لا توجد طلبات بهذه الحالة.</div>:rows.filter((r:any)=>filter==='all'||r.status===filter).map((r:any)=><article className="request-record" key={r._id}><h3>{kinds[r.kind]}</h3><small>{new Date(r.createdAt).toLocaleString('ar-IQ')} · {r._id.slice(-8).toUpperCase()}</small><dl>{Object.entries(fields).filter(([key])=>r.data[key]!==undefined).map(([key,label])=><div key={key}><dt>{label}</dt><dd>{String(r.data[key])}</dd></div>)}</dl><p>{statuses[r.status]}</p><div className="form-actions"><button disabled={busy===r._id} onClick={()=>void update(r._id,'approved')}>قبول</button><button disabled={busy===r._id} onClick={()=>void update(r._id,'rejected')}>رفض</button><button disabled={busy===r._id} onClick={()=>void update(r._id,'pending')}>إعادة للمراجعة</button></div></article>)}</section></div>;
}
