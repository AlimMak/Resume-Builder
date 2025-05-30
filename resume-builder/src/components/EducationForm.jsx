import React, { useState, useEffect } from 'react';
import { debounce } from './ResumeDisplay';

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

    // Debounce the onSubmit prop
    const debouncedOnSubmit = React.useCallback(debounce(onSubmit, 300), [onSubmit]);

    // Initialize form with initialData if provided
    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setEducationEntries(initialData);
        }
    }, [initialData]);

    // Function to handle changes in any education entry
    const handleEducationChange = (id, field, value) => {
        let newEntries;
        setEducationEntries(prevEntries => {
            newEntries = prevEntries.map(entry => 
                entry.id === id 
                    ? { ...entry, [field]: value }
                    : entry
            );
            debouncedOnSubmit(newEntries); // Call debounced onSubmit on change
            return newEntries;
        });
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
        let newEntries;
        setEducationEntries(prev => {
            newEntries = [...prev, newEntry];
            onSubmit(newEntries); // Call onSubmit immediately on adding entry (adding an entry is a discrete action)
            return newEntries;
        });
    };

    // Function to remove an education entry
    const removeEducationEntry = (id) => {
        // Don't remove if it's the last entry
        if (educationEntries.length > 1) {
            let newEntries;
            setEducationEntries(prev => {
                newEntries = prev.filter(entry => entry.id !== id);
                onSubmit(newEntries); // Call onSubmit immediately on removing entry (removing an entry is a discrete action)
                return newEntries;
            });
        }
    };

    // Function to handle form submission - keep for validation, but onSubmit is now called on change
    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <form onSubmit={handleSubmit} ref={ref}>
            <h2>Education</h2>
            
            {/* Map through all education entries */}
            {educationEntries.map((entry) => (
                <div key={entry.id}>
                    {/* Institution Name Input */}
                    <div>
                        <label>College/University Name:</label>
                        <input
                            type="text"
                            value={entry.institution}
                            onChange={(e) => handleEducationChange(entry.id, 'institution', e.target.value)}
                            placeholder="Enter institution name"
                            required
                        />
                    </div>

                    {/* Degree Input */}
                    <div>
                        <label>Degree:</label>
                        <input
                            type="text"
                            value={entry.degree}
                            onChange={(e) => handleEducationChange(entry.id, 'degree', e.target.value)}
                            placeholder="e.g., Bachelor of Science, Master of Arts"
                            required
                        />
                    </div>

                    {/* College Location Input */}
                    <div>
                        <label>College Location (City, State):</label>
                        <input
                            type="text"
                            value={entry.location}
                            onChange={(e) => handleEducationChange(entry.id, 'location', e.target.value)}
                            placeholder="e.g., Houston, Texas"
                        />
                    </div>

                    {/* Graduation Status Checkbox */}
                    <div>
                        <input
                            type="checkbox"
                            checked={entry.hasGraduated}
                            onChange={(e) => handleEducationChange(entry.id, 'hasGraduated', e.target.checked)}
                        />
                        <label>I have graduated</label>
                    </div>

                    {/* Graduation Date Input */}
                    <div>
                        <label>
                            {entry.hasGraduated ? 'Graduation Date:' : 'Expected Graduation Date:'}
                        </label>
                        <input
                            type="month"
                            value={entry.graduationDate}
                            onChange={(e) => handleEducationChange(entry.id, 'graduationDate', e.target.value)}
                            required
                        />
                    </div>

                    {/* Remove Button (only show if more than one entry) */}
                    {educationEntries.length > 1 && (
                        <button 
                            type="button" 
                            onClick={() => removeEducationEntry(entry.id)}
                        >
                            Remove
                        </button>
                    )}
                </div>
            ))}

            {/* Add New Education Entry Button */}
            <button type="button" onClick={addEducationEntry}>
                Add Another Education
            </button>

            {/* Submit Button */}
            <button type="submit">Next: Work Experience</button>
        </form>
    );
});

export default EducationForm;
