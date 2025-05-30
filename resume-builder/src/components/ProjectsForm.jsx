import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from './ResumeDisplay';

const initialProject = {
    id: '', // Unique identifier
    projectName: '', // Name of the project
    role: '', // Your role in the project
    startDate: '', // Start date
    endDate: '', // End date
    isCurrent: false, // Is this an ongoing project?
    bulletPoints: [''], // Array of bullet points describing the project
    location: '', // Location of the project
};

const ProjectsForm = React.forwardRef(({ initialData, onSubmit }, ref) => {
    const [projectEntries, setProjectEntries] = useState(initialData || []);

    // Debounce the onSubmit prop
    const debouncedOnSubmit = React.useCallback(debounce(onSubmit, 300), [onSubmit]);

    // Initialize form with initialData if provided
    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setProjectEntries(initialData);
        } else {
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

    // Function to handle changes in any project entry
    const handleProjectChange = (id, field, value) => {
        setProjectEntries(prevEntries => 
            prevEntries.map(entry => 
                entry.id === id 
                    ? { ...entry, [field]: value }
                    : entry
            )
        );
        debouncedOnSubmit(projectEntries.map(entry => entry.id === id ? { ...entry, [field]: value } : entry)); // Debounce on change
    };

    // Function to handle changes in a specific bullet point of a project entry
    const handleBulletPointChange = (projectId, pointIndex, value) => {
        setProjectEntries(prevEntries => {
            const newEntries = prevEntries.map(entry => {
                if (entry.id === projectId) {
                    const newBulletPoints = [...entry.bulletPoints];
                    newBulletPoints[pointIndex] = value;
                    return { ...entry, bulletPoints: newBulletPoints };
                }
                return entry;
            });
            debouncedOnSubmit(newEntries); // Debounce bullet point change
            return newEntries;
        });
    };

    // Function to add a new bullet point to a project entry
    const addBulletPoint = (projectId) => {
        setProjectEntries(prevEntries => {
            const newEntries = prevEntries.map(entry => {
                if (entry.id === projectId) {
                    return { ...entry, bulletPoints: [...entry.bulletPoints, ''] };
                }
                return entry;
            });
            onSubmit(newEntries); // Call immediately on adding bullet point
            return newEntries;
        });
    };

    // Function to remove a bullet point from a project entry
    const removeBulletPoint = (projectId, pointIndex) => {
        setProjectEntries(prevEntries => {
            const newEntries = prevEntries.map(entry => {
                if (entry.id === projectId) {
                    const newBulletPoints = entry.bulletPoints.filter((_, i) => i !== pointIndex);
                    return { ...entry, bulletPoints: newBulletPoints };
                }
                return entry;
            });
            onSubmit(newEntries); // Call immediately on removing bullet point
            return newEntries;
        });
    };

    // Function to add a new project entry
    const addProjectEntry = () => {
        const newEntry = { ...initialProject, id: uuidv4() };
        setProjectEntries(prev => {
            const newEntries = [...prev, newEntry];
            onSubmit(newEntries); // Call immediately on adding project
            return newEntries;
        });
    };

    // Function to remove a project entry
    const removeProjectEntry = (id) => {
        if (projectEntries.length > 1) {
            setProjectEntries(prev => {
                const newEntries = prev.filter(entry => entry.id !== id);
                onSubmit(newEntries); // Call immediately on removing project
                return newEntries;
            });
        }
    };

    // Handle form submission - keep for validation, but onSubmit is now called on change
    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log('ProjectsForm - Submitting projects:', projectEntries);
        // onSubmit(projectEntries);
    };

    return (
        <form onSubmit={handleSubmit} ref={ref}>
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
});

export default ProjectsForm;
