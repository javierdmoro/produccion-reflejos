import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Registro from './pages/Registro'
import Resumen from './pages/Resumen'
import './styles.css'

function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <Link to="/registro">Registro</Link>
        <Link to="/resumen">Resumen</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Registro />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/resumen" element={<Resumen />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
