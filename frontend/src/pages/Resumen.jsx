import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Resumen(){
  const [sheets, setSheets] = useState([])
  const [selected, setSelected] = useState('')
  const [data, setData] = useState({rows:[], salario: '0'})

  useEffect(()=>{
    axios.get('/api/sheets').then(r=>setSheets(r.data.sheets)).catch(()=>{})
  },[])

  function load(){
    if(!selected) return alert('Selecciona trabajador')
    axios.get(`/api/worker/${selected}/summary`).then(r=>setData(r.data)).catch(()=>alert('Error'))
  }

  return (
    <div className="container">
      <h1>Resumen</h1>
      <div className="card">
        <label>Trabajador</label>
        <select value={selected} onChange={e=>setSelected(e.target.value)}>
          <option value="">-- selecciona --</option>
          {sheets.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={load}>Ver resumen</button>

        <table className="summary-table">
          <thead><tr><th>No.</th><th>Descripción</th><th>Cant.</th></tr></thead>
          <tbody>
            {data.rows.map((r,i)=> <tr key={i}><td>{r.no}</td><td>{r.descripcion}</td><td>{r.cantidad}</td></tr>)}
          </tbody>
        </table>
        <div className="salary">Salario acumulado: <strong>{data.salario}</strong></div>
      </div>
    </div>
  )
}
