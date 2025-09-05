import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Registro() {
  const [sheets, setSheets] = useState([])
  const [bd, setBd] = useState([])
  const [form, setForm] = useState({
    trabajador: '',
    no: '',
    descripcion: '',
    unidades: '',
    largo: '', ancho: '', perimetro: '', area: '',
    processes: []
  })

  useEffect(()=>{
    axios.get('/api/sheets').then(r=>setSheets(r.data.sheets)).catch(()=>{})
    axios.get('/api/bd').then(r=>setBd(r.data.data)).catch(()=>{})
  },[])

  function addProcess(){
    setForm(prev=>({...prev, processes: [...prev.processes, {name:'', veces:''}]}))
  }
  function updateProcess(i, key, value){
    const p = [...form.processes]; p[i][key]=value; setForm({...form, processes: p})
  }

  function validate(){
    if(!form.descripcion || !form.unidades) return false
    return true
  }

  async function handleAceptar(){
    if(!validate()){
      window.alert('⚠️ Debes llenar la Descripción y la Cantidad de unidades antes de continuar.')
      return
    }
    // Calcular valores
    const processesPayload = form.processes.map(p=>{
      const bdItem = bd.find(b=>b.proceso===p.name) || {}
      const elemento = bdItem.elemento || ''
      const medida = elemento.toLowerCase().includes('per') ? Number(form.perimetro || 0) : Number(form.area || 0)
      const veces = p.veces? Number(p.veces) : 1
      const unidades = Number(form.unidades || 1)
      const valor = medida * veces * unidades
      return { name: p.name, um: bdItem.um, elemento, veces, valor_computado: valor }
    })

    const payload = { 
      no: form.no, 
      descripcion: form.descripcion, 
      unidades: Number(form.unidades), 
      largo: form.largo, ancho: form.ancho, perimetro: form.perimetro, area: form.area, 
      processes: processesPayload 
    }

    try{
      await axios.post(`/api/worker/${form.trabajador}/append`, payload)
      // limpiar pero mantener trabajador seleccionado
      setForm({ trabajador: form.trabajador, no:'', descripcion:'', unidades:'', largo:'', ancho:'', perimetro:'', area:'', processes: [] })
      window.alert('Registro guardado!')
    }catch(e){ window.alert('Error al guardar') }
  }

  return (
    <div className="container">
      <h1>Registro de Producción</h1>
      <div className="card">
        <label>Trabajador</label>
        <select value={form.trabajador} onChange={e=>setForm({...form, trabajador: e.target.value})}>
          <option value="">-- selecciona --</option>
          {sheets.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>

        <label>No. Personalización (opcional)</label>
        <input value={form.no} onChange={e=>setForm({...form, no: e.target.value})} />

        <label>Descripción *</label>
        <input value={form.descripcion} onChange={e=>setForm({...form, descripcion: e.target.value})} />

        <label>Cantidad de unidades *</label>
        <input type="number" value={form.unidades} onChange={e=>setForm({...form, unidades: e.target.value})} />

        <label>Largo</label><input value={form.largo} onChange={e=>setForm({...form, largo: e.target.value})} />
        <label>Ancho</label><input value={form.ancho} onChange={e=>setForm({...form, ancho: e.target.value})} />
        <label>Perímetro</label><input value={form.perimetro} onChange={e=>setForm({...form, perimetro: e.target.value})} />
        <label>Área</label><input value={form.area} onChange={e=>setForm({...form, area: e.target.value})} />

        <h3>Procesos</h3>
        {form.processes.map((p,i)=> (
          <div key={i} className="proc">
            <select value={p.name} onChange={e=>updateProcess(i,'name',e.target.value)}>
              <option value="">-- proceso --</option>
              {bd.map(b=> <option key={b.proceso} value={b.proceso}>{b.proceso}</option>)}
            </select>
            <input placeholder="Cantidad de veces (si vacío = 1)" value={p.veces} onChange={e=>updateProcess(i,'veces',e.target.value)} />
          </div>
        ))}

        <div className="actions">
          <button onClick={addProcess}>+ Agregar proceso</button>
          <button onClick={handleAceptar}>Aceptar</button>
          <button onClick={()=>setForm({ trabajador: form.trabajador, no:'', descripcion:'', unidades:'', largo:'', ancho:'', perimetro:'', area:'', processes: [] })}>Limpiar</button>
          <a className="link" href="/resumen">Ir a Resumen</a>
        </div>
      </div>
    </div>
  )
}
