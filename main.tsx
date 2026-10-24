import '@vitejs/plugin-react/preamble';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for full offline and standalone capability
registerSW({
  immediate: true,
});

createRoot(document.getElementById('root')!).render(<App />);
