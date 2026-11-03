import {lazy, Suspense, useState} from 'react';

const ReportModule = lazy(() => import('./report/ReportModule'));

export default function App() {
  const [isReportModuleOpen, setIsReportModuleOpen] = useState(false);

  return (
    <div className="enhancement">
      <button
        className="text-button"
        type="button"
        aria-expanded={isReportModuleOpen}
        aria-controls="report-module-panel"
        onClick={() => setIsReportModuleOpen((open) => !open)}
      >
        {isReportModuleOpen ? 'Hide report-module status' : 'View report-module status'}
        <span aria-hidden="true">{isReportModuleOpen ? '−' : '+'}</span>
      </button>
      <div id="report-module-panel">
        {isReportModuleOpen && (
          <Suspense fallback={<p role="status">Loading the report-module placeholder…</p>}>
            <ReportModule />
          </Suspense>
        )}
      </div>
    </div>
  );
}
