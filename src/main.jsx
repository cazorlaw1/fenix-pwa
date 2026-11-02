import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LoaderProvider } from './context/LoaderContext' // <-- 1. Importa el proveedor

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoaderProvider> {/* <-- 2. Envuélvelo aquí */}
      <App />
    </LoaderProvider>
  </StrictMode>,
)