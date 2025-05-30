import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import ResumeBuilderPage from './components/ResumeBuilderPage'

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
