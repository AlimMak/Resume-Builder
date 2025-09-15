import React, { useRef } from 'react';

/**
 * HomePage renders the landing actions including starting a new resume
 * and importing an existing resume file to prefill the builder.
 *
 * Styling focuses on clear call-to-action buttons centered on the page
 * so users can immediately see where to click.
 */
function HomePage({ onStartForm, onManageResumes }) {
    const fileInputRef = useRef(null);
    return (
        <div className="min-h-screen app-gradient">
            <div className="max-w-4xl mx-auto px-4 pt-20 pb-10 text-center">
                {/* Title of the application */}
                <h1
                    className="text-4xl font-extrabold tracking-tight dark:text-gray-100"
                    style={{ color: 'var(--text)' }}
                >
                    Resume Builder
                </h1>
                <p
                    className="mt-3 dark:text-gray-300"
                    style={{ color: 'var(--text)', fontWeight: 500 }}
                >
                    Craft a professional resume with live preview, clean templates, and easy exports.
                </p>

                {/* Buttons container - holds all action buttons */}
                <div className="mt-10 flex flex-wrap gap-4 justify-center">
                    {/* Button to start creating a new resume */}
                    <button 
                        onClick={onStartForm}
                        className="px-6 py-3 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 hover-glow-primary transition-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                        Create New Resume
                    </button>
                    {/* Button to manage existing resumes */}
                    <button 
                        onClick={onManageResumes}
                        className="px-6 py-3 rounded-lg bg-gray-700 text-white shadow hover:bg-gray-800 hover-elevate transition-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        Manage Resumes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HomePage; 