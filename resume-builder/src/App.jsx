import { useState } from 'react'
import PersonalInfoForm from './components/PersonalInfoForm'
import ExperienceSection from './components/ExperienceSection'
import EducationForm from './components/EducationForm'
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
    experience: []
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
      {currentStep === 3 && <ExperienceSection />}
    </FormNavigator>
  );
}

export default App
