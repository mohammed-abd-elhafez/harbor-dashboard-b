import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { Providers } from './app/providers';
import { mocksEnabled } from './data/repository';
import './styles/base.css';
import './styles/tokens.css';
import './styles/dashboard.css';

async function bootstrap(): Promise<void> {
  if (mocksEnabled()) {
    try {
      const { worker } = await import('./data/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
        quiet: true,
        serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
      });
    } catch {
      // Service workers can be unavailable (blocked, private mode). Requests then go to the network.
    }
  }
  const root = document.getElementById('root');
  if (!root) throw new Error('Missing #root element');
  createRoot(root).render(
    <StrictMode>
      <Providers>
        <App />
      </Providers>
    </StrictMode>,
  );
}

void bootstrap();
