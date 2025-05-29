import React, { useState, useEffect } from 'react';

function ProjectsForm({ initialData, onSubmit }) {
    // State to store all project entries
    const [projectEntries, setProjectEntries] = useState([
        {
            id: '1',
            projectName: '',
            role: '',
            bulletPoints: [''],
            location: '',
            startDate: '',
            endDate: '',
            isCurrent: false
        }
    ]);

    // Initialize form with initialData if provided
    useEffect(() => {
        console.log('ProjectsForm - Received initialData:', initialData);
        if (initialData && initialData.length > 0) {
            console.log('ProjectsForm - Setting project entries from initialData');
            setProjectEntries(initialData);
        } else {
            console.log('ProjectsForm - Using default project entry');
            setProjectEntries([{
                id: '1',
                projectName: '',
                role: '',
                bulletPoints: [''],
                location: '',
                startDate: '',
                endDate: '',
                isCurrent: false
            }]);
        }
    }, [initialData]);

    // Function to handle changes in any project entry field (except bullet points)
    const handleProjectChange = (id, field, value) => {
        setProjectEntries(prevEntries => 
            prevEntries.map(entry => 
                entry.id === id 
                    ? { ...entry, [field]: value }
                    : entry
            )
        );
    };

    // Function to handle changes to a specific bullet point in a project entry
    const handleBulletPointChange = (projectId, bulletIndex, value) => {
        setProjectEntries(prevEntries =>
            prevEntries.map(entry => {
                if (entry.id === projectId) {
                    const newBulletPoints = [...entry.bulletPoints];
                    newBulletPoints[bulletIndex] = value;
                    return { ...entry, bulletPoints: newBulletPoints };
                }
                return entry;
            })
        );
    };

    // Function to add a new empty bullet point to a specific project entry
    const addBulletPoint = (projectId) => {
        setProjectEntries(prevEntries =>
            prevEntries.map(entry => {
                if (entry.id === projectId) {
                    return {
                        ...entry,
                        bulletPoints: [...entry.bulletPoints, '']
                    };
                }
                return entry;
            })
        );
    };

    // Function to remove a bullet point from a specific project entry by index
    const removeBulletPoint = (projectId, bulletIndex) => {
        setProjectEntries(prevEntries =>
            prevEntries.map(entry => {
                if (entry.id === projectId) {
                    const newBulletPoints = entry.bulletPoints.filter((_, index) => index !== bulletIndex);
                    return {
                        ...entry,
                        // Ensure there is always at least one empty bullet point
                        bulletPoints: newBulletPoints.length > 0 ? newBulletPoints : ['']
                    };
                }
                return entry;
            })
        );
    };

    // Function to add a new project entry with a default empty bullet point
    const addProjectEntry = () => {
        const newEntry = {
            id: Date.now().toString(),
            projectName: '',
            role: '',
            bulletPoints: [''],
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

                    {/* Project Bullet Points */}
                    <div>
                        <label>Project Details & Achievements:</label>
                        {entry.bulletPoints.map((bulletPoint, bulletIndex) => (
                            <div key={bulletIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input
                                    type="text"
                                    value={bulletPoint}
                                    onChange={(e) => handleBulletPointChange(entry.id, bulletIndex, e.target.value)}
                                    placeholder="Enter a bullet point"
                                    style={{ flex: 1 }}
                                    maxLength={300}
                                />
                                {entry.bulletPoints.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeBulletPoint(entry.id, bulletIndex)}
                                        style={{ padding: '4px 8px' }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addBulletPoint(entry.id)}
                            style={{ marginTop: '8px' }}
                        >
                            Add Bullet Point
                        </button>
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
                            Remove Project
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
