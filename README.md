# Simulador RARA · RARAS

Chatbot para practicar conversaciones de liderazgo usando los métodos RARA y RARAS.

## Stack
- React 18 + Vite
- Vercel (hosting + serverless proxy)
- Claude API (claude-sonnet-4-6)

## Estructura

```
chatbot-rara/
├── api/
│   └── anthropic.js        ← Proxy serverless (protege la API key)
├── src/
│   ├── App.jsx
│   ├── index.css
│   └── components/
│       ├── Menu.jsx + Menu.css
│       └── Chat.jsx + Chat.css
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## Despliegue en Vercel (paso a paso)

### 1. Subir a GitHub

```bash
cd chatbot-rara
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/chatbot-rara.git
git push -u origin main
```

### 2. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión (o crea cuenta gratuita)
2. Click en **"New Project"**
3. Importa el repositorio de GitHub que acabas de subir
4. En **"Framework Preset"** selecciona **Vite**
5. Deja el resto de configuración por defecto

### 3. Agregar la API key de Anthropic

En Vercel, antes de hacer deploy:
1. Ve a **Settings → Environment Variables**
2. Agrega una variable nueva:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** tu API key de Anthropic (empieza con `sk-ant-...`)
   - **Environments:** Production, Preview, Development
3. Click **Save**

### 4. Deploy

Haz click en **Deploy**. En 1-2 minutos tendrás tu URL pública (ej: `https://chatbot-rara.vercel.app`).

### 5. Actualizaciones futuras

Cada `git push` a la rama `main` hará un re-deploy automático.

## Desarrollo local

```bash
npm install
npm run dev
```

Para que funcione localmente, crea un archivo `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Cómo funciona el proxy

El archivo `api/anthropic.js` es una función serverless de Vercel que:
- Recibe las peticiones del frontend (`/api/anthropic`)
- Las reenvía a `api.anthropic.com` agregando la API key del servidor
- Devuelve la respuesta al frontend

Así la API key **nunca queda expuesta** en el código del cliente.

## Uso

1. El usuario elige entre **Método RARA** o **Método RARAS**
2. Elige la **actitud** del colaborador (difícil / normal / positiva)
3. Practica la conversación siendo el líder
4. Cuando termina, presiona **📊 Feedback** para recibir evaluación detallada
