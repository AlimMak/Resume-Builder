import React, { useState, useEffect } from 'react';

function ProjectsForm({ initialData, onSubmit }) {
    // State to store all project entries
    const [projectEntries, setProjectEntries] = useState([
        {
            id: '1',
            projectName: '',
            role: '',
            description: '',
            location: '',
            startDate: '',
            endDate: '',
            isCurrent: false
        }
    ]);

    // Initialize form with initialData if provided
    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setProjectEntries(initialData);
        }
    }, [initialData]);

    // Function to handle changes in any project entry
    const handleProjectChange = (id, field, value) => {
        setProjectEntries(prevEntries => 
            prevEntries.map(entry => 
                entry.id === id 
                    ? { ...entry, [field]: value }
                    : entry
            )
        );
    };

    // Function to add a new project entry
    const addProjectEntry = () => {
        const newEntry = {
            id: Date.now().toString(),
            projectName: '',
            role: '',
            description: '',
            location: '',
            startDate: '',
            endDate: '',
            isCurrent: false
        };
        setProjectEntries(prev => [...prev, newEntry]);
    };

    // Function to remove a project entry
    const removeProjectEntry = (id) => {
        if (projectEntries.length > 1) {
            setProjectEntries(prev => 
                prev.filter(entry => entry.id !== id)
            );
        }
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(projectEntries);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Projects</h2>
            
            {/* Map through all project entries */}
            {projectEntries.map((entry) => (
                <div key={entry.id}>
                    {/* Project Name Input */}
                    <div>
                        <label>Project Name:</label>
                        <input
                            type="text"
                            value={entry.projectName}
                            onChange={(e) => handleProjectChange(entry.id, 'projectName', e.target.value)}
                            placeholder="Enter project name"
                            required
                        />
                    </div>

                    {/* Role Input */}
                    <div>
                        <label>Your Role:</label>
                        <input
                            type="text"
                            value={entry.role}
                            onChange={(e) => handleProjectChange(entry.id, 'role', e.target.value)}
                            placeholder="Enter your role in the project"
                            required
                        />
                    </div>

                    {/* Project Description */}
                    <div>
                        <label>Project Description:</label>
                        <textarea
                            value={entry.description}
                            onChange={(e) => handleProjectChange(entry.id, 'description', e.target.value)}
                            placeholder="Describe the project and its functionality"
                            required
                            rows="4"
                        />
                    </div>

                    {/* Location Input */}
                    <div>
                        <label>Location:</label>
                        <input
                            type="text"
                            value={entry.location}
                            onChange={(e) => handleProjectChange(entry.id, 'location', e.target.value)}
                            placeholder="Enter project location"
                            required
                        />
                    </div>

                    {/* Start Date Input */}
                    <div>
                        <label>Start Date:</label>
                        <input
                            type="month"
                            value={entry.startDate}
                            onChange={(e) => handleProjectChange(entry.id, 'startDate', e.target.value)}
                            required
                        />
                    </div>

                    {/* Current Project Checkbox */}
                    <div>
                        <input
                            type="checkbox"
                            checked={entry.isCurrent}
                            onChange={(e) => handleProjectChange(entry.id, 'isCurrent', e.target.checked)}
                        />
                        <label>Currently working on this project</label>
                    </div>

                    {/* End Date Input (only show if not current project) */}
                    {!entry.isCurrent && (
                        <div>
                            <label>End Date:</label>
                            <input
                                type="month"
                                value={entry.endDate}
                                onChange={(e) => handleProjectChange(entry.id, 'endDate', e.target.value)}
                                min={entry.startDate}
                                required
                            />
                        </div>
                    )}

                    {/* Remove Button (only show if more than one entry) */}
                    {projectEntries.length > 1 && (
                        <button 
                            type="button" 
                            onClick={() => removeProjectEntry(entry.id)}
                        >
                            Remove
                        </button>
                    )}
                </div>
            ))}

            {/* Add New Project Entry Button */}
            <button type="button" onClick={addProjectEntry}>
                Add Another Project
            </button>

            {/* Submit Button */}
            <button type="submit">Next</button>
        </form>
    );
}

export default ProjectsForm;
