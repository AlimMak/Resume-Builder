import React from 'react';

// This defines what a single job experience looks like
const initialExperience = {
  id: '',         // Unique identifier for each experience
  company: '',    // Company name
  position: '',   // Job title
  startDate: '',  // When the job started
  endDate: '',    // When the job ended
  current: false, // Is this a current job?
  description: '',// Job responsibilities
  location: '',   // Physical location
  remote: false,  // Is this a remote job?
  employmentType: 'full-time' // Job type
};

// This component displays and manages ONE job experience form
function ExperienceForm({ experience, onChange, onRemove }) {
  
  // Handles changes to any form field
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Updates the parent component with new values
    onChange({
      ...experience,         // Keep existing values
      [name]: type === 'checkbox' ? checked : value // Update changed field
    });
  };

  return (
    <div>
      {/* Company Name Field */}
      <div>
        <label>Company Name</label>
        <input
          type="text"
          name="company"
          value={experience.company}
          onChange={handleChange}
          required
        />
      </div>
      
      {/* Position Title Field */}
      <div>
        <label>Position Title</label>
        <input
          type="text"
          name="position"
          value={experience.position}
          onChange={handleChange}
          required
        />
      </div>
      
      {/* Start Date Field */}
      <div>
        <label>Start Date</label>
        <input
          type="month"  // Special input for month/year
          name="startDate"
          value={experience.startDate}
          onChange={handleChange}
          required
        />
      </div>
      
      {/* Conditional End Date Field */}
      <div>
        <label>End Date</label>
        {experience.current ? (
          // Shows "Present" if current job
          <input type="text" value="Present" disabled />
        ) : (
          // Shows date picker if not current job
          <input
            type="month"
            name="endDate"
            value={experience.endDate}
            onChange={handleChange}
            min={experience.startDate} // Can't end before start
          />
        )}
      </div>
      
      {/* Current Job Checkbox */}
      <div>
        <input
          type="checkbox"
          name="current"
          checked={experience.current}
          onChange={handleChange}
        />
        <label>I currently work here</label>
      </div>
      
      {/* Remote Job Checkbox */}
      <div>
        <input
          type="checkbox"
          name="remote"
          checked={experience.remote}
          onChange={handleChange}
        />
        <label>Remote Position</label>
      </div>
      
      {/* Location Field (only shows if not remote) */}
      {!experience.remote && (
        <div>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={experience.location}
            onChange={handleChange}
          />
        </div>
      )}
      
      {/* Job Type Dropdown */}
      <div>
        <label>Employment Type</label>
        <select
          name="employmentType"
          value={experience.employmentType}
          onChange={handleChange}
        >
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Internship</option>
        </select>
      </div>
      
      {/* Job Description Textarea */}
      <div>
        <label>Position Description</label>
        <textarea
          name="description"
          value={experience.description}
          onChange={handleChange}
          rows={4}
          required
        />
      </div>
      
      {/* Remove Button */}
      <button type="button" onClick={onRemove}>
        Remove Experience
      </button>
    </div>
  );
}

export default ExperienceForm;