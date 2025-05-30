import React from 'react';

const DefaultTemplate = ({ resume }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header Section with blue background */}
      <div className="bg-[#1A237E] text-white p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{resume.name}</h1>
          <div>
            <p>{resume.email} | {resume.contact}</p>
            {resume.linkedin && (
              <p>
                <a href={resume.linkedin} className="text-white hover:text-gray-200">{resume.linkedin}</a>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Professional Summary */}
        {resume.summary && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#1A237E] border-b-2 border-[#1A237E] pb-2 mb-3">Professional Summary</h2>
            <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {resume.workExperience && resume.workExperience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#1A237E] border-b-2 border-[#1A237E] pb-2 mb-3">Work Experience</h2>
            {resume.workExperience.map((exp, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1A237E]">{exp.title}</h3>
                    <p className="text-[#1A237E]">{exp.company}</p>
                  </div>
                  <span className="text-gray-600">{exp.duration}</span>
                </div>
                <div className="text-gray-700 pl-4">
                  {exp.responsibilities.split('\n').map((resp, idx) => (
                    <p key={idx} className="mb-1 flex items-start">
                      <span className="mr-2">•</span>
                      {resp}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#1A237E] border-b-2 border-[#1A237E] pb-2 mb-3">Education</h2>
            {resume.education.map((edu, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1A237E]">{edu.degree}</h3>
                    <p className="text-[#1A237E]">{edu.university}</p>
                  </div>
                  <span className="text-gray-600">{edu.year}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resume.skills && resume.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#1A237E] border-b-2 border-[#1A237E] pb-2 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#1A237E] border-b-2 border-[#1A237E] pb-2 mb-3">Certifications</h2>
            <ul className="list-none pl-4 text-gray-700">
              {resume.certifications.map((cert, index) => (
                <li key={index} className="mb-1 flex items-start">
                  <span className="mr-2">•</span>
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* References */}
        {resume.references && (
          <div>
            <h2 className="text-xl font-bold text-[#1A237E] border-b-2 border-[#1A237E] pb-2 mb-3">References</h2>
            <p className="text-gray-700">{resume.references}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultTemplate; 