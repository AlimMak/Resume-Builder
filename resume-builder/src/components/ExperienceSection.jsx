import React, { useState, useEffect } from 'react';
import ExperienceForm from './ExperienceForm';

// Same initial structure as before
const initialExperience = {
  id: '',
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  current: false,
  bulletPoints: [''],
  location: '',
  remote: false,
  employmentType: 'full-time'
};

// This component manages ALL job experiences
const ExperienceSection = React.forwardRef(({ initialData, onSubmit }, ref) => {
  // State stores an array of experiences
  const [experiences, setExperiences] = useState(initialData || []);

  // Initialize form with initialData if provided
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setExperiences(initialData);
    }
  }, [initialData]);

  // Updates a specific experience when its form changes
  const handleExperienceChange = (id, updatedExperience) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? updatedExperience : exp // Replace the matching experience
    ));
  };

  // Adds a new empty experience
  const addNewExperience = () => {
    const newExperiences = [
      ...experiences, // Keep existing experiences
      { ...initialExperience, id: Date.now().toString() } // Add new one
    ];
    setExperiences(newExperiences);
  };

  // Removes an experience (but keeps at least one)
  const removeExperience = (id) => {
    if (experiences.length > 1) {
      // Filter out the experience with matching ID
      const newExperiences = experiences.filter(exp => exp.id !== id);
      setExperiences(newExperiences);
    } else {
      // If it's the last one, reset it instead
      const newExperiences = [{ ...initialExperience, id: '1' }];
      setExperiences(newExperiences);
    }
  };

  // Handle save button click
  const handleSave = (e) => {
    e.preventDefault();
    onSubmit(experiences);
  };

  return (
    <form onSubmit={handleSave} ref={ref} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Work Experience</h2>
      
      {/* Render an ExperienceForm for each experience */}
      {experiences.map((experience) => (
        <ExperienceForm
          key={experience.id} // Helps React track components
          experience={experience} // Pass the experience data
          onChange={(updatedExp) => handleExperienceChange(experience.id, updatedExp)}
          onRemove={() => removeExperience(experience.id)}
        />
      ))}
      
      {/* Button to add more experiences */}
      <button 
        type="button" 
        onClick={addNewExperience}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Another Experience
      </button>

      {/* Save Button */}
      <button 
        type="submit"
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Save Work Experience
      </button>
    </form>
  );
});

export default ExperienceSection;