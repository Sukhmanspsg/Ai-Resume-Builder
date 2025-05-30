module.exports = function injectTemplate(templateHtml, data) {
    const replace = (key, value) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      const safeValue =
        typeof value === 'string' || typeof value === 'number'
          ? value
          : '[Missing]';
      templateHtml = templateHtml.replace(regex, safeValue);
    };
  
    const scalarFields = ['name', 'title', 'summary', 'email', 'contact', 'linkedin', 'references'];
    scalarFields.forEach((key) => replace(key, data[key]));
  
    const renderList = (arr) => {
      if (!arr || arr.length === 0) return '';
      if (typeof arr[0] === 'string') {
        return `<ul>${arr.map(item => `<li>${item}</li>`).join('')}</ul>`;
      }
      return arr.map(obj => `<li>${Object.values(obj).join(': ')}</li>`).join('');
    };
  
    const arrayFields = ['skills', 'certifications', 'projects', 'education', 'experience'];
  
    arrayFields.forEach((key) => {
      const value = data[key];
      const html = Array.isArray(value) ? renderList(value) : '';
      replace(key, html);
    });
  
    // Final cleanup of unresolved tags
    templateHtml = templateHtml.replace(/{{\s*[\w]+\s*}}/g, '[Missing]');
    return templateHtml;
  };
  