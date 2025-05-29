import React from 'react';

// This defines what a single job experience looks like
const initialExperience = {
  id: '',         // Unique identifier for each experience
  company: '',    // Company name
  position: '',   // Job title
  startDate: '',  // When the job started
  endDate: '',    // When the job ended
  current: false, // Is this a current job?
  bulletPoints: [''], // Changed from description to an array of bullet points
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

  // Handle changes to a specific bullet point
  const handleBulletPointChange = (index, value) => {
    const newBulletPoints = [...experience.bulletPoints];
    newBulletPoints[index] = value;
    onChange({
      ...experience,
      bulletPoints: newBulletPoints
    });
  };

  // Add a new empty bullet point
  const handleAddBulletPoint = () => {
    onChange({
      ...experience,
      bulletPoints: [...experience.bulletPoints, '']
    });
  };

  // Remove a bullet point by index
  const handleRemoveBulletPoint = (index) => {
    const newBulletPoints = experience.bulletPoints.filter((_, i) => i !== index);
    onChange({
      ...experience,
      bulletPoints: newBulletPoints
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
      
      {/* Bullet Points Section */}
      <div>
        <label>Responsibilities & Achievements</label>
        {/* Map over bulletPoints array to render input for each */}
        {experience.bulletPoints.map((bulletPoint, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={bulletPoint}
              onChange={(e) => handleBulletPointChange(index, e.target.value)}
              placeholder="Enter a bullet point"
              style={{ flex: 1 }}
              maxLength={300}
            />
            {/* Show remove button only if there is more than one bullet point */}
            {experience.bulletPoints.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveBulletPoint(index)}
                style={{ padding: '4px 8px' }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {/* Button to add a new bullet point */}
        <button
          type="button"
          onClick={handleAddBulletPoint}
          style={{ marginTop: '8px' }}
        >
          Add Bullet Point
        </button>
      </div>
      
      {/* Remove Button */}
      <button type="button" onClick={onRemove}>
        Remove Experience
      </button>
    </div>
  );
}

export default ExperienceForm;