import { useEffect, useRef, useState } from 'react';
import ResumeDisplay from './ResumeDisplay';
import PersonalInfoForm from './PersonalInfoForm';
import EducationForm from './EducationForm';
import ExperienceSection from './ExperienceSection';
import ProjectsForm from './ProjectsForm';
import SkillsForm from './SkillsForm';
import { createEmptyFormData, createResume, getResume, renameResume, updateResume, getResumeMeta, setResumeMeta } from '../utils/resumeDb';
import { logger } from '../utils/logger';
import { useToast } from './ToastProvider';
import { evaluateResume, applyAutoFix } from '../utils/qualityRules';
import QualityPanel from './QualityPanel';

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
  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({ error: true, warn: true, info: true });
  const [panelOpen, setPanelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState({ dismissed: {}, panelOpen: false });

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
          try {
            const m = await getResumeMeta(rec.id);
            setMeta(m || { dismissed: {}, panelOpen: false });
            setPanelOpen(!!m?.panelOpen);
          } catch (e) {
            logger.warn('Failed to load resume meta', { message: e?.message });
          }
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

  // Debounced evaluation of issues, filtered by dismissed meta
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const result = evaluateResume(formData);
        const filtered = result.filter(it => !meta?.dismissed?.[it.id]);
        setIssues(filtered);
        logger.info('Quality evaluated', {
          errors: filtered.filter(i => i.severity === 'error').length,
          warns: filtered.filter(i => i.severity === 'warn').length,
          info: filtered.filter(i => i.severity === 'info').length,
        });
      } catch (e) {
        logger.error('Evaluate failed', { message: e?.message });
      }
    }, 400);
    return () => clearTimeout(id);
  }, [formData, meta]);

  // Toolbar actions: Save, Save As (duplicate), Rename handled via App-level navigation for Save As; here implement Save and Rename
  const handleSave = async () => {
    try {
      if (!loadedId) return;
      const current = gatherAllFormData();
      await updateResume(loadedId, { data: current });
      setFormData(current);
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

  // Collect latest values from all sections (even if section save buttons weren't pressed)
  function gatherAllFormData() {
    const personalInfo = personalInfoRef.current && personalInfoRef.current.getData ? personalInfoRef.current.getData() : formData.personalInfo;
    const education = educationRef.current && educationRef.current.getData ? educationRef.current.getData() : formData.education;
    const experience = experienceRef.current && experienceRef.current.getData ? experienceRef.current.getData() : formData.experience;
    const projects = projectsRef.current && projectsRef.current.getData ? projectsRef.current.getData() : formData.projects;
    const skills = skillsRef.current && skillsRef.current.getData ? skillsRef.current.getData() : formData.skills;
    return { personalInfo, education, experience, projects, skills };
  }

  // Always render the builder UI
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left Column: Forms */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Builder toolbar */}
        <div className="flex items-center justify-between mb-4 rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur px-4 py-3 ring-1 ring-black/5 shadow">
          <div className="text-lg font-semibold">{resumeName || 'Untitled Resume'}</div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="pill-btn pill-success">Save</button>
            <button onClick={handleSaveAs} className="pill-btn pill-primary">Save As</button>
            <button onClick={handleRename} className="pill-btn pill-warn">Rename</button>
            <button onClick={async () => {
              const next = !panelOpen;
              setPanelOpen(next);
              try {
                if (loadedId) {
                  const newMeta = { ...(meta || {}), resumeId: loadedId, panelOpen: next };
                  await setResumeMeta(loadedId, newMeta);
                  setMeta(newMeta);
                }
              } catch (e) { logger.warn('Failed to persist panelOpen', { message: e?.message }); }
            }} className="pill-btn pill-neutral">Quality {issues.length ? `(${issues.filter(i=>i.severity!=='info').length})` : ''}</button>
            <button onClick={() => { if (!dirty || confirm('Discard unsaved changes and leave?')) onGoManage?.(); }} className="pill-btn pill-neutral">Manage</button>
            <button onClick={() => { if (!dirty || confirm('Discard unsaved changes and leave?')) onGoHome?.(); }} className="pill-btn pill-neutral">Home</button>
          </div>
        </div>
        {/* Render individual forms here */}
        <div className="glass-card-dark p-4 mb-4">
          <PersonalInfoForm ref={personalInfoRef} initialData={formData.personalInfo} onSubmit={handlePersonalInfoUpdate} />
        </div>
        <div className="glass-card-dark p-4 mb-4">
          <EducationForm ref={educationRef} initialData={formData.education} onSubmit={handleEducationUpdate} />
        </div>
        <div className="glass-card-dark p-4 mb-4">
          <ExperienceSection ref={experienceRef} initialData={formData.experience} onSubmit={handleExperienceUpdate} />
        </div>
        <div className="glass-card-dark p-4 mb-4">
          <ProjectsForm ref={projectsRef} initialData={formData.projects} onSubmit={handleProjectsUpdate} />
        </div>
        <div className="glass-card-dark p-4 mb-4">
          <SkillsForm ref={skillsRef} initialData={formData.skills} onSubmit={handleSkillsUpdate} />
        </div>
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
        {panelOpen && (
          <div className="mt-4">
            <QualityPanel
              issues={issues}
              onJump={(section) => handleSectionClick(section)}
              onDismiss={async (id) => {
                setBusy(true);
                try {
                  const dismissed = { ...((meta && meta.dismissed) || {}), [id]: true };
                  if (loadedId) await setResumeMeta(loadedId, { ...(meta||{}), resumeId: loadedId, dismissed });
                  setMeta(prev => ({ ...(prev||{}), dismissed }));
                  setIssues(prev => prev.filter(it => it.id !== id));
                } finally { setBusy(false); }
              }}
              onAutoFix={async (issue) => {
                setBusy(true);
                try {
                  const next = applyAutoFix(formData, issue.autoFix);
                  setFormData(next);
                  toast.success('Applied auto-fix');
                } finally { setBusy(false); }
              }}
              filters={filters}
              setFilters={setFilters}
              onRestore={async () => {
                setBusy(true);
                try {
                  if (loadedId) await setResumeMeta(loadedId, { ...(meta||{}), resumeId: loadedId, dismissed: {} });
                  setMeta(prev => ({ ...(prev||{}), dismissed: {} }));
                } finally { setBusy(false); }
              }}
              busy={busy}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeBuilderPage; 