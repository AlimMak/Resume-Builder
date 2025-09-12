import React, { useEffect, useRef, useState } from 'react';
import ExperienceForm from './ExperienceForm';
import { useToast } from './ToastProvider';
import { logger } from '../utils/logger';
import { useUndoRedo } from '../utils/useUndoRedo';

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
  // Toast for user feedback
  const toast = useToast();

  // Undo/redo-enabled state for the experiences list
  const { state: experiences, set: setExperiences, undo, redo, canUndo, canRedo } = useUndoRedo(initialData || []);

  // Track drag source index for DnD reordering
  const dragIndexRef = useRef(null);

  // Initialize form with initialData if provided
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setExperiences(initialData);
    }
  }, [initialData, setExperiences]);

  // Updates a specific experience when its form changes
  const handleExperienceChange = (id, updatedExperience) => {
    setExperiences(prev => prev.map(exp => exp.id === id ? updatedExperience : exp));
  };

  // Adds a new empty experience
  const addNewExperience = () => {
    const newExp = { ...initialExperience, id: Date.now().toString() };
    setExperiences(prev => [...prev, newExp]);
    logger.info('Experience added', { id: newExp.id });
  };

  // Removes an experience (but keeps at least one)
  const removeExperience = (id) => {
    setExperiences(prev => {
      if (prev.length > 1) {
        logger.warn('Experience removed', { id });
        return prev.filter(exp => exp.id !== id);
      }
      logger.warn('Last experience reset');
      return [{ ...initialExperience, id: '1' }];
    });
  };

  // Reorder helper using indices
  const moveExperience = (fromIndex, toIndex) => {
    setExperiences(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      logger.info('Experience reordered', { fromIndex, toIndex, id: moved?.id });
      return next;
    });
  };

  // Drag handlers
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
    moveExperience(from, index);
    dragIndexRef.current = null;
  };

  // Handle save button click
  const handleSave = (e) => {
    e.preventDefault();
    onSubmit(experiences);
    toast.success('Saved work experience');
  };

  return (
    <form onSubmit={handleSave} ref={ref} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Work Experience</h2>
        <div className="flex gap-2">
          <button type="button" onClick={undo} disabled={!canUndo} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 hover-elevate transition-base">Undo</button>
          <button type="button" onClick={redo} disabled={!canRedo} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 hover-elevate transition-base">Redo</button>
        </div>
      </div>
      
      {/* Render an ExperienceForm for each experience */}
      {experiences.map((experience, index) => (
        <div key={experience.id} draggable onDragStart={onDragStart(index)} onDragOver={onDragOver} onDrop={onDrop(index)}>
          <div className="text-sm text-gray-500 mb-1">Drag handle ▤</div>
          <ExperienceForm
            experience={experience}
            onChange={(updatedExp) => handleExperienceChange(experience.id, updatedExp)}
            onRemove={() => removeExperience(experience.id)}
          />
        </div>
      ))}
      
      {/* Button to add more experiences */}
      <button 
        type="button" 
        onClick={addNewExperience}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover-glow-primary transition-base"
      >
        Add Another Experience
      </button>

      {/* Save Button */}
      <button 
        type="submit"
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 hover-glow-emerald transition-base"
      >
        Save Work Experience
      </button>
    </form>
  );
});

export default ExperienceSection;