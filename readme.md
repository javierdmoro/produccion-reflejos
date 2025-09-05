# Dungeon Production Web

## Backend
- Carpeta: `/backend`
- Crear archivo `.env` basado en `.env.example`
- Colocar en `GOOGLE_SERVICE_ACCOUNT_JSON` el contenido del JSON de la cuenta de servicio
- `npm install && npm start`

## Frontend
- Carpeta: `/frontend`
- `npm install && npm run dev` para desarrollo
- Para producción (Netlify): `npm run build` → publicar `/dist`

## Despliegue recomendado
- Backend → Render (configurar variables de entorno)
- Frontend → Netlify (conectar a GitHub)
