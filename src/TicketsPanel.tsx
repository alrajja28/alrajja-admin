import {useState} from 'react';
import {useQuery,useMutation} from 'convex/react';
import {anyApi} from 'convex/server';
import {ConvexError} from 'convex/values';
import {RequestsList} from './RequestsPanel';
const api=anyApi;
const tiers=[{id:'vip',name:'VIP',rate:2.5},{id:'first',name:'درجة أولى',rate:1.5},{id:'second',name:'درجة ثانية',rate:1},{id:'third',name:'درجة ثالثة',rate:.5}];
export function TicketsPanel({onClose,onManageMatches}:{onClose:()=>void;onManageMatches:()=>void}){
 const [tab,setTab]=useState('prices');const matches=useQuery(api.content.listAdmin,{section:'matches'});
 return <div className="overlay"><section className="editor" role="dialog" aria-modal="true" aria-labelledby="tickets-heading"><header><div><h2 id="tickets-heading">التذاكر</h2><p>أسعار الدرجات، إتاحة الحجز وطلبات الجمهور</p></div><button onClick={onClose}>إغلاق</button></header><nav className="category-filters" aria-label="إدارة التذاكر"><button aria-pressed={tab==='prices'} onClick={()=>setTab('prices')}>الأسعار وإتاحة الحجز</button><button aria-pressed={tab==='requests'} onClick={()=>setTab('requests')}>طلبات الحجز</button></nav><p className="notice">هذه طلبات حجز تُراجع من الإدارة. لا يوجد دفع إلكتروني.</p>{tab==='requests'?<RequestsList kind="tickets"/>:<><button className="outline" onClick={onManageMatches}>إضافة أو تعديل أو حذف مباراة</button>{matches===undefined?<p>جارٍ التحميل…</p>:!matches.length?<div className="empty">أضف مباراة من قسم المباريات لتحديد أسعارها وفتح الحجز.</div>:matches.map((m:any)=><MatchPrices key={m._id+':'+m.updatedAt} match={m}/>)}</>}</section></div>;
}
function MatchPrices({match}:{match:any}){
 const [prices,setPrices]=useState<Record<string,number>>(()=>Object.fromEntries(tiers.map(t=>[t.id,match.data.ticketPrices?.[t.id]??Math.round((match.data.ticketPrice??0)*t.rate)])));
 const canOpen=match.published&&match.data.status!=='finished';
 const [enabled,setEnabled]=useState(canOpen&&match.data.ticketSalesEnabled!==false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 const save=useMutation(api.tickets.saveSettings);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{await save({id:match._id,prices,enabled});setSaved(true);}catch(e){setError(e instanceof ConvexError&&typeof e.data==='string'?e.data:'تعذر حفظ الأسعار');}finally{setBusy(false)}}
 return <form className="request-record" onSubmit={submit}><h3>{match.title}</h3><p>{match.data.date} · {match.data.stadium} · {match.published?'منشورة':'مسودة'}</p>{tiers.map(t=><label key={t.id}>{t.name} — د.ع<input type="number" min={0} max={100000000} step={1} required value={prices[t.id]} onChange={e=>setPrices({...prices,[t.id]:Number(e.target.value)})}/></label>)}<label className="publish"><input type="checkbox" checked={enabled} disabled={!canOpen} onChange={e=>setEnabled(e.target.checked)}/>فتح الحجز للجمهور</label>{!canOpen&&<p>انشر مباراة غير منتهية لفتح الحجز.</p>}{error&&<p role="alert" className="error">{error}</p>}{saved&&<p role="status">تم حفظ إعدادات التذاكر</p>}<button className="primary" disabled={busy}>{busy?'جارٍ الحفظ…':'حفظ إعدادات التذاكر'}</button></form>;
}
