import React, { useState, useEffect } from 'react';

function SkillsForm({ initialData, onSubmit }) {
    // State to store all skills
    const [skills, setSkills] = useState([]);
    // State to store the current skill being entered
    const [currentSkill, setCurrentSkill] = useState('');

    // Initialize form with initialData if provided
    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setSkills(initialData);
        }
    }, [initialData]);

    // Function to add a new skill
    const addSkill = (e) => {
        e.preventDefault();
        if (currentSkill.trim()) {
            setSkills(prev => [...prev, {
                id: Date.now().toString(),
                name: currentSkill.trim()
            }]);
            setCurrentSkill(''); // Clear the input after adding
        }
    };

    // Function to remove a skill
    const removeSkill = (id) => {
        setSkills(prev => prev.filter(skill => skill.id !== id));
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(skills);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Skills</h2>
            
            {/* Input for new skill */}
            <div>
                <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder="Enter a skill"
                />
                <button 
                    type="button" 
                    onClick={addSkill}
                    disabled={!currentSkill.trim()}
                >
                    Add Skill
                </button>
            </div>

            {/* Display all skills */}
            <div>
                {skills.map((skill) => (
                    <div key={skill.id}>
                        <span>{skill.name}</span>
                        <button 
                            type="button" 
                            onClick={() => removeSkill(skill.id)}
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
}

export default SkillsForm;
