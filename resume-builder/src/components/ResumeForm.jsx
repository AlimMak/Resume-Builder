import { useState, useEffect } from 'react'
import PersonalInfoForm from './PersonalInfoForm'
import ExperienceSection from './ExperienceSection'
import EducationForm from './EducationForm'
import ProjectsForm from './ProjectsForm'
import SkillsForm from './SkillsForm'
import ResumeDisplay from './ResumeDisplay'
import FormNavigator from './FormNavigator'

function ResumeForm({ onBack, onDataUpdate, initialData }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    const initialProjects = initialData.projects || [];
    const projectsWithBulletPoints = initialProjects.map(project => ({
      ...project,
      bulletPoints: project.bulletPoints || [''] // Default to [''] if missing or null/undefined
    }));

    return {
      personalInfo: initialData.personalInfo || {
        FirstName: '',
        LastName: '',
        Description: ''
      },
      education: initialData.education || [],
      experience: initialData.experience || [],
      projects: projectsWithBulletPoints,
      skills: initialData.skills || []
    };
  });

  useEffect(() => {
    onDataUpdate(formData);
    localStorage.setItem('resumeData', JSON.stringify(formData));
  }, [formData, onDataUpdate]);

  const handlePersonalInfoSubmit = (data) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: data
    }));
    setCurrentStep(2);
  };

  const handleEducationSubmit = (data) => {
    setFormData(prev => ({
      ...prev,
      education: data
    }));
    setCurrentStep(3);
  };

  const handleExperienceSubmit = (data) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        experience: data
      };
      return newData;
    });
    setCurrentStep(4);
  };

  const handleProjectsSubmit = (data) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        projects: data
      };
      return newData;
    });
    setCurrentStep(5);
  };

  const handleSkillsSubmit = (data) => {
    setFormData(prev => ({
      ...prev,
      skills: data
    }));
    setCurrentStep(6);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <FormNavigator currentStep={currentStep} onBack={handleBack}>
      {currentStep === 1 && (
        <PersonalInfoForm 
          initialData={formData.personalInfo}
          onSubmit={handlePersonalInfoSubmit}
        />
      )}
      {currentStep === 2 && (
        <EducationForm 
          initialData={formData.education}
          onSubmit={handleEducationSubmit}
        />
      )}
      {currentStep === 3 && (
        <ExperienceSection 
          initialData={formData.experience}
          onSubmit={handleExperienceSubmit}
        />
      )}
      {currentStep === 4 && (
        <ProjectsForm 
          initialData={formData.projects}
          onSubmit={handleProjectsSubmit}
        />
      )}
      {currentStep === 5 && (
        <SkillsForm 
          initialData={formData.skills}
          onSubmit={handleSkillsSubmit}
        />
      )}
      {currentStep === 6 && (
        <ResumeDisplay 
          formData={formData} 
          isFormView={true}
          onBackStep={handleBack}
          onGoHome={onBack}
        />
      )}
    </FormNavigator>
  );
}

export default ResumeForm; 