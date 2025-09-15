import React, { useRef } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResumeDocument from './ResumeDocument';

// Helper function to format date from MM-YYYY to Month YYYY
const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month] = dateString.split('-');
  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
  const monthName = monthNames[parseInt(month, 10) - 1];
  return `${monthName} ${year}`;
};

// Helper function to format phone number
const formatPhoneNumber = (phoneNumberString) => {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumberString;
};

// Simple debounce function
export function debounce(func, delay) {
  let timer;
  return function(...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

// Styles object for the preview - Ensuring correct React inline style format
const styles = {
  container: {
    // Constrain width to printable size and center content
    maxWidth: '8.5in',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'Times New Roman, Times, serif',
    backgroundColor: 'transparent',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  personalInfoContainer: {
    textAlign: 'center',
    marginBottom: '6px',
  },
  nameHeading: {
    fontSize: '18pt',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  inlineText: {
    fontSize: '10.5pt',
    marginBottom: '4px',
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
  },
  inlineTextItem: {
    marginRight: '5px',
  },
  socialLinksContainer: {
    marginTop: '3px',
    marginBottom: '10px',
    textAlign: 'center',
  },
  section: {
    marginBottom: '10px',
  },
  heading: {
    fontSize: '12pt',
    fontWeight: 'bold',
    marginBottom: '4px',
    borderBottom: '1px solid #000',
    paddingBottom: '1px',
  },
  subheading: {
    fontSize: '10.5pt',
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  text: {
    fontSize: '10.5pt',
    lineHeight: 1.35,
    marginBottom: '2px',
  },
  bulletPoint: {
    fontSize: '10.5pt',
    lineHeight: 1.35,
    marginBottom: '2px',
    marginLeft: '12px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2px',
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    textAlign: 'right',
  },
  italic: {
    fontStyle: 'italic',
  },
  bold: {
    fontWeight: 'bold',
  },
  pagePreview: {
    // Ensure the resume surface is always high-contrast and readable in dark mode
    border: '1px solid #e5e7eb', // Light border
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.12)', // Subtle shadow
    padding: '28px', // Comfortable internal padding
    backgroundColor: '#ffffff', // Paper white
    color: '#0b0f19', // Stronger dark text for light mode
    borderRadius: '8px',
  },
  highlightedSection: {
    backgroundColor: '#f0f0f0', // Light grey background for highlighting
    cursor: 'pointer', // Indicate that the section is clickable
  },
};

function ResumeDisplay({ formData, onBack, isFormView, onBackStep, onGoHome, onSectionClick, onSectionHover, hoveredSection, resumeName }) {
    const socials = formData?.personalInfo?.socials || [];
    const targetRef = useRef();

    // Add a check for empty formData
    if (!formData || !formData.personalInfo) {
        return (
            <div /* style={styles.container} */>
                <div /* style={styles.navigation} */>
                    <button onClick={onGoHome}>Home</button>
                </div>
                <div>No resume data available. Please create a new resume.</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {!isFormView && (
                <div style={styles.navigation}>
                    <button
                      onClick={onGoHome}
                      className="pill-btn pill-neutral"
                    >
                      Home
                    </button>
                    <PDFDownloadLink document={<ResumeDocument formData={formData} />} fileName={`${(resumeName || 'resume')}.pdf`}>
                        {({ loading }) => (
                          <button
                            disabled={loading}
                            className={`pill-btn ${loading ? 'bg-gray-400 cursor-wait' : 'pill-success'}`}
                          >
                            {loading ? 'Preparing PDF…' : 'Download PDF'}
                          </button>
                        )}
                    </PDFDownloadLink>
                </div>
            )}

            <div id="resume-content" ref={targetRef} style={styles.pagePreview}>
                {/* Personal Information */}
                <div 
                  style={hoveredSection === 'personalInfo' ? {...styles.personalInfoContainer, ...styles.highlightedSection} : styles.personalInfoContainer}
                  onClick={() => onSectionClick('personalInfo')}
                  onMouseEnter={() => onSectionHover('personalInfo')}
                  onMouseLeave={() => onSectionHover(null)}
                >
                    <h1 style={styles.nameHeading}>
                        {formData.personalInfo.FirstName} {formData.personalInfo.LastName}
                    </h1>
                    
                    <div style={styles.inlineText}>
                        {/* Display US Citizenship status if Yes */}
                        {formData.personalInfo.isUSCitizen === 'Yes' && (
                            <span>US Citizen</span>
                        )}
                        {/* Display Email if present, with separator if needed */}
                        {formData.personalInfo.Email && (
                            <span>
                                {(formData.personalInfo.isUSCitizen === 'Yes') ? ' | ' : ''}
                                {formData.personalInfo.Email}
                            </span>
                        )}
                        {/* Display Phone if present, with separator if needed */}
                        {formData.personalInfo.Phone && (
                            <span>
                                {(formData.personalInfo.isUSCitizen === 'Yes' || formData.personalInfo.Email) ? ' | ' : ''}
                                {formatPhoneNumber(formData.personalInfo.Phone)}
                            </span>
                        )}
                        {/* Display Social Links if present, with separator if needed */}
                        {socials.map((social, index) => (
                            social.platform && social.url && (
                                <span key={index}>
                                    {(formData.personalInfo.isUSCitizen === 'Yes' || formData.personalInfo.Email || formData.personalInfo.Phone || index > 0) ? ' | ' : ''}
                                    {social.platform}: {social.url}
                                </span>
                            )
                        ))}
                    </div>
                </div>

                {/* Education Section */}
                {formData.education && formData.education.length > 0 && (
                    <div 
                      style={hoveredSection === 'education' ? {...styles.section, ...styles.highlightedSection} : styles.section}
                      onClick={() => onSectionClick('education')}
                      onMouseEnter={() => onSectionHover('education')}
                      onMouseLeave={() => onSectionHover(null)}
                    >
                        <h2 style={styles.heading}>EDUCATION</h2>
                        {formData.education.map((edu, index) => (
                            <div key={index} style={{ marginBottom: '5px' }}>
                                <div style={styles.row}>
                                    <div style={styles.leftColumn}>
                                        <span style={styles.subheading}>{edu.institution}</span>
                                    </div>
                                    <div style={styles.rightColumn}>
                                        <span style={{...styles.text, ...styles.bold}}>{edu.location}</span>
                                    </div>
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.leftColumn}>
                                        <span style={{...styles.text, ...styles.italic}}>{edu.degree}</span>
                                    </div>
                                    <div style={styles.rightColumn}>
                                        <span style={{...styles.text, ...styles.italic, ...styles.bold}}>
                                            {edu.hasGraduated ? 'Graduated' : 'Expected Graduation'}, {formatDate(edu.graduationDate)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Skills Section */}
                {Array.isArray(formData.skills) && formData.skills.length > 0 && (
                    <div 
                      style={hoveredSection === 'skills' ? {...styles.section, ...styles.highlightedSection} : styles.section}
                      onClick={() => onSectionClick('skills')}
                      onMouseEnter={() => onSectionHover('skills')}
                      onMouseLeave={() => onSectionHover(null)}
                    >
                        <h2 style={styles.heading}>SKILLS</h2>
                        <div style={styles.text}>
                            {formData.skills.map((skill, index) => (
                                <span key={index}>
                                    {skill}{index < formData.skills.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Experience Section */}
                {formData.experience && formData.experience.length > 0 && (
                    <div 
                      style={hoveredSection === 'experience' ? {...styles.section, ...styles.highlightedSection} : styles.section}
                      onClick={() => onSectionClick('experience')}
                      onMouseEnter={() => onSectionHover('experience')}
                      onMouseLeave={() => onSectionHover(null)}
                    >
                        <h2 style={styles.heading}>EXPERIENCE</h2>
                        {formData.experience.map((exp, index) => (
                            <div key={index} style={{ marginBottom: '5px' }}>
                                <div style={styles.row}>
                                    <div style={styles.leftColumn}>
                                        <span style={styles.subheading}>{exp.company}</span>
                                    </div>
                                    <div style={styles.rightColumn}>
                                        <span style={{...styles.text, ...styles.bold}}>{exp.location}</span>
                                    </div>
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.leftColumn}>
                                        <span style={{...styles.text, ...styles.italic, ...styles.bold}}>{exp.position}</span>
                                    </div>
                                    <div style={styles.rightColumn}>
                                        <span style={{...styles.text, ...styles.italic, ...styles.bold}}>
                                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                                        </span>
                                    </div>
                                </div>
                                {exp.bulletPoints && exp.bulletPoints.map((point, idx) => (
                                    <div key={idx} style={styles.bulletPoint}>• {point}</div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {/* Projects Section */}
                {formData.projects && formData.projects.length > 0 && (
                    <div 
                      style={hoveredSection === 'projects' ? {...styles.section, ...styles.highlightedSection} : styles.section}
                      onClick={() => onSectionClick('projects')}
                      onMouseEnter={() => onSectionHover('projects')}
                      onMouseLeave={() => onSectionHover(null)}
                    >
                        <h2 style={styles.heading}>PROJECTS</h2>
                        {formData.projects.map((project, index) => (
                            <div key={index} style={{ marginBottom: '5px' }}>
                                <div style={styles.row}>
                                    <div style={styles.leftColumn}>
                                        <span style={styles.subheading}>{project.projectName}</span>
                                    </div>
                                    <div style={styles.rightColumn}>
                                        <span style={{...styles.text, ...styles.bold}}>{project.location}</span>
                                    </div>
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.leftColumn}>
                                        <span style={{...styles.text, ...styles.italic, ...styles.bold}}>{project.role}</span>
                                    </div>
                                    <div style={styles.rightColumn}>
                                        <span style={{...styles.text, ...styles.italic, ...styles.bold}}>
                                            {formatDate(project.startDate)} - {project.isCurrent ? 'Present' : formatDate(project.endDate)}
                                        </span>
                                    </div>
                                </div>
                                {project.bulletPoints && project.bulletPoints.map((point, idx) => (
                                    <div key={idx} style={styles.bulletPoint}>• {point}</div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResumeDisplay; 