import React from 'react';

function HomePage({ onStartForm, onViewResume }) {
    return (
        <div>
            {/* Title of the application */}
            <h1>Resume Builder</h1>

            {/* Buttons container - holds both action buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {/* Button to start creating a new resume */}
                <button onClick={onStartForm}>
                    Create New Resume
                </button>
                {/* Button to view existing resume */}
                <button onClick={onViewResume}>
                    View Resume
                </button>
            </div>
        </div>
    );
}

export default HomePage; 