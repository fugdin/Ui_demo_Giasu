import { createRoot } from 'react-dom/client';
// Enable mock data layer in dev when VITE_ENABLE_MOCK_DATA=true
import './mocks';
import App from './App';

createRoot(document.getElementById('root')!).render(<App />);
