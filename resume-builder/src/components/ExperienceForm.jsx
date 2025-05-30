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
    const updatedExperience = {
      ...experience,         // Keep existing values
      [name]: type === 'checkbox' ? checked : value // Update changed field
    };
    onChange(updatedExperience);
  };

  // Handle changes to a specific bullet point
  const handleBulletPointChange = (index, value) => {
    const newBulletPoints = [...experience.bulletPoints];
    newBulletPoints[index] = value;
    const updatedExperience = {
      ...experience,
      bulletPoints: newBulletPoints
    };
    onChange(updatedExperience);
  };

  // Add a new empty bullet point
  const handleAddBulletPoint = () => {
    const updatedExperience = {
      ...experience,
      bulletPoints: [...experience.bulletPoints, '']
    };
    onChange(updatedExperience);
  };

  // Remove a bullet point by index
  const handleRemoveBulletPoint = (index) => {
    const newBulletPoints = experience.bulletPoints.filter((_, i) => i !== index);
    const updatedExperience = {
      ...experience,
      bulletPoints: newBulletPoints
    };
    onChange(updatedExperience);
  };

  return (
    <div className="space-y-4 p-4 border rounded">
      {/* Company Name Field */}
      <div className="space-y-2">
        <label className="block font-medium">Company Name</label>
        <input
          type="text"
          name="company"
          value={experience.company}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Position Title Field */}
      <div className="space-y-2">
        <label className="block font-medium">Position Title</label>
        <input
          type="text"
          name="position"
          value={experience.position}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Start Date Field */}
      <div className="space-y-2">
        <label className="block font-medium">Start Date</label>
        <input
          type="month"  // Special input for month/year
          name="startDate"
          value={experience.startDate}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Conditional End Date Field */}
      <div className="space-y-2">
        <label className="block font-medium">End Date</label>
        {experience.current ? (
          // Shows "Present" if current job
          <input 
            type="text" 
            value="Present" 
            disabled 
            className="w-full p-2 border rounded bg-gray-100"
          />
        ) : (
          // Shows date picker if not current job
          <input
            type="month"
            name="endDate"
            value={experience.endDate}
            onChange={handleChange}
            min={experience.startDate} // Can't end before start
            className="w-full p-2 border rounded"
          />
        )}
      </div>
      
      {/* Current Job Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="current"
          checked={experience.current}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <label>I currently work here</label>
      </div>
      
      {/* Remote Job Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="remote"
          checked={experience.remote}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <label>Remote Position</label>
      </div>
      
      {/* Location Field (only shows if not remote) */}
      {!experience.remote && (
        <div className="space-y-2">
          <label className="block font-medium">Location</label>
          <input
            type="text"
            name="location"
            value={experience.location}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
      )}
      
      {/* Job Type Dropdown */}
      <div className="space-y-2">
        <label className="block font-medium">Employment Type</label>
        <select
          name="employmentType"
          value={experience.employmentType}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Internship</option>
        </select>
      </div>
      
      {/* Bullet Points Section */}
      <div className="space-y-2">
        <label className="block font-medium">Responsibilities & Achievements</label>
        {/* Map over bulletPoints array to render input for each */}
        {experience.bulletPoints.map((bulletPoint, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={bulletPoint}
              onChange={(e) => handleBulletPointChange(index, e.target.value)}
              placeholder="Enter a bullet point"
              className="flex-1 p-2 border rounded"
              maxLength={300}
            />
            {/* Show remove button only if there is more than one bullet point */}
            {experience.bulletPoints.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveBulletPoint(index)}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Bullet Point
        </button>
      </div>
      
      {/* Remove Button */}
      <button 
        type="button" 
        onClick={onRemove}
        className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Remove Experience
      </button>
    </div>
  );
}

export default ExperienceForm;