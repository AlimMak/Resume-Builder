import React, { useRef } from 'react';

/**
 * HomePage renders the landing actions including starting a new resume
 * and importing an existing resume file to prefill the builder.
 *
 * Styling focuses on clear call-to-action buttons centered on the page
 * so users can immediately see where to click.
 */
function HomePage({ onStartForm, onViewResume, onImportResume }) {
    const fileInputRef = useRef(null);

    // Trigger hidden file input click
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    // Handle file selection and propagate to parent
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onImportResume?.(file);
        // reset input so user can re-select same file
        e.target.value = '';
    };
    return (
        <div className="min-h-screen flex flex-col items-center justify-start pt-16 px-4">
            {/* Title of the application */}
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Resume Builder</h1>

            {/* Buttons container - holds all action buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
                {/* Button to start creating a new resume */}
                <button 
                    onClick={onStartForm}
                    className="px-6 py-3 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                    Create New Resume
                </button>
                {/* Button to view existing resume */}
                <button 
                    onClick={onViewResume}
                    className="px-6 py-3 rounded-lg bg-gray-700 text-white shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                    View Resume
                </button>
                {/* Button to import existing resume */}
                <button 
                    onClick={handleImportClick}
                    className="px-6 py-3 rounded-lg bg-emerald-600 text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                >
                    Import Resume
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}

export default HomePage; 