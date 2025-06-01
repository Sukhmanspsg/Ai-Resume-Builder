import React from 'react';

const MinimalTemplate = ({ resume, primaryColor = '#1A237E' }) => {
  // Provide fallback values if resume is null or undefined
  const resumeData = resume || {};
  
  const headerStyle = {
    color: primaryColor
  };

  const borderStyle = {
    borderColor: primaryColor
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-light mb-4" style={headerStyle}>{resumeData.name || 'Your Name'}</h1>
        <div className="flex justify-center items-center space-x-4 text-gray-600">
          <span>{resumeData.email || 'your.email@example.com'}</span>
          <span>•</span>
          <span>{resumeData.contact || '+1 (555) 123-4567'}</span>
          {resumeData.linkedin && (
            <>
              <span>•</span>
              <span>{resumeData.linkedin}</span>
            </>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mb-12">
        <h2 className="text-2xl font-light mb-6 text-center" style={headerStyle}>Professional Summary</h2>
        <p className="text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
          {resumeData.summary || 'A dedicated professional with extensive experience in delivering high-quality results. Passionate about continuous learning and contributing to team success.'}
        </p>
      </div>

      {/* Work Experience */}
      <div className="mb-12">
        <h2 className="text-2xl font-light mb-6 text-center" style={headerStyle}>Work Experience</h2>
        {resumeData.workExperience && resumeData.workExperience.length > 0 ? (
          resumeData.workExperience.map((exp, index) => (
            <div key={index} className="mb-8">
              <div className="text-center mb-4">
                <h3 className="text-xl font-medium mb-1" style={headerStyle}>{exp.title}</h3>
                <div className="text-gray-700 mb-1">{exp.company}</div>
                <div className="text-gray-600 text-sm">{exp.startDate} - {exp.endDate || 'Present'}</div>
              </div>
              <div className="text-gray-600 max-w-3xl mx-auto">
                {exp.responsibilities.split('\n').map((resp, idx) => (
                  <p key={idx} className="mb-2 text-center">{resp.trim()}</p>
                ))}
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="mb-8">
              <div className="text-center mb-4">
                <h3 className="text-xl font-medium mb-1" style={headerStyle}>Creative Director</h3>
                <div className="text-gray-700 mb-1">Design Studio Pro</div>
                <div className="text-gray-600 text-sm">2021 - Present</div>
              </div>
              <div className="text-gray-600 max-w-3xl mx-auto">
                <p className="mb-2 text-center">• Lead creative vision and strategy for 50+ client projects annually</p>
                <p className="mb-2 text-center">• Manage a team of 8 designers and oversee creative production workflow</p>
                <p className="mb-2 text-center">• Increased client satisfaction scores by 40% through innovative design solutions</p>
                <p className="mb-2 text-center">• Collaborate with clients to develop brand identities and marketing campaigns</p>
              </div>
            </div>
            <div className="mb-8">
              <div className="text-center mb-4">
                <h3 className="text-xl font-medium mb-1" style={headerStyle}>Senior Graphic Designer</h3>
                <div className="text-gray-700 mb-1">Creative Agency Inc.</div>
                <div className="text-gray-600 text-sm">2019 - 2021</div>
              </div>
              <div className="text-gray-600 max-w-3xl mx-auto">
                <p className="mb-2 text-center">• Designed compelling visual content for digital and print media</p>
                <p className="mb-2 text-center">• Collaborated with marketing teams to create cohesive brand experiences</p>
                <p className="mb-2 text-center">• Mentored junior designers and established design system guidelines</p>
                <p className="mb-2 text-center">• Awarded "Designer of the Year" for outstanding creative contributions</p>
              </div>
            </div>
            <div className="mb-8">
              <div className="text-center mb-4">
                <h3 className="text-xl font-medium mb-1" style={headerStyle}>Graphic Designer</h3>
                <div className="text-gray-700 mb-1">Media Solutions LLC</div>
                <div className="text-gray-600 text-sm">2017 - 2019</div>
              </div>
              <div className="text-gray-600 max-w-3xl mx-auto">
                <p className="mb-2 text-center">• Created visual designs for websites, brochures, and social media campaigns</p>
                <p className="mb-2 text-center">• Worked with clients to understand design requirements and brand guidelines</p>
                <p className="mb-2 text-center">• Developed proficiency in Adobe Creative Suite and design best practices</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Skills */}
      <div className="mb-12">
        <h2 className="text-2xl font-light mb-6 text-center" style={headerStyle}>Skills</h2>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {resumeData.skills && resumeData.skills.length > 0 ? (
            resumeData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full text-sm"
                style={{ 
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor
                }}
              >
                {skill}
              </span>
            ))
          ) : (
            ['Adobe Creative Suite', 'Photoshop', 'Illustrator', 'InDesign', 'Figma', 'Sketch', 'Brand Design', 'Typography', 'UI/UX Design', 'Print Design', 'Digital Marketing', 'Creative Strategy', 'Team Leadership', 'Project Management'].map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full text-sm"
                style={{ 
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor
                }}
              >
                {skill}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Education */}
      <div className="mb-12">
        <h2 className="text-2xl font-light mb-6 text-center" style={headerStyle}>Education</h2>
        {resumeData.education && resumeData.education.length > 0 ? (
          resumeData.education.map((edu, index) => (
            <div key={index} className="mb-4 text-center">
              <h3 className="text-xl font-medium mb-1" style={headerStyle}>{edu.degree}</h3>
              <div className="text-gray-700">{edu.university}</div>
              <div className="text-gray-600">{edu.year}</div>
            </div>
          ))
        ) : (
          <>
            <div className="mb-4 text-center">
              <h3 className="text-xl font-medium mb-1" style={headerStyle}>Bachelor of Fine Arts in Graphic Design</h3>
              <div className="text-gray-700">Rhode Island School of Design</div>
              <div className="text-gray-600 text-sm">Magna Cum Laude • Dean's List</div>
              <div className="text-gray-600">2013 - 2017</div>
            </div>
            <div className="mb-4 text-center">
              <h3 className="text-xl font-medium mb-1" style={headerStyle}>Certificate in Digital Marketing</h3>
              <div className="text-gray-700">Google Digital Garage</div>
              <div className="text-gray-600">2020</div>
            </div>
          </>
        )}
      </div>

      {/* Certifications */}
      {resumeData.certifications && resumeData.certifications.length > 0 ? (
        <div>
          <h2 className="text-2xl font-light mb-6 text-center" style={headerStyle}>Certifications</h2>
          <ul className="list-none text-center text-gray-700 max-w-3xl mx-auto">
            {resumeData.certifications.map((cert, index) => (
              <li key={index} className="mb-2">{cert}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-light mb-6 text-center" style={headerStyle}>Certifications</h2>
          <ul className="list-none text-center text-gray-700 max-w-3xl mx-auto">
            <li className="mb-2">Adobe Certified Expert (ACE) - Photoshop (2022)</li>
            <li className="mb-2">Google Ads Certified (2021)</li>
            <li className="mb-2">HubSpot Content Marketing Certification (2021)</li>
            <li className="mb-2">UX Design Certificate - Google (2020)</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MinimalTemplate; 