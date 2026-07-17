import './styles.css'
import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.querySelector<HTMLDivElement>('#app')!)
root.render(<App />)
