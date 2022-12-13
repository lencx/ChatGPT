import { StrictMode, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';

import Routes from './routes';
import './main.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Suspense fallback={null}>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </Suspense>
  </StrictMode>
);
