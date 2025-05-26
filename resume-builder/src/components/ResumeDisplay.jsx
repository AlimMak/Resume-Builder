import React from 'react';

function ResumeDisplay({ formData, onBack }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button onClick={onBack}>Home</button>
            </div>
            <div>
                <h1>{formData.personalInfo.FirstName} {formData.personalInfo.LastName}</h1>
                <p>{formData.personalInfo.Description}</p>

                <h2>Education</h2>
                {formData.education.map((edu, index) => (
                    <div key={index}>
                        <h3>{edu.institution}</h3>
                        <p>{edu.degree} - {edu.field}</p>
                        <p>{edu.hasGraduated ? 'Graduated' : 'In Progress'}</p>
                        <p>{edu.hasGraduated ? edu.graduationDate : `Expected ${edu.graduationDate}`}</p>
                    </div>
                ))}

                <h2>Experience</h2>
                {formData.experience.map((exp, index) => (
                    <div key={index}>
                        <h3>{exp.company}</h3>
                        <p>{exp.position}</p>
                        <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                        <p>{exp.description}</p>
                    </div>
                ))}

                <h2>Projects</h2>
                {formData.projects.map((project, index) => (
                    <div key={index}>
                        <h3>{project.projectName}</h3>
                        <p>{project.role}</p>
                        <p>{project.startDate} - {project.isCurrent ? 'Present' : project.endDate}</p>
                        <p>{project.description}</p>
                    </div>
                ))}

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