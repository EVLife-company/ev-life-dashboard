'use client';
import { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import StatusPill from '@/components/ui/StatusPill';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

const blank = { name:'', location:'', contact:'', hours:'', adminEmail:'' };

export default function AdminCentres() {

  const [centres,setCentres] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  const [addOpen,setAddOpen] = useState(false);
  const [editItem,setEditItem] = useState<any>(null);

  const [toast,setToast] = useState('');

  const [form,setForm] = useState(blank);

  const load = async ()=>{
    setLoading(true);
    const r = await fetch('/api/centres');
    setCentres(await r.json());
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  const del = async(id:string)=>{
    if(!confirm('Delete this centre?')) return;

    await fetch('/api/centres/'+id,{method:'DELETE'});

    setToast('Centre deleted');
    load();
  };

  const submitAdd = async(e:React.FormEvent)=>{
    e.preventDefault();

    await fetch('/api/centres',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(form)
    });

    setToast('Centre added');
    setAddOpen(false);
    setForm(blank);
    load();
  };

  const submitEdit = async(e:React.FormEvent)=>{
    e.preventDefault();

    await fetch('/api/centres/'+editItem.id,{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(form)
    });

    setToast('Centre updated');
    setEditItem(null);
    load();
  };

  const inp={
    width:'100%',
    background:'#fff',
    border:'1px solid #ddd',
    borderRadius:10,
    padding:'10px 14px',
    fontSize:14,
    color:'#111',
    outline:'none',
    marginBottom:12
  };

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
      key:'name',
      label:'Centre Name',
      render:(v:string)=>
        <span style={{color:'#111',fontWeight:600}}>
          {v}
        </span>
    },

    {key:'location',label:'Location'},
    {key:'contact',label:'Contact'},

    {
      key:'hours',
      label:'Hours',
      render:(v:string)=>
        <span style={{fontSize:13,color:'#555'}}>
          {v}
        </span>
    },

    {
      key:'rating',
      label:'Rating',
      render:(v:number)=> v ? '⭐ '+v : 'N/A'
    },

    {
      key:'status',
      label:'Status',
      render:(v:string)=>
        <StatusPill status={v || 'active'} />
    },

    {
      key:'id',
      label:'Actions',
      render:(_:any,r:any)=>(
        <div>

          <Btn
            onClick={()=>{
              setEditItem(r);
              setForm({
                name:r.name,
                location:r.location,
                contact:r.contact,
                hours:r.hours,
                adminEmail:r.adminEmail || ''
              });
            }}
            color="#0984e3"
          >
            Edit
          </Btn>

          <Btn
            onClick={()=>del(r.id)}
            color="#d63031"
          >
            🗑
          </Btn>

        </div>
      )
    }

  ];

  const FormFields=()=>(
    <>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>

        <input
          style={inp}
          placeholder="Centre name"
          value={form.name}
          onChange={e=>setForm(f=>({...f,name:e.target.value}))}
          required
        />

        <input
          style={inp}
          placeholder="Location"
          value={form.location}
          onChange={e=>setForm(f=>({...f,location:e.target.value}))}
          required
        />

      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>

        <input
          style={inp}
          placeholder="Contact e.g. 03-1234 5678"
          value={form.contact}
          onChange={e=>setForm(f=>({...f,contact:e.target.value}))}
        />

        <input
          style={inp}
          placeholder="Hours e.g. Mon–Fri 9am–6pm"
          value={form.hours}
          onChange={e=>setForm(f=>({...f,hours:e.target.value}))}
        />

      </div>

      <input
        style={inp}
        type="email"
        placeholder="Admin email (portal login)"
        value={form.adminEmail}
        onChange={e=>setForm(f=>({...f,adminEmail:e.target.value}))}
      />

    </>
  );

  return(
    <div style={{fontFamily:'Inter, sans-serif'}}>

      <h1 style={{fontSize:24,fontWeight:700,marginBottom:24}}>
        Service Centres
      </h1>

      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>

        <button
          onClick={()=>{setForm(blank); setAddOpen(true);}}
          style={{
            background:'#00b894',
            border:'none',
            borderRadius:10,
            padding:'10px 18px',
            fontSize:14,
            fontWeight:600,
            color:'#fff',
            cursor:'pointer'
          }}
        >
          + Add Centre
        </button>

      </div>

      <div
        style={{
          background:'#fff',
          border:'1px solid #eee',
          borderRadius:14,
          overflow:'hidden'
        }}
      >

        <div
          style={{
            padding:'16px 20px',
            borderBottom:'1px solid #eee',
            fontWeight:600,
            fontSize:14
          }}
        >
          Service Centres
          <span style={{color:'#777',fontWeight:400,fontSize:13,marginLeft:8}}>
            {centres.length} centres
          </span>
        </div>

        <DataTable
          columns={cols}
          data={centres}
          emptyMessage="No service centres yet"
        />

      </div>

      <Modal open={addOpen} onClose={()=>setAddOpen(false)} title="Add Service Centre">

        <form onSubmit={submitAdd}>

          <FormFields/>

          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>

            <button
              type="button"
              onClick={()=>setAddOpen(false)}
              style={{
                background:'#fff',
                border:'1px solid #ddd',
                borderRadius:10,
                padding:'10px 20px',
                cursor:'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                background:'#00b894',
                border:'none',
                borderRadius:10,
                padding:'10px 20px',
                fontWeight:600,
                color:'#fff',
                cursor:'pointer'
              }}
            >
              Add
            </button>

          </div>

        </form>

      </Modal>

      <Modal open={!!editItem} onClose={()=>setEditItem(null)} title="Edit Service Centre">

        <form onSubmit={submitEdit}>

          <FormFields/>

          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>

            <button
              type="button"
              onClick={()=>setEditItem(null)}
              style={{
                background:'#fff',
                border:'1px solid #ddd',
                borderRadius:10,
                padding:'10px 20px',
                cursor:'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                background:'#00b894',
                border:'none',
                borderRadius:10,
                padding:'10px 20px',
                fontWeight:600,
                color:'#fff',
                cursor:'pointer'
              }}
            >
              Save
            </button>

          </div>

        </form>

      </Modal>

      {toast && <Toast message={toast} onClose={()=>setToast('')} />}

    </div>
  );
}