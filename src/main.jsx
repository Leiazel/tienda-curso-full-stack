import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../fonts/dich-fonts.css'
import './styles/dich.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App page={document.body.dataset.page} />
  </StrictMode>,
)
