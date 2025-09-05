const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// ✅ Nuevo método: si hay variable de entorno la usa, si no, lee credenciales.json
function getAuth() {
  let credentials = {};
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error('⚠️ Error al parsear GOOGLE_SERVICE_ACCOUNT_JSON');
    }
  } else {
    try {
      const raw = fs.readFileSync(__dirname + '/credenciales.json', 'utf8');
      credentials = JSON.parse(raw);
    } catch (e) {
      console.error('⚠️ No se pudo leer credenciales.json. Asegúrate de que exista en backend/.');
    }
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
}

// 🔹 Obtener lista de hojas (excepto BD y Resumen)
app.get('/api/sheets', async (req,res)=>{
  try{
    const auth = getAuth();
    const sheets = google.sheets({version:'v4', auth});
    const r = await sheets.spreadsheets.get({spreadsheetId: SPREADSHEET_ID});
    const names = r.data.sheets.map(s=>s.properties.title).filter(n=>!['BD','Resumen'].includes(n));
    res.json({sheets: names});
  }catch(e){ console.error(e); res.status(500).json({error:'fail'}); }
});

// 🔹 Obtener BD de procesos
app.get('/api/bd', async (req,res)=>{
  try{
    const auth = getAuth();
    const sheets = google.sheets({version:'v4', auth});
    const r = await sheets.spreadsheets.values.get({spreadsheetId: SPREADSHEET_ID, range: 'BD!A:D'});
    const rows = r.data.values || [];
    const data = rows.map(r=>({proceso: r[0]||'', um: r[1]||'', elemento: r[2]||'', precio: r[3]?Number(r[3]):0})).filter(x=>x.proceso);
    res.json({data});
  }catch(e){ console.error(e); res.status(500).json({error:'fail'}); }
});

// 🔹 Insertar registro en hoja de trabajador
app.post('/api/worker/:worker/append', async (req,res)=>{
  try{
    const worker = req.params.worker;
    const payload = req.body;
    const auth = getAuth();
    const sheets = google.sheets({version:'v4', auth});

    // Leer lista de procesos desde BD
    const bdRes = await sheets.spreadsheets.values.get({spreadsheetId: SPREADSHEET_ID, range: 'BD!A:A'});
    const processNames = (bdRes.data.values||[]).map(r=>r[0]).filter(Boolean);

    const row = [payload.no||'', payload.descripcion||'', payload.unidades||''];
    const map = {};
    (payload.processes||[]).forEach(p=>{ map[p.name]=p.valor_computado; });

    for(const pname of processNames){ 
      row.push(map[pname]!==undefined?String(map[pname]):''); 
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID, 
      range: `${worker}!A:Z`, 
      valueInputOption:'USER_ENTERED', 
      requestBody:{values:[row]}
    });

    res.json({ok:true});
  }catch(e){ console.error(e); res.status(500).json({error:'fail'}); }
});

// 🔹 Resumen del trabajador
app.get('/api/worker/:worker/summary', async (req,res)=>{
  try{
    const worker = req.params.worker;
    const auth = getAuth();
    const sheets = google.sheets({version:'v4', auth});
    
    const r = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID, 
      range: `${worker}!A:C`
    });
    const rows = (r.data.values||[]).map(r=>({no:r[0]||'', descripcion:r[1]||'', cantidad:r[2]||''}));

    const b1 = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID, 
      range: `${worker}!B1`
    });
    const salario = (b1.data.values && b1.data.values[0] && b1.data.values[0][0])||'0';

    res.json({rows, salario});
  }catch(e){ console.error(e); res.status(500).json({error:'fail'}); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('✅ Backend listening on', PORT));
