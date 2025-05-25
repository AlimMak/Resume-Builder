import React from 'react';

function FormNavigator({ currentStep, onBack, children }) {
  return (
    <div>
      {currentStep > 1 && (
        <button onClick={onBack}>Back</button>
      )}
      {children}
    </div>
  );
}

export default FormNavigator; 