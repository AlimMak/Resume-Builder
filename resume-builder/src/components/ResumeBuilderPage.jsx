import { useEffect, useRef, useState } from 'react';
import ResumeDisplay from './ResumeDisplay';
import PersonalInfoForm from './PersonalInfoForm';
import EducationForm from './EducationForm';
import ExperienceSection from './ExperienceSection';
import ProjectsForm from './ProjectsForm';
import SkillsForm from './SkillsForm';
import { createEmptyFormData, createResume, getResume, renameResume, updateResume } from '../utils/resumeDb';
import { logger } from '../utils/logger';
import { useToast } from './ToastProvider';

function ResumeBuilderPage({ onGoHome, onGoManage, resumeId, onRenameCurrent }) {
  // Keep track of the currently hovered section for highlighting
  const [hoveredSection, setHoveredSection] = useState(null);

  // Track all the resume information (loaded from IndexedDB)
  const [formData, setFormData] = useState(createEmptyFormData());
  const [loadedId, setLoadedId] = useState(resumeId || null);
  const [resumeName, setResumeName] = useState('');
  const [dirty, setDirty] = useState(false);
  const hydratingRef = useRef(false);
  const toast = useToast();

  // Load current resume by id
  useEffect(() => {
    const load = async () => {
      try {
        if (!resumeId) return;
        const rec = await getResume(resumeId);
        if (rec) {
          hydratingRef.current = true;
          setFormData(rec.data || createEmptyFormData());
          setLoadedId(rec.id);
          setResumeName(rec.name || '');
          setDirty(false);
          logger.info('Loaded resume into builder', { id: rec.id, name: rec.name });
        }
      } catch (err) {
        logger.error('Failed to load resume', { message: err?.message });
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  // Mark dirty on changes so we can prompt before navigation
  useEffect(() => {
    if (hydratingRef.current) {
      hydratingRef.current = false;
      return;
    }
    setDirty(true);
  }, [formData]);

  // Warn the user before closing/reloading if there are unsaved changes
  useEffect(() => {
    const handler = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Toolbar actions: Save, Save As (duplicate), Rename handled via App-level navigation for Save As; here implement Save and Rename
  const handleSave = async () => {
    try {
      if (!loadedId) return;
      await updateResume(loadedId, { data: formData });
      setDirty(false);
      toast.success('Saved changes', { id: loadedId });
    } catch (err) {
      logger.error('Save failed', { message: err?.message });
      toast.error('Failed to save');
    }
  };

  const handleRename = async () => {
    const next = prompt('Enter a new name for this resume:', resumeName || '');
    if (next == null) return;
    const trimmed = next.trim();
    if (!trimmed) return;
    try {
      const updated = await renameResume(loadedId, trimmed);
      setResumeName(updated.name);
      onRenameCurrent?.(updated.name);
      toast.success('Renamed');
    } catch (err) {
      logger.error('Rename failed', { message: err?.message });
      toast.error('Rename failed');
    }
  };

  // Save current data into a new resume record (Save As)
  const handleSaveAs = async () => {
    try {
      const base = prompt('Enter a name for the duplicate:', resumeName || 'Untitled Resume');
      if (base == null) return;
      const trimmed = (base || '').trim();
      if (!trimmed) return;
      const created = await createResume({ name: trimmed, data: formData });
      setLoadedId(created.id);
      setResumeName(created.name);
      setDirty(false);
      toast.success('Saved as new resume', { id: created.id });
      logger.info('Save As created resume', { from: resumeId, to: created.id });
    } catch (err) {
      logger.error('Save As failed', { message: err?.message });
      toast.error('Save As failed');
    }
  };

  // Handlers for individual form section updates
  const handlePersonalInfoUpdate = (data) => {
      setFormData(prev => ({ ...prev, personalInfo: data }));
  };
  const handleEducationUpdate = (data) => {
      setFormData(prev => ({ ...prev, education: data }));
  };
  const handleExperienceUpdate = (data) => {
      setFormData(prev => ({ ...prev, experience: data }));
  };
  const handleProjectsUpdate = (data) => {
      setFormData(prev => ({ ...prev, projects: data }));
  };
  const handleSkillsUpdate = (data) => {
      setFormData(prev => ({ ...prev, skills: data }));
  };

  // Function to handle section clicks in the preview and scroll to the corresponding form
  const handleSectionClick = (sectionName) => {
     switch (sectionName) {
        case 'personalInfo':
           personalInfoRef.current?.scrollIntoView({ behavior: 'smooth' });
           break;
        case 'education':
           educationRef.current?.scrollIntoView({ behavior: 'smooth' });
           break;
        case 'experience':
           experienceRef.current?.scrollIntoView({ behavior: 'smooth' });
           break;
        case 'projects':
           projectsRef.current?.scrollIntoView({ behavior: 'smooth' });
           break;
        case 'skills':
           skillsRef.current?.scrollIntoView({ behavior: 'smooth' });
           break;
        default:
           break;
     }
  };

  // Function to handle section hovering in the preview for highlighting
  const handleSectionHover = (sectionName) => {
     setHoveredSection(sectionName);
  };

  // Create refs for each form section
  const personalInfoRef = useRef(null);
  const educationRef = useRef(null);
  const experienceRef = useRef(null);
  const projectsRef = useRef(null);
  const skillsRef = useRef(null);

  // Always render the builder UI
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left Column: Forms */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Builder toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">{resumeName || 'Untitled Resume'}</div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Save</button>
            <button onClick={handleSaveAs} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save As</button>
            <button onClick={handleRename} className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Rename</button>
            <button onClick={() => { if (!dirty || confirm('Discard unsaved changes and leave?')) onGoManage?.(); }} className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">Manage</button>
            <button onClick={() => { if (!dirty || confirm('Discard unsaved changes and leave?')) onGoHome?.(); }} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700">Home</button>
          </div>
        </div>
        {/* Render individual forms here */}
        <PersonalInfoForm ref={personalInfoRef} initialData={formData.personalInfo} onSubmit={handlePersonalInfoUpdate} />
        <EducationForm ref={educationRef} initialData={formData.education} onSubmit={handleEducationUpdate} />
        <ExperienceSection ref={experienceRef} initialData={formData.experience} onSubmit={handleExperienceUpdate} />
        <ProjectsForm ref={projectsRef} initialData={formData.projects} onSubmit={handleProjectsUpdate} />
        <SkillsForm ref={skillsRef} initialData={formData.skills} onSubmit={handleSkillsUpdate} />
      </div>

      {/* Right Column: Preview */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', borderLeft: '1px solid #ccc' }}>
        <ResumeDisplay
           onGoHome={onGoHome} // Home button goes back to App's home
           formData={formData}
           isFormView={false} // This is the preview side, not the form side
           onSectionClick={handleSectionClick}
           onSectionHover={handleSectionHover}
           hoveredSection={hoveredSection} // Pass hovered section state for highlighting
           resumeName={resumeName}
        />
      </div>
    </div>
  );
}

export default ResumeBuilderPage; 