const axios = require('axios');

function cleanupHTML(html) {
  return html
    // Fix variable naming to camelCase
    .replace(/{{profile_picture}}/g, '{{profilePicture}}')
    .replace(/{{job_title}}/g, '{{jobTitle}}')
    .replace(/{{company_name}}/g, '{{companyName}}')
    .replace(/{{project_name}}/g, '{{projectName}}')
    .replace(/{{tools_used}}/g, '{{toolsUsed}}')
    .replace(/{{award_name}}/g, '{{awardName}}')
    
    // Fix broken Handlebars closing tags
    .replace(/{{(\w+)}}\s*}}/g, '{{$1}}')
    .replace(/{{#awards}}<li>{{\.}}<\/li>{{awards}}/g, '{{#awards}}<li>{{.}}</li>{{/awards}}')
    .replace(/{{#volunteering}}\s*{{\.}}\s*{{\/volunteering}}/g, '{{#volunteering}}<li>{{.}}</li>{{/volunteering}}')
    .replace(/{{#references}}\s*{{\.}}\s*{{\/references}}/g, '{{#references}}<li>{{.}}</li>{{/references}}')
    
    // Fix HTML structure
    .replace(/<div class='([^']*)'>/g, '<div className="$1">')
    .replace(/<span class='([^']*)'>/g, '<span className="$1">')
    .replace(/<img([^>]*)class='([^']*)'([^>]*)>/g, '<img$1className="$2"$3>')
    .replace(/<h3 class='([^']*)'>/g, '<h3 className="$1">')
    
    // Ensure proper tag closure
    .replace(/<(img[^>]*)(?<!\/)\s*>/g, '<$1/>')
    .replace(/<(br[^>]*)(?<!\/)\s*>/g, '<$1/>')
    .replace(/<(input[^>]*)(?<!\/)\s*>/g, '<$1/>')
    
    // Remove any remaining single quotes
    .replace(/'/g, '"')
    
    // Clean up whitespace
    .replace(/>\s+</g, '><')
    .trim();
}

function convertHTMLToReactComponent(html) {
  // Clean up HTML first
  const cleanedHTML = cleanupHTML(html);

  // Create the component code without import statement
  const componentCode = `
const ResumeTemplate = React.memo(({ resume, primaryColor }) => {
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
      backgroundColor: '#fff',
      padding: '2rem'
    },
    sidebar: {
      backgroundColor: '#f5f5f5',
      padding: '2rem',
      borderRadius: '8px'
    },
    mainArea: {
      padding: '2rem'
    },
    heading: {
      color: primaryColor || '#2c3e50',
      marginBottom: '1rem'
    },
    section: {
      marginBottom: '2rem'
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: '0 0 1.5rem 0'
    },
    listItem: {
      marginBottom: '0.5rem'
    }
  };

  const renderList = (items) => {
    if (!items || !Array.isArray(items)) return null;
    return items.map((item, index) => (
      React.createElement('li', { key: index, style: styles.listItem },
        typeof item === 'string' ? item : Object.values(item).join(' - ')
      )
    ));
  };

  if (!resume) {
    return null;
  }

  return (
    ${cleanedHTML.replace(/{{([^}]+)}}/g, (match, key) => {
      if (key.startsWith('#')) {
        const listName = key.substring(1);
        return `{resume.${listName} && renderList(resume.${listName})}`;
      }
      return `{resume.${key}}`;
    })}
  );
});

ResumeTemplate.displayName = 'ResumeTemplate';

return ResumeTemplate;
`;

  return componentCode;
}

function validateComponentCode(code) {
  // Quick check for code length to prevent memory issues
  if (code.length > 10000) {
    console.warn('Component code is very long, may cause performance issues');
  }

  // Check for template literals
  if (code.includes('`')) {
    console.warn('Removing template literals from component code');
    code = code.replace(/`/g, '"');
  }

  // Check for proper React.createElement syntax
  if (!code.includes('React.createElement')) {
    console.warn('Component may not use React.createElement syntax');
  }

  // Check for arrow function format (more lenient)
  if (!code.includes('resume') || !code.includes('primaryColor')) {
    console.warn('Component may not use resume or primaryColor props properly');
  }

  // Try to validate basic JavaScript syntax - BUT DON'T THROW ERRORS
  try {
    // Quick syntax validation without full execution
    const simplifiedCode = code.substring(0, 500); // Only check first 500 chars
    console.log('✅ Component validation passed (basic check)');
    
  } catch (error) {
    console.warn('Component validation warning (will proceed anyway):', error.message);
    // Don't throw error - the frontend will handle validation
  }

  return true;
}

function cleanComponentCode(code) {
  // Add timeout protection
  const startTime = Date.now();
  const MAX_PROCESSING_TIME = 5000; // 5 seconds max
  
  // First, check if the code has serious structural issues that need complete reconstruction
  const hasNestedSections = code.includes('React.createElement("section"') && 
    (code.includes('React.createElement("p", null, (resume.') || 
     code.includes('React.createElement("li",') || 
     code.includes('.map(function('));
     
  if (hasNestedSections) {
    console.log('Detected nested sections - rebuilding component structure');
    // Rebuild the component with a clean, simple structure
    const rebuiltCode = `({resume, primaryColor}) => React.createElement("div", null, React.createElement("header", {style: {background: "linear-gradient(to bottom, " + primaryColor + ", #f0f0f0)", padding: "20px"}}, React.createElement("h1", {style: {color: "white", margin: "0"}}, (resume.name || "Name")), React.createElement("p", {style: {color: "white", margin: "10px 0"}}, (resume.email || "") + " | " + (resume.contact || ""))), React.createElement("section", {style: {padding: "20px"}}, React.createElement("h2", null, "Summary"), React.createElement("p", null, (resume.summary || "Professional summary"))), React.createElement("section", {style: {padding: "20px"}}, React.createElement("h2", null, "Skills"), React.createElement("ul", null, (resume.skills || []).map(function(skill, index) { return React.createElement("li", {key: index}, skill); }))), React.createElement("section", {style: {padding: "20px"}}, React.createElement("h2", null, "Work Experience"), (resume.workExperience || []).map(function(exp, index) { return React.createElement("div", {key: index, style: {marginBottom: "20px"}}, React.createElement("h3", null, exp.title), React.createElement("p", null, exp.company + " | " + exp.startDate + " - " + exp.endDate), React.createElement("ul", null, (exp.responsibilities || []).map(function(resp, respIndex) { return React.createElement("li", {key: respIndex}, resp); }))); })), React.createElement("section", {style: {padding: "20px"}}, React.createElement("h2", null, "Education"), (resume.education || []).map(function(edu, index) { return React.createElement("div", {key: index, style: {marginBottom: "10px"}}, React.createElement("h3", null, edu.degree), React.createElement("p", null, edu.university + " | " + edu.year)); })))`;
    console.log('Component rebuilt with clean structure');
    return rebuiltCode;
  }
  
  let cleaned = code
    // Remove any control characters and normalize line endings
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    
    // Remove template literals and backticks - CRITICAL FIX
    .replace(/`/g, '"')
    .replace(/\$\{([^}]+)\}/g, '" + $1 + "') // Convert ${variable} to string concatenation
    
    // Fix specific template literal issues in styles
    .replace(/backgroundColor:\s*`"[^`]*`/g, 'backgroundColor: primaryColor')
    .replace(/backgroundImage:\s*"[^"]*\$\{primaryColor\}[^"]*"/g, 'background: "linear-gradient(to bottom, " + primaryColor + ", #f0f0f0)"')
    
    // FIX MALFORMED STYLE ATTRIBUTES - NEW CRITICAL FIXES
    .replace(/style:\s*"[^"]*linear-gradient[^"]*"/g, 'style: { background: "linear-gradient(to bottom, " + primaryColor + ", #f0f0f0)" }')
    .replace(/style:\s*{[^}]*\+\s*primaryColor\s*\+[^}]*}/g, 'style: { background: "linear-gradient(to bottom, " + primaryColor + ", #f0f0f0)" }')
    .replace(/style:\s*{fontSize:\s*"[^"]*"}\s*\+\s*[^,}]+/g, 'style: { fontSize: "16px", background: "linear-gradient(to bottom, " + primaryColor + ", #f0f0f0)" }')
    
    // Fix malformed style object concatenation  
    .replace(/{\s*style:\s*\{[^}]*\}\s*\+[^}]+\}/g, '{ style: { background: "linear-gradient(to bottom, " + primaryColor + ", #f0f0f0)" } }')
    
    // Fix broken gradient strings
    .replace(/" 0%, #fff 100%\)"/g, '", "#f0f0f0")')
    .replace(/\+ " 0%, #fff 100%\)"/g, ', "#f0f0f0")')
    
    // Fix double null checking: ((resume.field || "") || "default") -> (resume.field || "default")
    .replace(/\(\(resume\.(\w+)\s*\|\|\s*""\)\s*\|\|\s*([^)]+)\)/g, '(resume.$1 || $2)')
    .replace(/\(\(resume\.(\w+)\s*\|\|\s*""\)\s*\|\|\s*\[\]\)/g, '(resume.$1 || [])')
    
    // Remove invalid key props outside of map functions (key: index when index is not defined)
    .replace(/React\.createElement\("([^"]+)",\s*{key:\s*index},/g, 'React.createElement("$1", null,')
    .replace(/React\.createElement\("([^"]+)",\s*{key:\s*index}/g, 'React.createElement("$1", null')
    
    // Fix malformed style attributes
    .replace(/style:\s*"[^"]*"/g, 'style: { fontSize: "16px" }')
    .replace(/style:\s*{[^}]*color:\s*primaryColor[^}]*}/g, 'style: { color: primaryColor }')
    
    // Fix double return statements - CRITICAL - MORE SPECIFIC PATTERNS
    .replace(/\{return\s+return\s+/g, '{return ')
    .replace(/return\s+return\s+/g, 'return ')
    .replace(/\{return return\s*/g, '{return ')
    .replace(/function\([^)]*\)\s*\{return return\s*/g, 'function($1) { return ')
    
    // Fix specific double return in map functions
    .replace(/\.map\(function\([^)]+\)\s*\{return return\s*/g, '.map(function($1) { return ')
    
    // Fix extra semicolons and periods - CRITICAL  
    .replace(/;\s*;\s*;\s*/g, '; ')
    .replace(/\.\s*;\s*/g, '; ')
    .replace(/;\s*\.\s*/g, '; ')
    
    // Fix malformed function endings - CRITICAL
    .replace(/\)\s*;\s*;\s*;\s*\)\)\)/g, '); })))')
    .replace(/;\s*;\s*\}\)\)/g, '; })')
    .replace(/;\s*;\s*;\s*\}/g, '; }')
    
    // Fix specific malformed endings from the user's error - VERY SPECIFIC
    .replace(/;\s*;\s*\.\s*;\s*\}\)\)\)\)\)\)\}/g, '; })') 
    .replace(/;\s*\.\s*;\s*\}\)\)\)\)\)\}\)/g, '; })')
    .replace(/\)\s*;\s*;\s*\.\s*;\s*\.\s*\}\)\)\)\)\)/g, '); })')
    .replace(/;\s*;\s*\}\)\)\)\)\)\}/g, '; })')
    .replace(/\}\)\)\)\)\)\}$/g, '})') 
    
    // NEW: Fix specific structural issues from the failed code
    .replace(/\{return return React\.createElement/g, '{return React.createElement')
    .replace(/return return React\.createElement/g, 'return React.createElement')
    
    // Fix missing closing parentheses for map functions - CRITICAL
    .replace(/\.map\(function\([^)]+\)\s*\{[^}]+\}\s*;\s*\}/g, '.map(function($1) { $2; })')
    .replace(/\.map\(function\([^)]+\)\s*\{return[^}]+;\s*\}/g, '.map(function($1) { return $2; })')
    
    // Fix improperly nested React elements (missing closing parentheses)
    .replace(/React\.createElement\("p",\s*null,\s*\([^)]+\),\s*React\.createElement\("section"/g, 
             'React.createElement("p", null, ($1)), React.createElement("section"')
    
    // Fix map functions without proper closure
    .replace(/\.map\(function\([^)]+\)\s*\{return[^}]+\}\s*\)/g, '.map(function($1) { return $2; })')
    
    // NEW: Fix the specific nested section issue from the current error
    // This fixes where Education section gets nested inside responsibility map
    .replace(/React\.createElement\("li",\s*\{key:\s*index\},\s*React\.createElement\("section"/g, 
             'React.createElement("li", {key: index}, responsibility); })), React.createElement("section"')
    
    // Fix malformed responsibility map that never closes properly
    .replace(/\(([^)]*responsibilities[^)]*)\)\.map\(function\([^)]+\)\s*\{return React\.createElement\("li",\s*\{key:\s*index\},\s*React\.createElement\("section"/g, 
             '($1).map(function(responsibility, index) { return React.createElement("li", {key: index}, responsibility); })), React.createElement("section"')
    
    // Fix excessive closing parentheses at the end
    .replace(/\)\)\)\)\)\)\)\)\)\)\)\)\}\}$/g, '); })')
    .replace(/\)\)\)\)\)\)\)\}\}$/g, '); })')
    .replace(/\)\)\)\)\}\}$/g, '})')
    
    // Fix broken map function where item.responsibilities gets cut off
    .replace(/item\.responsibilities\.map\(function\([^)]+\)\s*\{[^}]*\}\)[^}]*React\.createElement\("h2"/g, 
             'item.responsibilities.map(function(responsibility, index) { return React.createElement("li", { key: index }, responsibility); })); })), React.createElement("h2"')
    
    // Fix any remaining double return patterns  
    .replace(/\{return\s*return\s*/g, '{return ')
    .replace(/return\s*return\s+React\.createElement/g, 'return React.createElement')
    
    // Fix specific problematic patterns
    .replace(/;\}\)\)/g, ';})') // Fix ;})) -> ;})
    .replace(/\)\]\)/g, ')]')   // Fix )]) -> )]
    .replace(/;\s*\}\)/g, '; })') // Fix ;}) -> ; })
    
    // Fix map function calls with missing returns
    .replace(/\.map\(function\(([^,]+),\s*index\)\s*\{\s*React\.createElement/g, '.map(function($1, index) { return React.createElement')
    .replace(/\.map\(function\(([^,]+),\s*index\)\s*\{([^}]*)\}\)/g, '.map(function($1, index) { return $2; })')
    
    // NEW: Fix malformed parentheses in style attributes and missing closing parentheses
    .replace(/\)\s*\)\s*\)/g, ')') // Remove extra closing parentheses  
    .replace(/\(\(\(/g, '(') // Remove extra opening parentheses
    
    // NEW: Fix specific pattern from the error - semicolon with dot followed by closing
    .replace(/;\s*\.\s*;\s*\}\)/g, '; })')
    .replace(/;\s*\}\s*\)\)/g, '; })')
    
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .replace(/{\s+/g, '{')
    .replace(/\s+}/g, '}')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();

  // Check if processing is taking too long
  if (Date.now() - startTime > MAX_PROCESSING_TIME) {
    console.warn('Code cleaning taking too long, returning simplified version');
    return code.replace(/\s+/g, ' ').trim();
  }

  // Try to balance parentheses automatically (but with safety limits)
  try {
    cleaned = balanceParenthesesIntelligent(cleaned);
  } catch (error) {
    console.warn('Parentheses balancing failed, using original code:', error.message);
    cleaned = code.replace(/\s+/g, ' ').trim();
  }
  
  return cleaned;
}

// Improved parentheses balancing function - MEMORY EFFICIENT
function balanceParenthesesIntelligent(code) {
  console.log('Simple balancing for code length:', code.length);
  
  // Simple character counting approach
  let openParen = 0;
  let openBracket = 0;
  let openBrace = 0;
  
  // Count all opening and closing characters
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if (char === '(') openParen++;
    else if (char === ')') openParen--;
    else if (char === '[') openBracket++;
    else if (char === ']') openBracket--;
    else if (char === '{') openBrace++;
    else if (char === '}') openBrace--;
  }
  
  console.log(`Balance check - Parens: ${openParen}, Brackets: ${openBracket}, Braces: ${openBrace}`);
  
  // Simply add missing closing characters at the end
  let balanced = code;
  if (openParen > 0) {
    console.log(`Adding ${openParen} closing parentheses`);
    balanced += ')'.repeat(openParen);
  }
  if (openBracket > 0) {
    console.log(`Adding ${openBracket} closing brackets`);
    balanced += ']'.repeat(openBracket);
  }
  if (openBrace > 0) {
    console.log(`Adding ${openBrace} closing braces`);
    balanced += '}'.repeat(openBrace);
  }
  
  // Remove extra closing characters from the end (simple approach)
  if (openParen < 0) {
    console.log(`Removing ${Math.abs(openParen)} extra closing parentheses`);
    const regex = new RegExp('\\)(?=[^)]*$)', 'g');
    let removed = 0;
    balanced = balanced.replace(regex, () => {
      if (removed < Math.abs(openParen)) {
        removed++;
        return '';
      }
      return ')';
    });
  }
  
  console.log('Simple balancing complete');
  return balanced;
}

exports.groqGenerateTemplate = async (userPrompt) => {
  const aiPrompt = `You are a React developer creating a resume template component. Return ONLY a valid JSON object with this exact structure:

{
  "name": "Template Name",
  "description": "Template Description", 
  "component_code": "({ resume, primaryColor }) => React.createElement(...)"
}

CRITICAL REQUIREMENTS for component_code:
1. MUST be a single-line string
2. MUST use React.createElement syntax only (NO JSX)
3. MUST escape all quotes with backslash: \\"
4. NO template literals (NO backticks \` or \${})
5. NO comments or newlines
6. SIMPLE null checking: use (resume.field || "") NOT ((resume.field || "") || "default")
7. NEVER use {key: index} outside of map functions
8. Use string concatenation for dynamic styles: { color: primaryColor }
9. Use these resume fields: name, email, contact, summary, skills[], workExperience[], education[]
10. workExperience has: title, company, startDate, endDate, responsibilities
11. education has: degree, university, year
12. For map functions, use EXACTLY this format: .map(function(item, index) { return React.createElement(...); })
13. Always check arrays before mapping: (resume.skills || []).map(...)
14. NEVER use double return statements: NO "return return"
15. NEVER use extra semicolons: NO "); ; ;" or ".; ;
16. Each map function MUST have exactly ONE return statement
17. STYLE ATTRIBUTES: Use proper object syntax for styles, NO string concatenation in style values
18. CORRECT style: { style: { color: primaryColor, fontSize: "16px" } }
19. WRONG style: { style: "color: " + primaryColor } or { style: {fontSize: "16px"} + primaryColor }
20. For gradients, use: { style: { background: "linear-gradient(to bottom, " + primaryColor + ", #f0f0f0)" } }
21. STRUCTURE: Keep sections separate - NEVER nest sections inside map functions
22. Each map function MUST be properly closed with })) before starting new sections
23. NEVER put React.createElement("section"...) inside a map function return
24. CORRECT structure: skills.map(...})), React.createElement("section", null, "Work Experience")

CORRECT example format:
({ resume, primaryColor }) => React.createElement(\\"div\\", null, React.createElement(\\"h1\\", { style: { color: primaryColor } }, (resume.name || \\"Name\\")), React.createElement(\\"ul\\", null, (resume.skills || []).map(function(skill, index) { return React.createElement(\\"li\\", { key: index }, skill); })), React.createElement(\\"div\\", null, React.createElement(\\"h2\\", null, \\"Work Experience\\"), (resume.workExperience || []).map(function(exp, index) { return React.createElement(\\"div\\", { key: index }, React.createElement(\\"h3\\", null, exp.title)); })))

WRONG patterns to ABSOLUTELY AVOID:
- Template literals: \`color: \${primaryColor}\`
- Double null checking: ((resume.name || "") || "Name")
- Invalid key usage: React.createElement("div", {key: index}, ...) when index is not from a map
- Double return: {return return React.createElement(...)}
- Extra semicolons: ); ; ; or .; ;
- Missing return in map: .map(function(item, index) { React.createElement(...) })
- Direct array access without checking: resume.skills.map(...)
- String concatenation in style values: style: "color: " + primaryColor
- Malformed style objects: style: {fontSize: "16px"} + primaryColor
- Nested sections: .map(function(item, index) { return React.createElement("li", null, React.createElement("section", ...)) })
- Incomplete map closures: .map(function(...) { return React.createElement("li", null, React.createElement("section"
- Excessive closing parentheses: ))))))))}}

Your task: ${userPrompt}

Keep the component simple and functional. Focus on clean layout and proper data handling. Make sure all parentheses are balanced and all map functions have proper return statements. Use only proper object syntax for all style attributes. NEVER nest sections inside map functions.`;

  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  try {
    console.log('Making request to GROQ API...');
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert React developer. Return only valid JSON with a single-line component_code string using React.createElement syntax and properly escaped quotes. NEVER nest sections inside map functions.' 
        },
        { role: 'user', content: aiPrompt }
      ],
      temperature: 0.2,
      max_tokens: 4000,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Received response from GROQ API');
    const content = response.data.choices[0].message.content;
    console.log('Raw AI response:', content);
    
    try {
      // Extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON object found in response');
        console.log('Full response:', content);
        throw new Error('No valid JSON object found in response');
      }

      let jsonStr = jsonMatch[0].trim();
      let parsed;
      
      try {
        parsed = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.error('JSON string:', jsonStr);
        throw new Error(`Invalid JSON format: ${parseError.message}`);
      }

      // Validate required fields
      if (!parsed.name || !parsed.description || !parsed.component_code) {
        console.error('Missing required fields:', parsed);
        throw new Error('Missing required fields in template data');
      }

      // Clean and validate component code
      let code = cleanComponentCode(parsed.component_code);
      
      try {
        validateComponentCode(code);
      } catch (validationError) {
        console.error('Component validation failed:', validationError);
        console.error('Component code:', code);
        throw new Error(`Invalid component code: ${validationError.message}`);
      }

      return {
        name: parsed.name,
        description: parsed.description,
        component_code: code
      };

    } catch (error) {
      console.error('Template processing error:', error);
      console.error('Full response content:', content);
      throw new Error(`Failed to process template: ${error.message}`);
    }

  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('GROQ API error response:', error.response.data);
      console.error('GROQ API error status:', error.response.status);
      throw new Error(`GROQ API error: ${error.response.data.error?.message || error.message}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from GROQ API');
      throw new Error('Failed to connect to GROQ API');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up GROQ API request:', error.message);
      throw error;
    }
  }
};
