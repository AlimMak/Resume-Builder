import { useState } from 'react'
import PersonalInfoForm from './components/PersonalInfoForm'
import ExperienceSection from './components/ExperienceSection'
import FormNavigator from './components/FormNavigator'

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      FirstName: '',
      LastName: '',
      Description: ''
    }
  });

  const handlePersonalInfoSubmit = (data) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: data
    }));
    setCurrentStep(2);
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
      {currentStep === 2 && <ExperienceSection />}
    </FormNavigator>
  );
}

export default App
