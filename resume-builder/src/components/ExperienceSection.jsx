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
function ExperienceSection({ initialData, onSubmit }) {
  // State stores an array of experiences
  const [experiences, setExperiences] = useState([
    { ...initialExperience, id: '1' } // Start with one empty experience
  ]);

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
    setExperiences([
      ...experiences, // Keep existing experiences
      { ...initialExperience, id: Date.now().toString() } // Add new one
    ]);
  };

  // Removes an experience (but keeps at least one)
  const removeExperience = (id) => {
    if (experiences.length > 1) {
      // Filter out the experience with matching ID
      setExperiences(experiences.filter(exp => exp.id !== id));
    } else {
      // If it's the last one, reset it instead
      setExperiences([{ ...initialExperience, id: '1' }]);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log('ExperienceSection - Submitting experiences:', experiences);
    onSubmit(experiences);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Work Experience</h2>
      
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
      <button type="button" onClick={addNewExperience}>
        Add Another Experience
      </button>

      {/* Submit Button */}
      <button type="submit">Next: Projects</button>
    </form>
  );
}

export default ExperienceSection;