/**
 * App component controls top-level navigation between the home screen and the builder.
 * State is intentionally minimal to keep routing logic straightforward.
 */
import { useEffect, useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/ToastProvider'
import ThemeToggle from './components/ThemeToggle'
import HomePage from './components/HomePage'
import ResumeBuilderPage from './components/ResumeBuilderPage'
import { logger } from './utils/logger'
import ManageResumesPage from './components/ManageResumesPage'
import { createResume, getResume, hasAnyResumes } from './utils/resumeDb'
import FilterCheckPage from './components/FilterCheckPage'

function App() {
  // Keep track of the current page: 'home' | 'manage' | 'resumeBuilder' | 'filterCheck'
  const [currentPage, setCurrentPage] = useState('home');
  // Track which resume is being edited in the builder
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [currentResumeName, setCurrentResumeName] = useState('');

  // Initial migration: move existing localStorage single resume to IndexedDB once
  useEffect(() => {
    const run = async () => {
      try {
        const migratedFlag = localStorage.getItem('migrationDone');
        if (migratedFlag === '1') return;
        const saved = localStorage.getItem('resumeData');
        if (saved) {
          const data = JSON.parse(saved);
          const hasAny = await hasAnyResumes();
          const created = await createResume({ name: hasAny ? 'Migrated Resume' : 'My Resume', data });
          logger.info('Migrated localStorage resume to IndexedDB', { id: created.id, name: created.name });
          // Clear old storage after successful migration
          localStorage.removeItem('resumeData');
          localStorage.setItem('migrationDone', '1');
        } else {
          localStorage.setItem('migrationDone', '1');
        }
      } catch (err) {
        logger.error('Migration failed', { message: err?.message });
      }
    };
    run();
  }, []);

  // Show different pages based on what the user wants to see
  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="app-gradient min-h-screen">
          {/* App header controls */}
          <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 50 }}>
            <ThemeToggle />
          </div>
          {currentPage === 'home' && (
            // Home page with actions
            <HomePage 
              onStartForm={async () => {
                // Create a brand new resume and open it in the builder
                const created = await createResume({ name: 'Untitled Resume' });
                setCurrentResumeId(created.id);
                setCurrentResumeName(created.name);
                logger.info('Start new resume', { id: created.id });
                setCurrentPage('resumeBuilder');
              }}
              onManageResumes={() => setCurrentPage('manage')}
              onFilterCheck={() => setCurrentPage('filterCheck')}
            />
          )}
          {currentPage === 'manage' && (
            <ManageResumesPage
              onGoHome={() => setCurrentPage('home')}
              onOpenResume={async (id) => {
                const rec = await getResume(id);
                setCurrentResumeId(id);
                setCurrentResumeName(rec?.name || '');
                setCurrentPage('resumeBuilder');
              }}
            />
          )}
          {currentPage === 'resumeBuilder' && (
            // Resume Builder Page for the selected resume
            <ResumeBuilderPage 
              resumeId={currentResumeId}
              onGoHome={() => setCurrentPage('home')}
              onGoManage={() => setCurrentPage('manage')}
              onRenameCurrent={(name) => setCurrentResumeName(name)}
            />
          )}
          {currentPage === 'filterCheck' && (
            <FilterCheckPage 
              onGoHome={() => setCurrentPage('home')}
              onOpenInBuilder={(id) => { setCurrentResumeId(id); setCurrentPage('resumeBuilder'); }}
            />
          )}
        </div>
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App
