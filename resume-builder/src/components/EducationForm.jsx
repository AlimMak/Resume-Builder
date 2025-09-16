import React, { useState, useEffect, useImperativeHandle } from 'react';
import { useToast } from './ToastProvider';
import { logger } from '../utils/logger';

const EducationForm = React.forwardRef(({ initialData, onSubmit }, ref) => {
    // State to store all education entries
    const [educationEntries, setEducationEntries] = useState([
        {
            id: '1',
            institution: '',
            degree: '',
            location: '',
            graduationDate: '',
            hasGraduated: false
        }
    ]);

    const toast = useToast();

    // Initialize form with initialData if provided
    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setEducationEntries(initialData);
        }
    }, [initialData]);

    // Expose current entries to parent for global Save
    useImperativeHandle(ref, () => ({
        getData: () => educationEntries
    }), [educationEntries]);

    // Function to handle changes in any education entry
    const handleEducationChange = (id, field, value) => {
        setEducationEntries(prevEntries => 
            prevEntries.map(entry => 
                entry.id === id 
                    ? { ...entry, [field]: value }
                    : entry
            )
        );
    };

    // Function to add a new education entry
    const addEducationEntry = () => {
        const newEntry = {
            id: Date.now().toString(), // Generate unique ID
            institution: '',
            degree: '',
            location: '',
            graduationDate: '',
            hasGraduated: false
        };
        setEducationEntries(prev => [...prev, newEntry]);
        logger.info('Education added', { id: newEntry.id });
    };

    // Function to remove an education entry
    const removeEducationEntry = (id) => {
        // Don't remove if it's the last entry
        if (educationEntries.length > 1) {
            setEducationEntries(prev => prev.filter(entry => entry.id !== id));
            logger.warn('Education removed', { id });
        }
    };

    // Function to handle form submission
    const handleSave = (e) => {
        e.preventDefault();
        onSubmit(educationEntries);
        toast.success('Saved education');
    };

    return (
        <form onSubmit={handleSave} ref={ref} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Education</h2>
            
            {/* Map through all education entries */}
            {educationEntries.map((entry) => (
                <div key={entry.id} className="space-y-4 p-4 border rounded">
                    {/* Institution Name Input */}
                    <div className="space-y-2">
                        <label className="block font-medium">College/University Name:</label>
                        <input
                            type="text"
                            value={entry.institution}
                            onChange={(e) => handleEducationChange(entry.id, 'institution', e.target.value)}
                            placeholder="Enter institution name"
                            required
                            className="w-full input-glass"
                        />
                    </div>

                    {/* Degree Input */}
                    <div className="space-y-2">
                        <label className="block font-medium">Degree:</label>
                        <input
                            type="text"
                            value={entry.degree}
                            onChange={(e) => handleEducationChange(entry.id, 'degree', e.target.value)}
                            placeholder="e.g., Bachelor of Science, Master of Arts"
                            required
                            className="w-full input-glass"
                        />
                    </div>

                    {/* College Location Input */}
                    <div className="space-y-2">
                        <label className="block font-medium">College Location (City, State):</label>
                        <input
                            type="text"
                            value={entry.location}
                            onChange={(e) => handleEducationChange(entry.id, 'location', e.target.value)}
                            placeholder="e.g., Houston, Texas"
                            className="w-full input-glass"
                        />
                    </div>

                    {/* Graduation Status Checkbox */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={entry.hasGraduated}
                            onChange={(e) => handleEducationChange(entry.id, 'hasGraduated', e.target.checked)}
                            className="h-4 w-4"
                        />
                        <label>I have graduated</label>
                    </div>

                    {/* Graduation Date Input */}
                    <div className="space-y-2">
                        <label className="block font-medium">
                            {entry.hasGraduated ? 'Graduation Date:' : 'Expected Graduation Date:'}
                        </label>
                        <input
                            type="month"
                            value={entry.graduationDate}
                            onChange={(e) => handleEducationChange(entry.id, 'graduationDate', e.target.value)}
                            required
                            className="w-full input-glass"
                        />
                    </div>

                    {/* Remove Button (only show if more than one entry) */}
                    {educationEntries.length > 1 && (
                        <button 
                            type="button" 
                            onClick={() => removeEducationEntry(entry.id)}
                            className="pill-btn pill-danger"
                        >
                            Remove
                        </button>
                    )}
                </div>
            ))}

            {/* Add New Education Entry Button */}
            <button 
                type="button" 
                onClick={addEducationEntry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Add Another Education
            </button>

            {/* Save Button */}
            <button 
                type="submit"
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
                Save Education Information
            </button>
        </form>
    );
});

export default EducationForm;
