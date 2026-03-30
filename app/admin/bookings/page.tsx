'use client';
import { useEffect, useState, useCallback } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusPill from '@/components/ui/StatusPill';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

const SERVICES = ['Battery Health Check','Full Inspection','Tyre Service','Software Update'];
const SLOTS = ['09:00 AM','11:00 AM','01:00 PM','03:00 PM','05:00 PM'];

const PRICES: Record<string,number> = {
  'Battery Health Check': 50,
  'Full Inspection': 120,
  'Tyre Service': 80,
  'Software Update': 0
};

export default function AdminBookings() {
  const [bookings,setBookings] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  const [search,setSearch] = useState('');
  const [statusFilter,setStatusFilter] = useState('');
  const [centreFilter,setCentreFilter] = useState(''); // Centre filter
  const [serviceFilter,setServiceFilter] = useState(''); // Service filter

  const [addOpen,setAddOpen] = useState(false);
  const [toast,setToast] = useState('');
  const [toastType,setToastType] = useState<'success'|'error'>('success');

  const [centres,setCentres] = useState<any[]>([]);

  const [form,setForm] = useState({
    userName:'',
    userEmail:'',
    service:SERVICES[0],
    centre:'',
    date:'',
    time:SLOTS[0],
    amount:'50'
  });

  // Load bookings from API with filters
  const load = useCallback(async ()=>{
    setLoading(true);

    const params = new URLSearchParams();
    if(statusFilter) params.set('status',statusFilter);
    if(search) params.set('search',search);
    if(centreFilter) params.set('centre',centreFilter);
    if(serviceFilter) params.set('service',serviceFilter);

    const r = await fetch('/api/bookings?'+params);
    const data = await r.json();
    setBookings(data);
    setLoading(false);
  },[search,statusFilter,centreFilter,serviceFilter]);

  useEffect(()=>{ load(); },[load]);

  // Load centres for dropdown
  useEffect(()=>{
    fetch('/api/centres')
      .then(r=>r.json())
      .then(setCentres);
  },[]);

  const showToast=(msg:string,type:'success'|'error'='success')=>{
    setToast(msg);
    setToastType(type);
  }

  // Update booking status
  const updateStatus=async(id:string,status:string)=>{
    const r = await fetch('/api/bookings/'+id,{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({status})
    });

    if(r.ok){
      showToast('Booking '+status);
      load();
    } else showToast('Failed','error');
  }

  // Delete booking
  const deleteB=async(id:string)=>{
    if(!confirm('Delete this booking?')) return;

    const r = await fetch('/api/bookings/'+id,{method:'DELETE'});

    if(r.ok){
      showToast('Deleted');
      load();
    } else showToast('Failed','error');
  }

  // Add new booking
  const submitAdd=async(e:React.FormEvent)=>{
    e.preventDefault();

    const r = await fetch('/api/bookings',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(form)
    });

    if(r.ok){
      showToast('Booking added');
      setAddOpen(false);
      load();
    } else showToast('Failed','error');
  }

  // Button component
  const Btn=({onClick,color,children}:any)=>(
    <button
      onClick={onClick}
      style={{
        background:color+'15',
        border:'1px solid '+color+'40',
        color,
        padding:'5px 10px',
        borderRadius:8,
        fontSize:12,
        fontWeight:600,
        cursor:'pointer',
        marginRight:4
      }}
    >
      {children}
    </button>
  );

  const cols=[
    {
      key:'userName',
      label:'Customer',
      render:(v:string,r:any)=>(
        <div>
          <div style={{color:'#111',fontWeight:600}}>{v}</div>
          <div style={{fontSize:12,color:'#777'}}>{r.userEmail}</div>
        </div>
      )
    },
    { key:'service', label:'Service' },
    { key:'centre', label:'Centre' },
    { key:'date', label:'Date', render:(v:string,r:any)=>v+' '+r.time },
    { key:'amount', label:'Amount', render:(v:number)=> <b style={{color:'#111'}}>{v ? 'RM '+v : 'FREE'}</b> },
    { key:'status', label:'Status', render:(v:string)=> <StatusPill status={v}/> },
    {
      key:'id',
      label:'Actions',
      render:(_:any,r:any)=>(
        <div style={{display:'flex',flexWrap:'wrap'}}>
          {r.status==='pending' && <>
            <Btn onClick={()=>updateStatus(r.id,'confirmed')} color="#00b894">✓ Approve</Btn>
            <Btn onClick={()=>updateStatus(r.id,'cancelled')} color="#d63031">✗ Reject</Btn>
          </>}
          {r.status==='confirmed' && <Btn onClick={()=>updateStatus(r.id,'completed')} color="#636e72">Done</Btn>}
          <Btn onClick={()=>deleteB(r.id)} color="#d63031">🗑</Btn>
        </div>
      )
    }
  ];

  const Field=({label,children}:any)=>(
    <div style={{marginBottom:14}}>
      <label style={{
        fontSize:12,
        color:'#666',
        fontWeight:600,
        display:'block',
        marginBottom:6
      }}>{label}</label>
      {children}
    </div>
  );

  const inp={
    width:'100%',
    background:'#fff',
    border:'1px solid #ddd',
    borderRadius:10,
    padding:'10px 14px',
    fontSize:14,
    color:'#111',
    outline:'none'
  };

  return (
    <div style={{fontFamily:'Inter, sans-serif'}}>

      <h1 style={{fontSize:24,fontWeight:700,marginBottom:24}}>Bookings</h1>

      {/* Filters */}
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          onKeyDown={e=>e.key==='Enter' && load()}
          placeholder="Search..."
          style={{...inp,flex:1,minWidth:200}}
        />
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{...inp,width:'auto'}}>
          <option value="">All Status</option>
          {['pending','confirmed','completed','cancelled'].map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={centreFilter} onChange={e=>setCentreFilter(e.target.value)} style={{...inp,width:'auto'}}>
          <option value="">All Centres</option>
          {centres.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={serviceFilter} onChange={e=>setServiceFilter(e.target.value)} style={{...inp,width:'auto'}}>
          <option value="">All Services</option>
          {SERVICES.map(s=><option key={s}>{s}</option>)}
        </select>
        <button onClick={load} style={{...inp,width:'auto',cursor:'pointer'}}>Search</button>
        <button onClick={()=>setAddOpen(true)} style={{background:'#00b894',border:'none',borderRadius:10,padding:'10px 18px',fontSize:14,fontWeight:600,color:'#fff',cursor:'pointer'}}>+ Add</button>
      </div>

      {/* Booking Table */}
      <div style={{background:'#fff',border:'1px solid #eee',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid #eee',display:'flex',justifyContent:'space-between'}}>
          <span style={{fontWeight:600,fontSize:14, color: '#888'}}>All Bookings</span>
          <span style={{color:'#777',fontSize:13}}>{loading ? 'Loading...' : bookings.length+' records'}</span>
        </div>
        <DataTable columns={cols} data={bookings}/>
      </div>

      {/* Add Booking Modal */}
      <Modal open={addOpen} onClose={()=>setAddOpen(false)} title="Add Booking">
        <form onSubmit={submitAdd}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Field label="Customer Name">
              <input style={inp} value={form.userName} onChange={e=>setForm(f=>({...f,userName:e.target.value}))} required/>
            </Field>
            <Field label="Email">
              <input style={inp} type="email" value={form.userEmail} onChange={e=>setForm(f=>({...f,userEmail:e.target.value}))}/>
            </Field>
          </div>
          <Field label="Service">
            <select style={inp} value={form.service} onChange={e=>setForm(f=>({...f,service:e.target.value,amount:String(PRICES[e.target.value]||0)}))}>
              {SERVICES.map(s=><option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Centre">
            <select style={inp} value={form.centre} onChange={e=>setForm(f=>({...f,centre:e.target.value}))}>
              <option value="">Select centre</option>
              {centres.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Field label="Date">
              <input style={inp} type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} required/>
            </Field>
            <Field label="Time">
              <select style={inp} value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))}>
                {SLOTS.map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Amount (RM)">
            <input style={inp} type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/>
          </Field>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
            <button type="button" onClick={()=>setAddOpen(false)} style={{...inp,width:'auto',cursor:'pointer'}}>Cancel</button>
            <button type="submit" style={{background:'#00b894',border:'none',borderRadius:10,padding:'10px 22px',fontWeight:600,color:'#fff',cursor:'pointer'}}>Add Booking</button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast} type={toastType} onClose={()=>setToast('')}/>}
    </div>
  );
}