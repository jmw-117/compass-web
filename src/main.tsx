import {lazy, StrictMode, Suspense} from 'react';
import {createRoot} from 'react-dom/client';

const rootElement = document.getElementById('react-enhancement');
const launchButton = document.getElementById('take-assessment');
const hero = document.querySelector('.hero');

if (!rootElement || !(launchButton instanceof HTMLButtonElement) || !(hero instanceof HTMLElement)) {
  throw new Error('Missing assessment launch elements.');
}

const App = lazy(() => import('./App'));
const root = createRoot(rootElement);
let hasLaunched = false;

launchButton.addEventListener('click', () => {
  if (hasLaunched) {
    return;
  }

  hasLaunched = true;
  launchButton.setAttribute('aria-expanded', 'true');
  hero.removeAttribute('aria-labelledby');
  hero.setAttribute('aria-label', 'AI readiness assessment');
  hero.classList.add('hero--assessment-active');
  root.render(
    <StrictMode>
      <Suspense fallback={<p role="status">Loading the assessment…</p>}>
        <App />
      </Suspense>
    </StrictMode>,
  );
});

launchButton.disabled = false;
