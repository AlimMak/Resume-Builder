import React, { useRef } from 'react';

/**
 * HomePage renders the landing actions including starting a new resume
 * and importing an existing resume file to prefill the builder.
 *
 * Styling focuses on clear call-to-action buttons centered on the page
 * so users can immediately see where to click.
 */
function HomePage({ onStartForm, onManageResumes, onFilterCheck }) {
    const fileInputRef = useRef(null);
    return (
        <div className="min-h-screen app-gradient">
            <div className="max-w-4xl mx-auto px-4 pt-20 pb-10 text-center">
                {/* Header Card */}
                <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-emerald-600/20 p-1 shadow-lg">
                    <div className="rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur px-6 py-8 ring-1 ring-black/5">
                        <h1 className="text-4xl font-extrabold tracking-tight">Resume Builder</h1>
                        <p className="mt-3 opacity-80 font-medium">Craft a professional resume with live preview, clean templates, and easy exports.</p>
                        <div className="mt-8 flex flex-wrap gap-4 justify-center">
                            <button 
                                onClick={onStartForm}
                                className="pill-btn pill-primary focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                            >
                                Create New Resume
                            </button>
                            <button 
                                onClick={onManageResumes}
                                className="pill-btn pill-neutral focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            >
                                Manage Resumes
                            </button>
                            <button 
                                onClick={onFilterCheck}
                                className="pill-btn pill-warn focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                                title="Paste a job description to tailor your resume"
                            >
                                Filter Check
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage; 