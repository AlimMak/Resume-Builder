import React from 'react';

function HomePage({ onStartForm, onViewResume }) {
    return (
        <div>
            <h1>Resume Builder</h1>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={onStartForm}>
                    Create New Resume
                </button>
                <button onClick={onViewResume}>
                    View Resume
                </button>
            </div>
        </div>
    );
}

export default HomePage; 