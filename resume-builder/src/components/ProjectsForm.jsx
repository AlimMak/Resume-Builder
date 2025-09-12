import React, { useState, useEffect, useRef } from 'react';
import { useToast } from './ToastProvider';
import { logger } from '../utils/logger';

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
    const toast = useToast();
    const dragIndexRef = useRef(null);

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
            return newEntries;
        });
    };

    // Function to add a new project entry
    const addProjectEntry = () => {
        const newEntry = { ...initialProject, id: Date.now().toString() };
        setProjectEntries(prev => [...prev, newEntry]);
        logger.info('Project added', { id: newEntry.id });
    };

    // Function to remove a project entry
    const removeProjectEntry = (id) => {
        if (projectEntries.length > 1) {
            setProjectEntries(prev => prev.filter(entry => entry.id !== id));
            logger.warn('Project removed', { id });
        }
    };

    // Handle save button click
    const handleSave = (e) => {
        e.preventDefault();
        onSubmit(projectEntries);
        toast.success('Saved projects');
    };

    // Basic DnD reordering for projects
    const moveProject = (fromIndex, toIndex) => {
        setProjectEntries(prev => {
            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            logger.info('Project reordered', { fromIndex, toIndex, id: moved?.id });
            return next;
        });
    };
    const onDragStart = (index) => (e) => {
        dragIndexRef.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };
    const onDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };
    const onDrop = (index) => (e) => {
        e.preventDefault();
        const from = dragIndexRef.current;
        if (from === null || from === index) return;
        moveProject(from, index);
        dragIndexRef.current = null;
    };

    return (
        <form onSubmit={handleSave} ref={ref} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Projects</h2>
            
            {/* Map through all project entries */}
            {projectEntries.map((entry, index) => (
                <div key={entry.id} className="space-y-4 p-4 border rounded" draggable onDragStart={onDragStart(index)} onDragOver={onDragOver} onDrop={onDrop(index)}>
                    <div className="text-sm text-gray-500">Drag handle ▤</div>
                    {/* Project Name Input */}
                    <div className="space-y-2">
                        <label className="block font-medium">Project Name:</label>
                        <input
                            type="text"
                            value={entry.projectName}
                            onChange={(e) => handleProjectChange(entry.id, 'projectName', e.target.value)}
                            placeholder="Enter project name"
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* Role Input */}
                    <div className="space-y-2">
                        <label className="block font-medium">Your Role:</label>
                        <input
                            type="text"
                            value={entry.role}
                            onChange={(e) => handleProjectChange(entry.id, 'role', e.target.value)}
                            placeholder="Enter your role in the project"
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* Project Bullet Points */}
                    <div className="space-y-2">
                        <label className="block font-medium">Project Details & Achievements:</label>
                        {entry.bulletPoints.map((bulletPoint, bulletIndex) => (
                            <div key={bulletIndex} className="flex gap-2">
                                <input
                                    type="text"
                                    value={bulletPoint}
                                    onChange={(e) => handleBulletPointChange(entry.id, bulletIndex, e.target.value)}
                                    placeholder="Enter a bullet point"
                                    className="flex-1 p-2 border rounded"
                                    maxLength={300}
                                />
                                {entry.bulletPoints.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeBulletPoint(entry.id, bulletIndex)}
                                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addBulletPoint(entry.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Add Bullet Point
                        </button>
                    </div>

                    {/* Location Input */}
                    <div className="space-y-2">
                        <label className="block font-medium">Location:</label>
                        <input
                            type="text"
                            value={entry.location}
                            onChange={(e) => handleProjectChange(entry.id, 'location', e.target.value)}
                            placeholder="Enter project location"
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* Start Date Input */}
                    <div className="space-y-2">
                        <label className="block font-medium">Start Date:</label>
                        <input
                            type="month"
                            value={entry.startDate}
                            onChange={(e) => handleProjectChange(entry.id, 'startDate', e.target.value)}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* Current Project Checkbox */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={entry.isCurrent}
                            onChange={(e) => handleProjectChange(entry.id, 'isCurrent', e.target.checked)}
                            className="h-4 w-4"
                        />
                        <label>Currently working on this project</label>
                    </div>

                    {/* End Date Input (only show if not current project) */}
                    {!entry.isCurrent && (
                        <div className="space-y-2">
                            <label className="block font-medium">End Date:</label>
                            <input
                                type="month"
                                value={entry.endDate}
                                onChange={(e) => handleProjectChange(entry.id, 'endDate', e.target.value)}
                                min={entry.startDate}
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    )}

                    {/* Remove Button (only show if more than one entry) */}
                    {projectEntries.length > 1 && (
                        <button 
                            type="button" 
                            onClick={() => removeProjectEntry(entry.id)}
                            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Remove Project
                        </button>
                    )}
                </div>
            ))}

            {/* Add New Project Entry Button */}
            <button 
                type="button" 
                onClick={addProjectEntry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover-glow-primary transition-base"
            >
                Add Another Project
            </button>

            {/* Save Button */}
            <button 
                type="submit"
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 hover-glow-emerald transition-base"
            >
                Save Projects
            </button>
        </form>
    );
});

export default ProjectsForm;
