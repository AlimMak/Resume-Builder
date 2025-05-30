import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import ResumeForm from './components/ResumeForm'
import ResumeDisplay from './components/ResumeDisplay'

function App() {
  // Keep track of which page we're showing (home, form, or resume)
  const [showForm, setShowForm] = useState(false);
  const [showResume, setShowResume] = useState(false);

  // Keep track of all the resume information
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

  // When the app starts, check if there's any saved resume data
  useEffect(() => {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Function to show the form page
  const handleStartForm = () => {
    setShowForm(true);
    setShowResume(false);
  };

  // Function to show the resume page
  const handleViewResume = () => {
    setShowResume(true);
    setShowForm(false);
  };

  // Function to go back to the home page
  const handleBack = () => {
    setShowForm(false);
    setShowResume(false);
  };

  // Function to update the resume data
  const handleFormDataUpdate = (newData) => {
    setFormData(newData);
  };

  // Show different pages based on what the user wants to see
  return (
    <div>
      {!showForm && !showResume ? (
        // Show the home page with buttons to create or view resume
        <HomePage 
          onStartForm={handleStartForm} 
          onViewResume={handleViewResume}
        />
      ) : showForm ? (
        // Show the form to create/edit resume
        <ResumeForm 
          onBack={handleBack} 
          onDataUpdate={handleFormDataUpdate}
          initialData={formData}
        />
      ) : (
        // Show the final resume
        <ResumeDisplay 
          onGoHome={handleBack} 
          formData={formData}
          isFormView={false}
        />
      )}
    </div>
  );
}

export default App
