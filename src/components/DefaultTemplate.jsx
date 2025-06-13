import React from 'react';

const DefaultTemplate = ({ resume, primaryColor = '#1A237E' }) => {
  // Provide fallback values if resume is null or undefined
  const resumeData = resume || {};
  
  const headerStyle = {
    color: primaryColor
  };

  const borderStyle = {
    borderColor: primaryColor
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        {/* Photo and Name Section */}
        <div className="flex flex-col items-center mb-4">
          {resumeData.photo && (
            <img
              src={resumeData.photo}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mb-4 shadow-lg"
            />
          )}
        <h1 className="text-4xl font-bold mb-2">{resumeData.name || 'Your Name'}</h1>
        </div>
        
        {/* Contact Information */}
        <div className="text-gray-600 space-x-2">
          <span>{resumeData.email || 'your.email@example.com'}</span>
          <span>|</span>
          <span>{resumeData.contact || '+1 (555) 123-4567'}</span>
          {resumeData.linkedin && (
            <>
              <span>|</span>
              <span>{resumeData.linkedin}</span>
            </>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3" style={headerStyle}>Professional Summary</h2>
        <div className="border-b-2 mb-4" style={borderStyle}></div>
        <p className="text-gray-700 leading-relaxed">
          {resumeData.summary || 'A dedicated professional with extensive experience in delivering high-quality results. Passionate about continuous learning and contributing to team success.'}
        </p>
      </div>

      {/* Work Experience */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3" style={headerStyle}>Work Experience</h2>
        <div className="border-b-2 mb-4" style={borderStyle}></div>
        {resumeData.workExperience && resumeData.workExperience.length > 0 ? (
          resumeData.workExperience.map((exp, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-lg font-medium" style={headerStyle}>{exp.title || 'Job Title'}</h3>
                <span className="text-gray-600">{exp.startDate || '2020'} - {exp.endDate || 'Present'}</span>
              </div>
              <div className="text-gray-700 mb-2">{exp.company || 'Company Name'}</div>
              <div className="text-gray-600">
                {exp.responsibilities ? (
                  exp.responsibilities.split('\n').map((resp, idx) => (
                    <p key={idx} className="mb-1">{resp.trim()}</p>
                  ))
                ) : (
                  <p className="mb-1">Responsible for various duties and achievements in this role.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-lg font-medium" style={headerStyle}>Senior Software Developer</h3>
                <span className="text-gray-600">2022 - Present</span>
              </div>
              <div className="text-gray-700 mb-2">Tech Innovations Ltd.</div>
              <div className="text-gray-600">
                <p className="mb-1">• Led development of multiple full-stack web applications using React and Node.js</p>
                <p className="mb-1">• Collaborated with cross-functional teams to deliver projects 20% ahead of schedule</p>
                <p className="mb-1">• Implemented best practices and coding standards, reducing bug reports by 35%</p>
                <p className="mb-1">• Mentored junior developers and conducted code reviews</p>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-lg font-medium" style={headerStyle}>Frontend Developer</h3>
                <span className="text-gray-600">2020 - 2022</span>
              </div>
              <div className="text-gray-700 mb-2">Digital Solutions Inc.</div>
              <div className="text-gray-600">
                <p className="mb-1">• Developed responsive web interfaces using HTML, CSS, and JavaScript</p>
                <p className="mb-1">• Optimized application performance, improving load times by 40%</p>
                <p className="mb-1">• Worked closely with UX/UI designers to implement pixel-perfect designs</p>
                <p className="mb-1">• Maintained and updated legacy codebases</p>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-lg font-medium" style={headerStyle}>Junior Developer</h3>
                <span className="text-gray-600">2019 - 2020</span>
              </div>
              <div className="text-gray-700 mb-2">StartUp Ventures</div>
              <div className="text-gray-600">
                <p className="mb-1">• Assisted in developing web applications and mobile apps</p>
                <p className="mb-1">• Participated in agile development methodologies and daily standups</p>
                <p className="mb-1">• Gained experience with various programming languages and frameworks</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Skills */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3" style={headerStyle}>Skills</h2>
        <div className="border-b-2 mb-4" style={borderStyle}></div>
        <div className="flex flex-wrap gap-2">
          {resumeData.skills && resumeData.skills.length > 0 ? (
            resumeData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-white text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {skill}
              </span>
            ))
          ) : (
            ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'HTML/CSS', 'Git', 'AWS', 'MongoDB', 'Express.js', 'TypeScript', 'Vue.js', 'Docker', 'REST APIs', 'Agile/Scrum'].map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-white text-sm"
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
        <div className="border-b-2 mb-4" style={borderStyle}></div>
        {resumeData.education && resumeData.education.length > 0 ? (
          resumeData.education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-lg font-medium" style={headerStyle}>{edu.degree || 'Bachelor of Science'}</h3>
                  <div className="text-gray-700">{edu.university || 'University Name'}</div>
                </div>
                <div className="text-gray-600">{edu.year || '2020'}</div>
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-lg font-medium" style={headerStyle}>Bachelor of Science in Computer Science</h3>
                  <div className="text-gray-700">University of Technology</div>
                  <div className="text-gray-600 text-sm">GPA: 3.8/4.0 • Magna Cum Laude</div>
                </div>
                <div className="text-gray-600">2015 - 2019</div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-lg font-medium" style={headerStyle}>Relevant Coursework</h3>
                  <div className="text-gray-600 text-sm">Data Structures, Algorithms, Software Engineering, Database Systems, Web Development</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Certifications */}
      {resumeData.certifications && resumeData.certifications.length > 0 ? (
        <div>
          <h2 className="text-2xl font-semibold mb-3" style={headerStyle}>Certifications</h2>
          <div className="border-b-2 mb-4" style={borderStyle}></div>
          <ul className="list-disc list-inside text-gray-700">
            {resumeData.certifications.map((cert, index) => (
              <li key={index} className="mb-2">{cert}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-3" style={headerStyle}>Certifications</h2>
          <div className="border-b-2 mb-4" style={borderStyle}></div>
          <ul className="list-disc list-inside text-gray-700">
            <li className="mb-2">AWS Certified Developer - Associate (2023)</li>
            <li className="mb-2">MongoDB Certified Developer (2022)</li>
            <li className="mb-2">Google Analytics Certified (2022)</li>
            <li className="mb-2">Scrum Master Certification (2021)</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DefaultTemplate; 