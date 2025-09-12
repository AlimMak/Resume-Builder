import React, { useRef, useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { logger } from '../utils/logger';

const SkillsForm = React.forwardRef(({ initialData, onSubmit }, ref) => {
    const [skills, setSkills] = useState(initialData || []); // Initialize with an empty array
    const [currentSkill, setCurrentSkill] = useState(''); // State for the skill currently being entered
    const toast = useToast();
    const dragIndexRef = useRef(null);

    // Initialize form with initialData if provided
    useEffect(() => {
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
            setSkills(prev => [...prev, currentSkill.trim()]);
            setCurrentSkill(''); // Clear the input after adding
            logger.info('Skill added');
        }
    };

    // Function to remove a skill entry
    const removeSkillEntry = (index) => {
        setSkills(prev => prev.filter((_, i) => i !== index));
        logger.warn('Skill removed', { index });
    };

    // Handle save button click
    const handleSave = (e) => {
        e.preventDefault();
        onSubmit(skills);
        toast.success('Saved skills');
    };

    // Reorder skills by drag and drop
    const moveSkill = (fromIndex, toIndex) => {
        setSkills(prev => {
            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            logger.info('Skill reordered', { fromIndex, toIndex });
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
        moveSkill(from, index);
        dragIndexRef.current = null;
    };

    return (
        <form onSubmit={handleSave} ref={ref} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Skills</h2>
            
            {/* Input for new skill */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={currentSkill}
                    onChange={handleCurrentSkillChange}
                    placeholder="Enter a skill"
                    className="flex-1 p-2 border rounded"
                />
                <button 
                    type="button" 
                    onClick={addSkillEntry}
                    disabled={!currentSkill.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover-glow-primary transition-base disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Add Skill
                </button>
            </div>

            {/* Display all skills */}
            <div className="space-y-2">
                {skills.map((skill, index) => (
                    <div key={index} className="flex gap-2" draggable onDragStart={onDragStart(index)} onDragOver={onDragOver} onDrop={onDrop(index)}>
                        <span className="text-sm text-gray-500 pt-2">▤</span>
                        <input
                            type="text"
                            value={skill}
                            onChange={(e) => handleExistingSkillChange(index, e.target.value)}
                            placeholder="Enter a skill"
                            className="flex-1 p-2 border rounded"
                        />
                        <button 
                            type="button" 
                            onClick={() => removeSkillEntry(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 hover-elevate transition-base"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Save Button */}
            <button 
                type="submit"
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 hover-glow-emerald transition-base"
            >
                Save Skills
            </button>
        </form>
    );
});

export default SkillsForm;
