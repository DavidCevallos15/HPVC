import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import AccessVerificationPage from './AccessVerificationPage';

const profile = window.location.pathname.toLowerCase().includes('operativo')
  ? 'operativo'
  : 'administrativo';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AccessVerificationPage profile={profile} />
  </StrictMode>,
);
