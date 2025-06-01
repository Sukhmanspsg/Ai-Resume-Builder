import React from 'react';

const ModernTemplate = ({ resume, primaryColor = '#1A237E' }) => {
  // Provide fallback values if resume is null or undefined
  const resumeData = resume || {};
  
  const headerStyle = {
    color: primaryColor
  };

  const borderStyle = {
    borderColor: primaryColor
  };

  const gradientStyle = {
    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)`
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg">
      {/* Header Section with gradient background */}
      <div className="p-8 text-white" style={gradientStyle}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{resumeData.name || 'Your Name'}</h1>
          <div className="flex justify-center items-center space-x-4 text-sm">
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
      </div>

      <div className="p-8">
        {/* Professional Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3" style={headerStyle}>Professional Summary</h2>
          <div className="h-1 w-20 mb-4" style={{ backgroundColor: primaryColor }}></div>
          <p className="text-gray-700 leading-relaxed">
            {resumeData.summary || 'A dedicated professional with extensive experience in delivering high-quality results. Passionate about continuous learning and contributing to team success.'}
          </p>
        </div>

        {/* Work Experience */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3" style={headerStyle}>Work Experience</h2>
          <div className="h-1 w-20 mb-4" style={{ backgroundColor: primaryColor }}></div>
          {resumeData.workExperience && resumeData.workExperience.length > 0 ? (
            resumeData.workExperience.map((exp, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-lg font-medium" style={headerStyle}>{exp.title}</h3>
                  <span className="text-gray-600">{exp.startDate} - {exp.endDate || 'Present'}</span>
                </div>
                <div className="text-gray-700 mb-2">{exp.company}</div>
                <div className="text-gray-600">
                  {exp.responsibilities.split('\n').map((resp, idx) => (
                    <p key={idx} className="mb-1">{resp.trim()}</p>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-lg font-medium" style={headerStyle}>Senior Product Manager</h3>
                  <span className="text-gray-600">2022 - Present</span>
                </div>
                <div className="text-gray-700 mb-2">Innovation Corp</div>
                <div className="text-gray-600">
                  <p className="mb-1">• Led cross-functional teams of 12+ members to deliver customer-centric products</p>
                  <p className="mb-1">• Increased user engagement by 45% through data-driven product decisions</p>
                  <p className="mb-1">• Managed $2M+ product budget and coordinated with stakeholders across 5 departments</p>
                  <p className="mb-1">• Implemented agile methodologies resulting in 30% faster time-to-market</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-lg font-medium" style={headerStyle}>Product Manager</h3>
                  <span className="text-gray-600">2020 - 2022</span>
                </div>
                <div className="text-gray-700 mb-2">TechStart Solutions</div>
                <div className="text-gray-600">
                  <p className="mb-1">• Collaborated with engineering and design teams to define product roadmaps</p>
                  <p className="mb-1">• Conducted market research and user interviews to identify product opportunities</p>
                  <p className="mb-1">• Launched 3 successful products that generated $1.5M in annual revenue</p>
                  <p className="mb-1">• Analyzed user metrics and A/B test results to optimize product performance</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-lg font-medium" style={headerStyle}>Business Analyst</h3>
                  <span className="text-gray-600">2018 - 2020</span>
                </div>
                <div className="text-gray-700 mb-2">Global Enterprises Ltd.</div>
                <div className="text-gray-600">
                  <p className="mb-1">• Analyzed business processes and identified opportunities for improvement</p>
                  <p className="mb-1">• Created detailed requirements documentation and user stories</p>
                  <p className="mb-1">• Facilitated stakeholder meetings and gathered business requirements</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Skills */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3" style={headerStyle}>Skills</h2>
          <div className="h-1 w-20 mb-4" style={{ backgroundColor: primaryColor }}></div>
          <div className="flex flex-wrap gap-3">
            {resumeData.skills && resumeData.skills.length > 0 ? (
              resumeData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-lg text-white text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {skill}
                </span>
              ))
            ) : (
              ['Product Management', 'Data Analysis', 'Agile/Scrum', 'Market Research', 'SQL', 'Python', 'Tableau', 'Jira', 'Figma', 'A/B Testing', 'User Experience', 'Strategic Planning', 'Stakeholder Management', 'Project Management', 'Leadership'].map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-lg text-white text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Education */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3" style={headerStyle}>Education</h2>
          <div className="h-1 w-20 mb-4" style={{ backgroundColor: primaryColor }}></div>
          {resumeData.education && resumeData.education.length > 0 ? (
            resumeData.education.map((edu, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h3 className="text-lg font-medium" style={headerStyle}>{edu.degree}</h3>
                    <div className="text-gray-700">{edu.university}</div>
                  </div>
                  <div className="text-gray-600">{edu.year}</div>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h3 className="text-lg font-medium" style={headerStyle}>Master of Business Administration (MBA)</h3>
                    <div className="text-gray-700">Stanford Graduate School of Business</div>
                    <div className="text-gray-600 text-sm">Concentration: Technology Management</div>
                  </div>
                  <div className="text-gray-600">2016 - 2018</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h3 className="text-lg font-medium" style={headerStyle}>Bachelor of Science in Business Administration</h3>
                    <div className="text-gray-700">University of California, Berkeley</div>
                    <div className="text-gray-600 text-sm">Summa Cum Laude • Beta Gamma Sigma Honor Society</div>
                  </div>
                  <div className="text-gray-600">2012 - 2016</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Certifications */}
        {resumeData.certifications && resumeData.certifications.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold mb-3" style={headerStyle}>Certifications</h2>
            <div className="h-1 w-20 mb-4" style={{ backgroundColor: primaryColor }}></div>
            <ul className="list-disc list-inside text-gray-700">
              {resumeData.certifications.map((cert, index) => (
                <li key={index} className="mb-2">{cert}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-3" style={headerStyle}>Certifications</h2>
            <div className="h-1 w-20 mb-4" style={{ backgroundColor: primaryColor }}></div>
            <ul className="list-disc list-inside text-gray-700">
              <li className="mb-2">Certified Scrum Product Owner (CSPO) - 2023</li>
              <li className="mb-2">Google Analytics Individual Qualification - 2022</li>
              <li className="mb-2">Product Management Certificate - Stanford Continuing Studies - 2021</li>
              <li className="mb-2">Six Sigma Green Belt - 2020</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate; 