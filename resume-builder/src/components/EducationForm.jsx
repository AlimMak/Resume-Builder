import React, { useState, useEffect } from 'react';

function EducationForm({ initialData, onSubmit }) {
    // State to store all education entries
    const [educationEntries, setEducationEntries] = useState([
        {
            id: '1',
            institution: '',
            graduationDate: '',
            hasGraduated: false
        }
    ]);

    // Initialize form with initialData if provided
    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setEducationEntries(initialData);
        }
    }, [initialData]);

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
            graduationDate: '',
            hasGraduated: false
        };
        setEducationEntries(prev => [...prev, newEntry]);
    };

    // Function to remove an education entry
    const removeEducationEntry = (id) => {
        // Don't remove if it's the last entry
        if (educationEntries.length > 1) {
            setEducationEntries(prev => 
                prev.filter(entry => entry.id !== id)
            );
        }
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(educationEntries);
    };

    return (
        <form onSubmit={handleSubmit}>
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
}

export default EducationForm;
