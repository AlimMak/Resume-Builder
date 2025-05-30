import { useState, useEffect, useRef } from 'react';
import HomePage from './HomePage'; // Assuming HomePage will still be used internally or we'll adjust App.jsx
import ResumeDisplay from './ResumeDisplay';
import PersonalInfoForm from './PersonalInfoForm';
import EducationForm from './EducationForm';
import ExperienceSection from './ExperienceSection';
import ProjectsForm from './ProjectsForm';
import SkillsForm from './SkillsForm';

function ResumeBuilderPage({ onGoHome }) {
  // Keep track of whether the user is in the resume building process
  const [isBuilding, setIsBuilding] = useState(false);
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

  // Function to start the resume building process (shows split view)
  const handleStartBuilding = () => {
    setIsBuilding(true);
  };

  // Function to view the resume (shows split view)
  const handleViewExistingResume = () => {
     // If no data, maybe show a message or start form? For now, just set building to true
     setIsBuilding(true);
  };

   // Function to go back to the initial state of ResumeBuilderPage
   // This is effectively going back within the builder itself, not to App's home
   const handleBackToBuilderHome = () => {
      setIsBuilding(false);
   };

  // Function to update the resume data (general handler - might not be used directly by individual forms)
  const handleFormDataUpdate = (newData) => {
    setFormData(newData);
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

  // Render the appropriate view based on the isBuilding state
  return (
    <div>
      {!isBuilding ? (
        // Show the initial home page components/buttons within the builder context
        <HomePage 
          onStartForm={handleStartBuilding} 
          onViewResume={handleViewExistingResume}
        />
      ) : (
        // Show the split layout for building/viewing
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
      )}
    </div>
  );
}

export default ResumeBuilderPage; 