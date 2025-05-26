import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import ResumeForm from './components/ResumeForm'
import ResumeDisplay from './components/ResumeDisplay'

function App() {
  const [showForm, setShowForm] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [formData, setFormData] = useState({
    personalInfo: {
      FirstName: '',
      LastName: '',
      Description: ''
    },
    education: [],
    experience: [],
    projects: [],
    skills: []
  });

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleStartForm = () => {
    setShowForm(true);
    setShowResume(false);
  };

  const handleViewResume = () => {
    setShowResume(true);
    setShowForm(false);
  };

  const handleBack = () => {
    setShowForm(false);
    setShowResume(false);
  };

  const handleFormDataUpdate = (newData) => {
    setFormData(newData);
  };

  return (
    <div>
      {!showForm && !showResume ? (
        <HomePage 
          onStartForm={handleStartForm} 
          onViewResume={handleViewResume}
        />
      ) : showForm ? (
        <ResumeForm 
          onBack={handleBack} 
          onDataUpdate={handleFormDataUpdate}
          initialData={formData}
        />
      ) : (
        <ResumeDisplay 
          onBack={handleBack} 
          formData={formData}
        />
      )}
    </div>
  );
}

export default App
