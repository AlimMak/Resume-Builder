import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

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
  return phoneNumberString; // Return original string if format doesn't match
};

// No Font.register needed for built-in fonts like Times-Roman

// Create styles - Adjusted to use Times-Roman and keep your requested sizes
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    paddingTop: 20, // Reduced top padding
    paddingHorizontal: 30, // Keep horizontal padding
    paddingBottom: 30,
    fontFamily: 'Times-Roman', // Use Times-Roman built-in font
  },
  section: {
    marginBottom: 8, // Further reduced space between sections
    paddingBottom: 0, // Remove padding at the bottom of each section view
  },
  heading: {
    fontSize: 12, // Section title size - Calibri size 12
    fontWeight: 'bold',
    marginBottom: 3,
    borderBottom: '1 solid #000',
    paddingBottom: 1,
    fontFamily: 'Times-Roman',
  },
  nameHeading: {
    fontSize: 16, // Name size - Calibri size 16
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 3, // Reduced space below name
    fontFamily: 'Times-Roman',
  },
  subheading: {
    fontSize: 10.5, // Calibri size 10.5
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'Times-Roman',
  },
  text: {
    fontSize: 10.5, // Calibri size 10.5
    marginBottom: 1,
    fontFamily: 'Times-Roman',
  },
  bulletPoint: {
    fontSize: 10.5, // Calibri size 10.5
    marginBottom: 1,
    marginLeft: 10,
    fontFamily: 'Times-Roman',
  },
  contactInfo: {
    fontSize: 10.5, // Calibri size 10.5
    marginBottom: 3, // Reduced space below contact info line
    fontFamily: 'Times-Roman',
  },
   socialLinksContainer: {
    marginTop: 3, // Small space above social links
    marginBottom: 10, // Space below social links section
    textAlign: 'center', // Center social links
  },
  inlineText: {
    fontSize: 10.5, // Calibri size 10.5
    marginBottom: 1,
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'Times-Roman',
    justifyContent: 'center', // Center inline text like contact info
  },
  inlineTextItem: {
    marginRight: 5,
    fontFamily: 'Times-Roman',
  },
  personalInfoContainer: {
    textAlign: 'center',
    marginBottom: 4, // Reduced space by half
  }
});

// Create Document Component
const ResumeDocument = ({ formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.personalInfoContainer}>
        <Text style={styles.nameHeading}>{formData.personalInfo.FirstName} {formData.personalInfo.LastName}</Text>
        {/* Personal Info details */}
        <View style={styles.inlineText}>
          {/* Removed description text */}
          {/* Add other relevant contact info */}
        </View>
         {/* Social Links - moved here and centered */}
         {formData.personalInfo.socials && formData.personalInfo.socials.length > 0 && (
           <View style={styles.socialLinksContainer}>
             <View style={styles.inlineText}>
               {/* Display US Citizenship status */}
               {formData.personalInfo.isUSCitizen === 'Yes' && (
                 <Text style={styles.inlineTextItem}>US Citizen</Text>
               )}
               {/* Display Email */}
               {formData.personalInfo.Email && (
                 <Text style={styles.inlineTextItem}>{formData.personalInfo.isUSCitizen === 'Yes' ? ' | ' : ''}{formData.personalInfo.Email}</Text>
               )}
               {/* Display Phone */}
               {formData.personalInfo.Phone && (
                 <Text style={styles.inlineTextItem}>{(formData.personalInfo.isUSCitizen === 'Yes' || formData.personalInfo.Email) ? ' | ' : ''}{formatPhoneNumber(formData.personalInfo.Phone)}</Text>
               )}

               {formData.personalInfo.socials.map((social, index) => (
                 // Only display if platform and url are provided (url is now username)
                 social.platform && social.url && (
                   <Text key={index} style={styles.inlineTextItem}>
                     {((formData.personalInfo.isUSCitizen === 'Yes' || formData.personalInfo.Email || formData.personalInfo.Phone) || index > 0) ? ' | ' : ''}
                     {/* Display Platform: Username (corrected) */}
                     {social.platform + ': ' + social.url}
                   </Text>
                 )
               ))}
             </View>
           </View>
         )}
        {/* Add LinkedIn and GitHub here if they are part of socials and you want them in the main contact line */}
         <View style={styles.inlineText}>
           {formData.personalInfo.LinkedIn && <Text style={styles.inlineTextItem}> | LinkedIn: {formData.personalInfo.LinkedIn}</Text>}
           {formData.personalInfo.GitHub && <Text style={styles.inlineTextItem}> | GitHub: {formData.personalInfo.GitHub}</Text>}
         </View>

      </View>


      {formData.education && formData.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>EDUCATION</Text>
          {formData.education.map((edu, index) => (
            <View key={index} style={{ marginBottom: 5 }}>
              {/* Institution name on the left, Location on the right */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.subheading}>{edu.institution}</Text>
                <Text style={[styles.text, { fontWeight: 'bold' }]}>{edu.location}</Text>
              </View>
              {/* Degree/Field on the left, Graduation on the right */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.text, { fontStyle: 'italic' }]}>{edu.degree} {edu.field}</Text>
                <Text style={[styles.text, { fontStyle: 'italic', fontWeight: 'bold' }]}>{edu.hasGraduated ? 'Graduated' : 'Expected Graduation'}, {formatDate(edu.graduationDate)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {formData.skills && formData.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>SKILLS</Text>
          <Text style={styles.text}>
            {formData.skills.map(skill => skill.name).join(', ')}
          </Text>
        </View>
      )}

      {formData.experience && formData.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>EXPERIENCE</Text>
          {formData.experience.map((exp, index) => (
            <View key={index} style={{ marginBottom: 5 }}>
              {/* Company name on the left, Location on the right */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.subheading}>{exp.company}</Text>
                <Text style={[styles.text, { fontWeight: 'bold' }]}>{exp.location}</Text>
              </View>
              {/* Position on the left (italicized), Dates on the right */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.text, { fontStyle: 'italic', fontWeight: 'bold' }]}>{exp.position}</Text>
                <Text style={[styles.text, { fontStyle: 'italic', fontWeight: 'bold' }]}>{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</Text>
              </View>
              {exp.bulletPoints && exp.bulletPoints.map((point, idx) => (
                <Text key={idx} style={styles.bulletPoint}>• {point}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {formData.projects && formData.projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>PROJECTS</Text>
          {formData.projects.map((project, index) => (
            <View key={index} style={{ marginBottom: 5 }}>
              {/* Project Name on the left, Location on the right */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.subheading}>{project.projectName}</Text>
                <Text style={[styles.text, { fontWeight: 'bold' }]}>{project.location}</Text>
              </View>
              {/* Role on the left (italicized), Dates on the right (italicized) */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.text, { fontStyle: 'italic', fontWeight: 'bold' }]}>{project.role}</Text>
                <Text style={[styles.text, { fontStyle: 'italic', fontWeight: 'bold' }]}>{formatDate(project.startDate)} - {project.isCurrent ? 'Present' : formatDate(project.endDate)}</Text>
              </View>
              {project.bulletPoints && project.bulletPoints.map((point, idx) => (
                <Text key={idx} style={styles.bulletPoint}>• {point}</Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export default ResumeDocument; 