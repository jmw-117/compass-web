import {lazy, StrictMode, Suspense} from 'react';
import LoadBoundary from './LoadBoundary';
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

const returnHome = () => {
  root.render(null);
  hasLaunched = false;
  hero.classList.remove('hero--assessment-active');
  hero.removeAttribute('aria-label');
  hero.setAttribute('aria-labelledby', 'hero-title');
  launchButton.setAttribute('aria-expanded', 'false');
  history.replaceState(null, '', new URL('./', document.baseURI));
  launchButton.focus({preventScroll: true});
  window.scrollTo({top: 0, behavior: 'instant'});
};

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
      <LoadBoundary message="Compass could not open the assessment.">
        <Suspense fallback={<p role="status">Loading the assessment…</p>}>
          <App onHome={returnHome} />
        </Suspense>
      </LoadBoundary>
    </StrictMode>,
  );
});

launchButton.disabled = false;
