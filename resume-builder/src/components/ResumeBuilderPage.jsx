import { useState, useEffect, useRef } from 'react';
import ResumeDisplay from './ResumeDisplay';
import PersonalInfoForm from './PersonalInfoForm';
import EducationForm from './EducationForm';
import ExperienceSection from './ExperienceSection';
import ProjectsForm from './ProjectsForm';
import SkillsForm from './SkillsForm';

function ResumeBuilderPage({ onGoHome }) {
  // Keep track of the currently hovered section for highlighting
  const [hoveredSection, setHoveredSection] = useState(null);

  // Keep track of all the resume information
  const [formData, setFormData] = useState(() => {
    // Load saved data when the component mounts
    const savedData = localStorage.getItem('resumeData');
    return savedData ? JSON.parse(savedData) : {
      personalInfo: {
        FirstName: '',
        LastName: '',
        Description: '',
        socials: [{ platform: '', url: '' }],
        isUSCitizen: '',
        Email: '',
        Phone: ''
      },
      education: [],
      experience: [],
      projects: [],
      skills: []
    };
  });

  // Save data whenever formData changes
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(formData));
  }, [formData]);

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
        />
      </div>
    </div>
  );
}

export default ResumeBuilderPage; 