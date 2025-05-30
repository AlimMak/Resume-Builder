import React, { useState, useEffect } from 'react';
import { debounce } from './ResumeDisplay';

const SkillsForm = React.forwardRef(({ initialData, onSubmit }, ref) => {
    const [skills, setSkills] = useState(initialData || []); // Initialize with an empty array
    const [currentSkill, setCurrentSkill] = useState(''); // State for the skill currently being entered

    // Debounce the onSubmit prop
    const debouncedOnSubmit = React.useCallback(debounce(onSubmit, 300), [onSubmit]);

    // Initialize form with initialData if provided
    useEffect(() => {
        console.log('SkillsForm - Received initialData:', initialData);
        // Ensure initialData is an array of strings, defaulting to empty if not valid
        if (Array.isArray(initialData) && initialData.every(skill => typeof skill === 'string')) {
            setSkills(initialData);
        } else {
            setSkills([]); // Default to empty array if initialData is not valid
        }
    }, [initialData]);

    // Function to handle changes in an existing skill entry
    const handleExistingSkillChange = (index, value) => {
        setSkills(prevSkills => {
            const newSkills = [...prevSkills];
            newSkills[index] = value;
            debouncedOnSubmit(newSkills); // Debounce on change for existing skills
            return newSkills;
        });
    };

    // Function to handle input change for the current skill being added
    const handleCurrentSkillChange = (e) => {
        setCurrentSkill(e.target.value);
    };

    // Function to add the current skill to the skills list
    const addSkillEntry = () => {
        if (currentSkill.trim()) { // Only add if the input is not empty
            const newSkills = [...skills, currentSkill.trim()];
            setSkills(newSkills);
            setCurrentSkill(''); // Clear the input after adding
            // Defer the state update to avoid render-related issues
            setTimeout(() => {
                onSubmit(newSkills); // Call immediately on adding skill
            }, 0);
        }
    };

    // Function to remove a skill entry
    const removeSkillEntry = (index) => {
        // Don't remove if it's the last entry
        if (skills.length > 0) { // Allow removing the last skill
            setSkills(prev => {
                const newSkills = prev.filter((_, i) => i !== index);
                // Defer the state update to avoid render-related issues
                setTimeout(() => {
                    onSubmit(newSkills); // Call immediately on removing skill
                }, 0);
                return newSkills;
            });
        }
    };

    // Handle form submission - keep for validation, but onSubmit is now called on change
    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log('SkillsForm - Submitting skills:', skills);
        // onSubmit(skills);
    };

    return (
        <form onSubmit={handleSubmit} ref={ref}>
            <h2>Skills</h2>
            
            {/* Input for new skill */}
            <div>
                <input
                    type="text"
                    value={currentSkill}
                    onChange={handleCurrentSkillChange}
                    placeholder="Enter a skill"
                />
                <button 
                    type="button" 
                    onClick={addSkillEntry}
                    disabled={!currentSkill.trim()}
                >
                    Add Skill
                </button>
            </div>

            {/* Display all skills */}
            <div>
                {skills.map((skill, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                            type="text"
                            value={skill}
                            onChange={(e) => handleExistingSkillChange(index, e.target.value)}
                            placeholder="Enter a skill"
                            style={{ flex: 1 }}
                        />
                        <button 
                            type="button" 
                            onClick={() => removeSkillEntry(index)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <button type="submit">Next</button>
        </form>
    );
});

export default SkillsForm;
