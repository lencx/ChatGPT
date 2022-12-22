import { StrictMode, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';

import useEvent from '@/hooks/useEvent';
import Layout from '@/layout';
import './main.scss';

const App = () => {
  useEvent();
  return (
    <BrowserRouter>
      <Layout/>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </StrictMode>
);
