import React from 'react';

function FormNavigator({ currentStep, onBack, onGoHome, children }) {
  // handleHome is no longer used here
  // const handleHome = () => {
  //   window.location.reload(); // This will reset the app state and return to home
  // };

  // onBack prop is now used by the individual form components and ResumeDisplay

  return (
    <div className="relative min-h-screen app-gradient">
      {/* Navigation Bar */}
      <div style={{ position: 'absolute', top: '0', left: '0', right: '0', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        {/* Back Button (Top Left) */}
        <div style={{ flex: 'none' }}>
          {currentStep > 1 && (
            <button 
              onClick={onBack}
              className="pill-btn pill-neutral"
            >
              Back
            </button>
          )}
        </div>

        {/* Home Button (Top Right) */}
        <div style={{ flex: 'none' }}>
           <button 
              onClick={onGoHome}
              className="pill-btn pill-neutral"
            >
              Home
            </button>
        </div>
      </div>

      {/* Form/Resume Content - Add a large top margin to definitely clear the absolute header */}
      <div className="pb-8 px-4" style={{ marginTop: '6rem' }}>
        {children}
      </div>
    </div>
  );
}

export default FormNavigator; 