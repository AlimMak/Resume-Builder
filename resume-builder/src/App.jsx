/**
 * App component controls top-level navigation between the home screen and the builder.
 * State is intentionally minimal to keep routing logic straightforward.
 */
import { useState } from 'react'
import HomePage from './components/HomePage'
import ResumeBuilderPage from './components/ResumeBuilderPage'
import { parseResumeFile } from './utils/parseResumeFile'
import { logger } from './utils/logger'

function App() {
  // Keep track of the current page: 'home' or 'resumeBuilder'
  const [currentPage, setCurrentPage] = useState('home');

  // Show different pages based on what the user wants to see
  return (
    <div>
      {currentPage === 'home' ? (
        // Show the home page
        <HomePage 
          onStartForm={() => setCurrentPage('resumeBuilder')}
          onViewResume={() => setCurrentPage('resumeBuilder')}
          onImportResume={async (file) => {
            try {
              logger.info('Starting import flow', { fileName: file.name, fileType: file.type, fileSize: file.size });
              const parsed = await parseResumeFile(file);
              logger.info('Parsed resume file', { sections: Object.keys(parsed) });
              const existing = localStorage.getItem('resumeData');
              const merged = { ...(existing ? JSON.parse(existing) : {}), ...parsed };
              localStorage.setItem('resumeData', JSON.stringify(merged));
              setCurrentPage('resumeBuilder');
            } catch (err) {
              logger.error('Import failed', { error: err?.message });
              alert('Failed to import resume. Please try a different file or format.');
            }
          }}
        />
      ) : (
        // Show the Resume Builder Page
        <ResumeBuilderPage 
          onGoHome={() => setCurrentPage('home')}
        />
      )}
    </div>
  );
}

export default App
