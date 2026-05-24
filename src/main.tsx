import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress benign Recharts ResponsiveContainer dimension warnings during initial layout mounts & tab animations
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    args[0].includes('The width(-1) and height(-1) of chart should be greater than 0')
  ) {
    return;
  }
  originalWarn(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
