import React from 'react';

// Added isFormView, onBackStep, and onGoHome props for clearer navigation control
function ResumeDisplay({ formData, onBack, isFormView, onBackStep, onGoHome }) {
    return (
        <div>
            {/* Navigation bar with Back and Home buttons */}
            {/* Use a flex container to align Back left and Home right */}
            {!isFormView && (
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    {/* Show Back button only if not in form view (e.g., directly viewing resume) */}
                    {/* Note: This Back button might need different logic if you add direct resume viewing */}
                    {/* For now, it's hidden when isFormView is true */}

                    {/* The Home button - always visible when not in form view */}
                    {/* Use the onGoHome prop (App.jsx's handleBack) */}
                    <button onClick={onGoHome}>Home</button>
                 </div>
            )}

            {/* Main resume content */}
            <div>
                {/* Personal Information section */}
                <h1>{formData.personalInfo.FirstName} {formData.personalInfo.LastName}</h1>
                <p>{formData.personalInfo.Description}</p>

                {/* Education section - shows all education entries */}
                <h2>Education</h2>
                {formData.education.map((edu, index) => (
                    <div key={index}>
                        <h3>{edu.institution}</h3>
                        <p>{edu.degree} - {edu.field}</p>
                        <p>{edu.hasGraduated ? 'Graduated' : 'In Progress'}</p>
                        <p>{edu.hasGraduated ? edu.graduationDate : `Expected ${edu.graduationDate}`}</p>
                    </div>
                ))}

                {/* Experience section - shows all work experience entries */}
                <h2>Experience</h2>
                {formData.experience.map((exp, index) => (
                    <div key={index}>
                        <h3>{exp.company}</h3>
                        <p>{exp.position}</p>
                        <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                        {/* Display bullet points for experience */}
                        <ul>
                            {/* Map over bullet points and display as list items if not empty */}
                            {exp.bulletPoints.map((bulletPoint, bulletIndex) => (
                                bulletPoint && <li key={bulletIndex}>{bulletPoint}</li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Projects section - shows all project entries */}
                <h2>Projects</h2>
                {formData.projects.map((project, index) => (
                    <div key={index}>
                        <h3>{project.projectName}</h3>
                        <p>{project.role}</p>
                        <p>{project.startDate} - {project.isCurrent ? 'Present' : project.endDate}</p>
                        {/* Display bullet points for projects */}
                        <ul>
                            {/* Map over bullet points and display as list items if not empty */}
                            {project.bulletPoints.map((bulletPoint, bulletIndex) => (
                                bulletPoint && <li key={bulletIndex}>{bulletPoint}</li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Skills section - shows all skills with commas between them */}
                <h2>Skills</h2>
                <div>
                    {formData.skills.map((skill, index) => (
                        <span key={index}>{skill.name}{index < formData.skills.length - 1 ? ', ' : ''}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ResumeDisplay; 