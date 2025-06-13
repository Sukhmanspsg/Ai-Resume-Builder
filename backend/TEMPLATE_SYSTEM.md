# Database-Driven Template System

## Overview
ResumePro now uses a database-driven template system instead of hardcoded React components. This allows for:

- **Dynamic template management** - Add/edit/delete templates without code changes
- **Better scalability** - Store unlimited templates in the database
- **Admin control** - Manage templates through the admin panel
- **Consistent rendering** - Use server-side template injection

## Architecture

### Database Schema
```sql
CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    html_code LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    category VARCHAR(100) DEFAULT 'General'
);
```

### Template Structure
Templates are stored as HTML with placeholder variables:

```html
<!DOCTYPE html>
<html>
<head>
    <title>{{name}} - Resume</title>
    <style>
        .header { color: {{primaryColor}}; }
        /* CSS styles here */
    </style>
</head>
<body>
    <div class="header">
        <h1>{{name}}</h1>
        <p>{{email}} | {{contact}}</p>
    </div>
    
    <div class="section">
        <h2>Experience</h2>
        {{experience}}
    </div>
    
    <div class="section">
        <h2>Skills</h2>
        {{skills}}
    </div>
</body>
</html>
```

## Placeholder Variables

### Scalar Fields
- `{{name}}` - Full name
- `{{email}}` - Email address
- `{{contact}}` - Phone number
- `{{linkedin}}` - LinkedIn profile
- `{{summary}}` - Professional summary
- `{{primaryColor}}` - Theme color (hex code)

### Array Fields
- `{{skills}}` - Rendered as skill tags or list items
- `{{experience}}` - Work experience entries
- `{{education}}` - Educational background
- `{{certifications}}` - Certifications and awards
- `{{projects}}` - Project portfolio (optional)

### Conditional Sections
```html
{{#if certifications}}
<div class="section">
    <h2>Certifications</h2>
    {{certifications}}
</div>
{{/if}}
```

## Pre-built Templates

### 1. Professional Template
- Classic design with Times New Roman
- Traditional layout for corporate roles
- Clean typography and structured sections

### 2. Modern Template
- Contemporary design with gradient header
- Sans-serif fonts and modern styling
- Eye-catching color schemes

### 3. Minimal Template
- Clean, minimalist approach
- Lots of white space
- Focus on content readability

### 4. Creative Template
- Two-column layout with sidebar
- Bold colors and creative typography
- Perfect for design professionals

### 5. Executive Template
- Sophisticated design for C-level positions
- Elegant typography and formal layout
- Emphasis on achievements and leadership

### 6. Technical Template
- Code-inspired design with monospace fonts
- Terminal-style header
- Optimized for software engineers

### 7. Academic Template
- Formal academic CV layout
- Traditional serif fonts
- Structured for research positions

## Setup Instructions

### 1. Run Database Setup
```bash
cd backend
node run-setup.js
```

This will:
- Create the templates table
- Insert all default templates
- Verify database connection

### 2. Verify Installation
- Check admin panel at `/admin` to see templates
- Templates should appear in the template selection page
- Test template rendering with sample data

## API Endpoints

### Get All Templates
```
GET /api/templates
```

### Get Template by ID
```
GET /api/templates/:id
```

### Create New Template
```
POST /api/templates
Body: { name, description, html_code }
```

### Update Template
```
PUT /api/templates/:id
Body: { name, description, html_code }
```

### Delete Template
```
DELETE /api/templates/:id
```

### Render Template
```
GET /api/templates/:id/render?resumeId=123&primaryColor=%23FF5722
```

## Template Development

### Creating New Templates

1. **Design HTML Structure**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <title>{{name}} - Resume</title>
       <style>
           /* Your CSS styles */
           .primary { color: {{primaryColor}}; }
       </style>
   </head>
   <body>
       <!-- Template content with placeholders -->
   </body>
   </html>
   ```

2. **Add Placeholder Variables**
   - Use `{{variableName}}` for scalar values
   - Use array placeholders for dynamic content
   - Add conditional sections with `{{#if condition}}`

3. **Style with CSS Classes**
   - `.skill-tag` for skill chips
   - `.job-entry` for work experience
   - `.education-entry` for education items
   - `.tech-item` for technical skills

4. **Test and Validate**
   - Use the admin panel to add the template
   - Test with sample resume data
   - Verify color customization works

### Best Practices

1. **Responsive Design** - Use flexible layouts
2. **Print Optimization** - Consider print CSS
3. **Color Variables** - Always use `{{primaryColor}}`
4. **Semantic HTML** - Use proper heading hierarchy
5. **Fallback Content** - Handle missing data gracefully

## Troubleshooting

### Common Issues

1. **Templates not showing**
   - Check database connection
   - Verify templates table exists
   - Run setup script again

2. **Rendering errors**
   - Check console for template injection errors
   - Verify placeholder syntax
   - Test with minimal resume data

3. **Styling issues**
   - Ensure CSS is self-contained
   - Check color variable usage
   - Test across different browsers

### Debug Mode
Enable detailed logging by setting:
```javascript
console.log("🔍 Rendering template:", templateId, "| Resume ID:", resumeId, "| Color:", primaryColor);
```

## Migration from React Components

The old React-based templates (`DefaultTemplate`, `ModernTemplate`, `MinimalTemplate`) have been converted to HTML templates in the database. The system now:

1. Fetches templates from database instead of importing React components
2. Renders HTML on the server using template injection
3. Serves pre-rendered HTML for faster loading
4. Supports unlimited templates without code deployment

## Future Enhancements

- **Template Editor** - Visual template editor in admin panel
- **Theme System** - Pre-defined color schemes
- **Template Categories** - Filter templates by industry
- **Template Marketplace** - Community-contributed templates
- **Advanced Layouts** - Multi-page resume support 