import { useState } from 'react'
import PersonalInfoForm from './components/PersonalInfoForm'
import ExperienceSection from './components/ExperienceSection'
import EducationForm from './components/EducationForm'
import ProjectsForm from './components/ProjectsForm'
import FormNavigator from './components/FormNavigator'

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      FirstName: '',
      LastName: '',
      Description: ''
    },
    education: [],
    experience: [],
    projects: []
  });

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
    setFormData(prev => ({
      ...prev,
      experience: data
    }));
    setCurrentStep(4);
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
          onSubmit={(data) => {
            setFormData(prev => ({
              ...prev,
              projects: data
            }));
            // TODO: Add next step or final submission
          }}
        />
      )}
    </FormNavigator>
  );
}

export default App
