import React from 'react';

function FormNavigator({ currentStep, onBack, children }) {
  // handleHome is no longer used here
  // const handleHome = () => {
  //   window.location.reload(); // This will reset the app state and return to home
  // };

  // onBack prop is now used by the individual form components and ResumeDisplay

  return (
    <div style={{ margin: 0, padding: 0 }}>{/* Reset margin/padding to prevent layout issues */}
      {/* Navigation buttons are now handled within individual form components and ResumeDisplay */}
      {/* Removed the Back button container from here */}
      {children}
    </div>
  );
}

export default FormNavigator; 