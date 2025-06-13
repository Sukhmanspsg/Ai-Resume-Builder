-- Insert Professional Template (Default)
INSERT INTO templates (name, description, html_code, category) VALUES (
'Professional',
'A classic, professional template perfect for traditional industries and corporate positions.',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{name}} - Resume</title>
    <style>
        body {
            font-family: "Times New Roman", serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid {{primaryColor}};
            padding-bottom: 20px;
        }
        .name {
            font-size: 2.5em;
            font-weight: bold;
            color: {{primaryColor}};
            margin-bottom: 10px;
        }
        .contact-info {
            color: #666;
            font-size: 0.9em;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 1.3em;
            font-weight: bold;
            color: {{primaryColor}};
            border-bottom: 1px solid {{primaryColor}};
            margin-bottom: 15px;
            padding-bottom: 5px;
        }
        .job-entry {
            margin-bottom: 20px;
        }
        .job-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 5px;
        }
        .job-title {
            font-weight: bold;
            color: {{primaryColor}};
            font-size: 1.1em;
        }
        .job-dates {
            color: #666;
            font-style: italic;
        }
        .company {
            color: #555;
            margin-bottom: 8px;
        }
        .responsibilities {
            color: #444;
            margin-left: 20px;
        }
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .skill-tag {
            background-color: {{primaryColor}};
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.85em;
            display: inline-block;
        }
        .education-entry {
            margin-bottom: 15px;
        }
        .degree {
            font-weight: bold;
            color: {{primaryColor}};
        }
        .university {
            color: #555;
        }
        .year {
            color: #666;
            float: right;
        }
        ul {
            margin: 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">{{name}}</div>
        <div class="contact-info">
            {{email}} | {{contact}}{{#if linkedin}} | {{linkedin}}{{/if}}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Professional Summary</div>
        <p>{{summary}}</p>
    </div>

    <div class="section">
        <div class="section-title">Work Experience</div>
        {{experience}}
    </div>

    <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills-container">
            {{skills}}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Education</div>
        {{education}}
    </div>

    {{#if certifications}}
    <div class="section">
        <div class="section-title">Certifications</div>
        {{certifications}}
    </div>
    {{/if}}
</body>
</html>',
'Professional'
);

-- Insert Modern Template
INSERT INTO templates (name, description, html_code, category) VALUES (
'Modern',
'A contemporary design with a gradient header and modern styling, perfect for creative and tech roles.',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{name}} - Resume</title>
    <style>
        body {
            font-family: "Arial", sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, {{primaryColor}} 0%, {{primaryColor}}99 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .name {
            font-size: 2.8em;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .contact-info {
            font-size: 0.95em;
            opacity: 0.95;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 1.4em;
            font-weight: bold;
            color: {{primaryColor}};
            margin-bottom: 10px;
        }
        .section-accent {
            width: 60px;
            height: 3px;
            background-color: {{primaryColor}};
            margin-bottom: 20px;
        }
        .job-entry {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .job-entry:last-child {
            border-bottom: none;
        }
        .job-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 8px;
        }
        .job-title {
            font-weight: bold;
            color: {{primaryColor}};
            font-size: 1.15em;
        }
        .job-dates {
            color: #666;
            font-size: 0.9em;
        }
        .company {
            color: #555;
            margin-bottom: 10px;
            font-weight: 500;
        }
        .responsibilities {
            color: #444;
        }
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }
        .skill-tag {
            background-color: {{primaryColor}};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 500;
        }
        .education-entry {
            margin-bottom: 20px;
        }
        .degree {
            font-weight: bold;
            color: {{primaryColor}};
            font-size: 1.1em;
        }
        .university {
            color: #555;
            margin: 5px 0;
        }
        .education-details {
            color: #666;
            font-size: 0.9em;
        }
        .year {
            color: #666;
            float: right;
            font-weight: 500;
        }
        ul {
            margin: 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">{{name}}</div>
        <div class="contact-info">
            {{email}} • {{contact}}{{#if linkedin}} • {{linkedin}}{{/if}}
        </div>
    </div>

    <div class="content">
        <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="section-accent"></div>
            <p>{{summary}}</p>
        </div>

        <div class="section">
            <div class="section-title">Work Experience</div>
            <div class="section-accent"></div>
            {{experience}}
        </div>

        <div class="section">
            <div class="section-title">Skills</div>
            <div class="section-accent"></div>
            <div class="skills-container">
                {{skills}}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Education</div>
            <div class="section-accent"></div>
            {{education}}
        </div>

        {{#if certifications}}
        <div class="section">
            <div class="section-title">Certifications</div>
            <div class="section-accent"></div>
            {{certifications}}
        </div>
        {{/if}}
    </div>
</body>
</html>',
'Modern'
);

-- Insert Minimal Template
INSERT INTO templates (name, description, html_code, category) VALUES (
'Minimal',
'A clean, minimalist design focusing on content and readability with plenty of white space.',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{name}} - Resume</title>
    <style>
        body {
            font-family: "Helvetica Neue", Arial, sans-serif;
            line-height: 1.7;
            color: #2c2c2c;
            max-width: 700px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
        }
        .header {
            margin-bottom: 40px;
            padding-bottom: 20px;
        }
        .name {
            font-size: 2.2em;
            font-weight: 300;
            color: {{primaryColor}};
            margin-bottom: 8px;
            letter-spacing: 1px;
        }
        .contact-info {
            color: #666;
            font-size: 0.9em;
            font-weight: 300;
        }
        .section {
            margin-bottom: 35px;
        }
        .section-title {
            font-size: 1.1em;
            font-weight: 600;
            color: {{primaryColor}};
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 20px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e0e0e0;
        }
        .job-entry {
            margin-bottom: 25px;
        }
        .job-header {
            margin-bottom: 8px;
        }
        .job-title {
            font-weight: 600;
            color: #333;
            font-size: 1.05em;
        }
        .job-dates {
            color: #888;
            font-size: 0.85em;
            float: right;
            font-weight: 400;
        }
        .company {
            color: {{primaryColor}};
            margin-bottom: 10px;
            font-weight: 500;
        }
        .responsibilities {
            color: #555;
            font-weight: 300;
        }
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .skill-tag {
            border: 1px solid {{primaryColor}};
            color: {{primaryColor}};
            padding: 6px 14px;
            border-radius: 2px;
            font-size: 0.8em;
            font-weight: 400;
            letter-spacing: 0.5px;
        }
        .education-entry {
            margin-bottom: 20px;
        }
        .degree {
            font-weight: 600;
            color: #333;
        }
        .university {
            color: {{primaryColor}};
            margin: 3px 0;
            font-weight: 400;
        }
        .year {
            color: #888;
            float: right;
            font-size: 0.9em;
        }
        ul {
            margin: 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
            font-weight: 300;
        }
        p {
            font-weight: 300;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">{{name}}</div>
        <div class="contact-info">
            {{email}} · {{contact}}{{#if linkedin}} · {{linkedin}}{{/if}}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Summary</div>
        <p>{{summary}}</p>
    </div>

    <div class="section">
        <div class="section-title">Experience</div>
        {{experience}}
    </div>

    <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills-container">
            {{skills}}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Education</div>
        {{education}}
    </div>

    {{#if certifications}}
    <div class="section">
        <div class="section-title">Certifications</div>
        {{certifications}}
    </div>
    {{/if}}
</body>
</html>',
'Minimal'
); 