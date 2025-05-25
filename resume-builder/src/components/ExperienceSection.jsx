import React, { useState } from 'react';
import ExperienceForm from './ExperienceForm';

// Same initial structure as before
const initialExperience = {
  id: '',
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  location: '',
  remote: false,
  employmentType: 'full-time'
};

// This component manages ALL job experiences
function ExperienceSection() {
  // State stores an array of experiences
  const [experiences, setExperiences] = useState([
    { ...initialExperience, id: '1' } // Start with one empty experience
  ]);

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

  return (
    <div>
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
    </div>
  );
}

export default ExperienceSection;