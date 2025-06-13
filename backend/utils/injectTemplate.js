module.exports = function injectTemplate(templateHtml, data, primaryColor = '#1A237E') {
    // Handle primary color replacement
    templateHtml = templateHtml.replace(/\{\{primaryColor\}\}/g, primaryColor);
    
    // Helper function to safely replace placeholders
    const replace = (key, value) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      const safeValue = value != null ? String(value) : '';
      templateHtml = templateHtml.replace(regex, safeValue);
    };
  
    // Replace scalar fields
    const scalarFields = ['name', 'title', 'summary', 'email', 'contact', 'linkedin', 'references', 'photo'];
    scalarFields.forEach((key) => replace(key, data[key]));
  
    // Handle skills array
    if (data.skills && Array.isArray(data.skills)) {
      const skillsHtml = data.skills.map(skill => {
        // Check if template uses skill-tag class or simple list items
        if (templateHtml.includes('skill-tag')) {
          return `<span class="skill-tag">${skill}</span>`;
        } else if (templateHtml.includes('tech-item')) {
          return `<div class="tech-item">${skill}</div>`;
        } else if (templateHtml.includes('skill-item')) {
          return `<div class="skill-item">${skill}</div>`;
        } else if (templateHtml.includes('competency')) {
          return `<div class="competency">${skill}</div>`;
        } else {
          return `<li>${skill}</li>`;
        }
      }).join('');
      
      // Wrap in container if needed
      const finalSkillsHtml = templateHtml.includes('<ul>{{skills}}</ul>') 
        ? skillsHtml 
        : skillsHtml;
      
      replace('skills', finalSkillsHtml);
    } else {
      replace('skills', '');
    }
  
    // Handle work experience array
    if (data.workExperience && Array.isArray(data.workExperience)) {
      const experienceHtml = data.workExperience.map(exp => {
        const responsibilities = exp.responsibilities 
          ? (typeof exp.responsibilities === 'string' 
              ? exp.responsibilities.split('\n').map(r => `<p class="mb-1">${r.trim()}</p>`).join('')
              : Array.isArray(exp.responsibilities)
                ? exp.responsibilities.map(r => `<p class="mb-1">${r}</p>`).join('')
                : `<p class="mb-1">${exp.responsibilities}</p>`)
          : '';
  
        // Different template styles for experience entries
        if (templateHtml.includes('experience-item')) {
          return `
            <div class="experience-item">
              <div class="job-title">${exp.title || ''}</div>
              <div class="company-info">${exp.company || ''} | ${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
              <div class="job-description">${responsibilities}</div>
            </div>
          `;
        } else if (templateHtml.includes('experience-block')) {
          return `
            <div class="experience-block">
              <div class="job-function">${exp.title || ''}</div>
              <div class="company-tenure">${exp.company || ''} | ${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
              <div class="responsibilities">${responsibilities}</div>
            </div>
          `;
        } else if (templateHtml.includes('achievement-item')) {
          return `
            <div class="achievement-item">
              <div class="role-title">${exp.title || ''}</div>
              <div class="company-info">
                <span>${exp.company || ''}</span>
                <span class="tenure">${exp.startDate || ''} - ${exp.endDate || 'Present'}</span>
              </div>
              <div class="achievements">${responsibilities}</div>
            </div>
          `;
        } else if (templateHtml.includes('position-entry')) {
          return `
            <div class="position-entry">
              <div class="position-title">${exp.title || ''}</div>
              <div class="institution">${exp.company || ''}</div>
              <div class="date-range">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
              <div class="description">${responsibilities}</div>
            </div>
          `;
        } else {
          // Default format
          return `
            <div class="job-entry">
              <div class="job-header">
                <div class="job-title">${exp.title || ''}</div>
                <div class="job-dates">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
              </div>
              <div class="company">${exp.company || ''}</div>
              <div class="responsibilities">${responsibilities}</div>
            </div>
          `;
        }
      }).join('');
      
      replace('experience', experienceHtml);
    } else {
      replace('experience', '');
    }
  
    // Handle education array
    if (data.education && Array.isArray(data.education)) {
      const educationHtml = data.education.map(edu => {
        if (templateHtml.includes('education-executive')) {
          return `
            <div class="education-executive">
              <div class="degree-info">
                <div class="degree-title">${edu.degree || ''}</div>
                <div class="institution">${edu.university || ''}</div>
              </div>
              <div class="year">${edu.year || ''}</div>
            </div>
          `;
        } else if (templateHtml.includes('education-item')) {
          return `
            <div class="education-item">
              <div class="degree">${edu.degree || ''}</div>
              <div class="school">${edu.university || ''}</div>
              <div class="year">${edu.year || ''}</div>
            </div>
          `;
        } else {
          return `
            <div class="education-entry">
              <div class="degree">${edu.degree || ''}</div>
              <div class="university">${edu.university || ''}</div>
              <div class="year">${edu.year || ''}</div>
            </div>
          `;
        }
      }).join('');
      
      replace('education', educationHtml);
    } else {
      replace('education', '');
    }
  
    // Handle certifications array
    if (data.certifications && Array.isArray(data.certifications)) {
      const certificationsHtml = data.certifications.map(cert => {
        if (templateHtml.includes('award-entry')) {
          return `<div class="award-entry"><span class="award-title">${cert}</span></div>`;
        } else if (templateHtml.includes('skill-item')) {
          return `<div class="skill-item">${cert}</div>`;
        } else {
          return `<li>${cert}</li>`;
        }
      }).join('');
      
      const finalCertHtml = templateHtml.includes('<ul>{{certifications}}</ul>') 
        ? certificationsHtml 
        : `<ul>${certificationsHtml}</ul>`;
      
      replace('certifications', finalCertHtml);
    } else {
      replace('certifications', '');
    }

    // Handle projects array if present
    if (data.projects && Array.isArray(data.projects)) {
      const projectsHtml = data.projects.map(project => {
        return `
          <div class="project-card">
            <div class="project-title">${project.title || project.name || ''}</div>
            <div class="project-description">${project.description || ''}</div>
            ${project.technologies ? `<div class="tech-stack">${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}</div>` : ''}
          </div>
        `;
      }).join('');
      
      replace('projects', projectsHtml);
    } else {
      replace('projects', '');
    }
    
    // Handle conditional sections (Handlebars-style)
    templateHtml = templateHtml.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      if (data[condition] && (Array.isArray(data[condition]) ? data[condition].length > 0 : data[condition])) {
        return content;
      }
      return '';
    });
  
    // Clean up any remaining unresolved placeholders
    templateHtml = templateHtml.replace(/\{\{[^}]+\}\}/g, '');
    
    return templateHtml;
};
  