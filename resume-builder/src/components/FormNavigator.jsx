import React from 'react';

function FormNavigator({ currentStep, onBack, children }) {
  const handleHome = () => {
    window.location.reload(); // This will reset the app state and return to home
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        {currentStep > 1 && (
          <button onClick={onBack}>Back</button>
        )}
        <button onClick={handleHome}>Home</button>
      </div>
      {children}
    </div>
  );
}

export default FormNavigator; 