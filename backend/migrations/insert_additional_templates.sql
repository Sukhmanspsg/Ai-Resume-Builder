-- Insert Creative Template
INSERT INTO templates (name, description, html_code, category) VALUES (
'Creative',
'A bold, colorful template perfect for designers, artists, and creative professionals.',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{name}} - Creative Resume</title>
    <style>
        body {
            font-family: "Montserrat", sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            background: #f8f9fa;
        }
        .container {
            display: grid;
            grid-template-columns: 1fr 2fr;
            min-height: 100vh;
        }
        .sidebar {
            background: linear-gradient(45deg, {{primaryColor}}, {{primaryColor}}dd);
            color: white;
            padding: 40px 30px;
        }
        .main-content {
            background: white;
            padding: 40px;
        }
        .profile-section {
            text-align: center;
            margin-bottom: 30px;
        }
        .name {
            font-size: 1.8em;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        .title {
            font-size: 1em;
            opacity: 0.9;
            font-weight: 300;
            margin-bottom: 20px;
        }
        .contact-item {
            margin-bottom: 15px;
            font-size: 0.9em;
            display: flex;
            align-items: center;
        }
        .contact-icon {
            width: 20px;
            height: 20px;
            margin-right: 10px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .sidebar-section {
            margin-bottom: 30px;
        }
        .sidebar-title {
            font-size: 1.1em;
            font-weight: 600;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .skill-item {
            background: rgba(255,255,255,0.1);
            padding: 8px 12px;
            margin-bottom: 8px;
            border-radius: 15px;
            font-size: 0.85em;
            text-align: center;
        }
        .section-title {
            font-size: 1.5em;
            font-weight: 700;
            color: {{primaryColor}};
            margin-bottom: 20px;
            position: relative;
        }
        .section-title::after {
            content: "";
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 50px;
            height: 3px;
            background: {{primaryColor}};
        }
        .experience-item {
            margin-bottom: 30px;
            padding-left: 20px;
            border-left: 3px solid {{primaryColor}};
            position: relative;
        }
        .experience-item::before {
            content: "";
            position: absolute;
            left: -8px;
            top: 5px;
            width: 12px;
            height: 12px;
            background: {{primaryColor}};
            border-radius: 50%;
        }
        .job-title {
            font-size: 1.2em;
            font-weight: 600;
            color: {{primaryColor}};
            margin-bottom: 5px;
        }
        .company-info {
            color: #666;
            margin-bottom: 10px;
            font-style: italic;
        }
        .job-description {
            color: #555;
            line-height: 1.6;
        }
        .education-item {
            margin-bottom: 20px;
        }
        .degree {
            font-weight: 600;
            color: {{primaryColor}};
            margin-bottom: 5px;
        }
        .school {
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="sidebar">
            <div class="profile-section">
                <div class="name">{{name}}</div>
                <div class="title">Creative Professional</div>
            </div>
            
            <div class="sidebar-section">
                <div class="sidebar-title">Contact</div>
                <div class="contact-item">
                    <div class="contact-icon">@</div>
                    {{email}}
                </div>
                <div class="contact-item">
                    <div class="contact-icon">📞</div>
                    {{contact}}
                </div>
                {{#if linkedin}}
                <div class="contact-item">
                    <div class="contact-icon">🔗</div>
                    {{linkedin}}
                </div>
                {{/if}}
            </div>

            <div class="sidebar-section">
                <div class="sidebar-title">Skills</div>
                {{skills}}
            </div>

            {{#if certifications}}
            <div class="sidebar-section">
                <div class="sidebar-title">Certifications</div>
                {{certifications}}
            </div>
            {{/if}}
        </div>

        <div class="main-content">
            <div class="section">
                <div class="section-title">About Me</div>
                <p>{{summary}}</p>
            </div>

            <div class="section">
                <div class="section-title">Experience</div>
                {{experience}}
            </div>

            <div class="section">
                <div class="section-title">Education</div>
                {{education}}
            </div>
        </div>
    </div>
</body>
</html>',
'Creative'
);

-- Insert Executive Template
INSERT INTO templates (name, description, html_code, category) VALUES (
'Executive',
'A sophisticated template for C-level executives and senior management positions.',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{name}} - Executive Resume</title>
    <style>
        body {
            font-family: "Georgia", serif;
            line-height: 1.8;
            color: #2c2c2c;
            max-width: 850px;
            margin: 0 auto;
            padding: 60px 40px;
            background: white;
        }
        .header {
            text-align: center;
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 3px solid {{primaryColor}};
        }
        .name {
            font-size: 3em;
            font-weight: normal;
            color: {{primaryColor}};
            margin-bottom: 10px;
            letter-spacing: 2px;
        }
        .executive-title {
            font-size: 1.3em;
            color: #666;
            font-style: italic;
            margin-bottom: 20px;
        }
        .contact-info {
            color: #666;
            font-size: 1em;
            line-height: 1.4;
        }
        .section {
            margin-bottom: 45px;
        }
        .section-title {
            font-size: 1.4em;
            font-weight: bold;
            color: {{primaryColor}};
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 25px;
            text-align: center;
        }
        .executive-summary {
            font-size: 1.1em;
            line-height: 1.9;
            color: #444;
            text-align: justify;
            border-left: 4px solid {{primaryColor}};
            padding-left: 25px;
            font-style: italic;
        }
        .achievement-item {
            margin-bottom: 35px;
            padding: 25px;
            background: #f8f9fa;
            border-left: 5px solid {{primaryColor}};
        }
        .role-title {
            font-size: 1.3em;
            font-weight: bold;
            color: {{primaryColor}};
            margin-bottom: 8px;
        }
        .company-info {
            font-size: 1.1em;
            color: #666;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .tenure {
            font-style: italic;
            color: #888;
        }
        .achievements {
            color: #555;
            font-size: 1.05em;
        }
        .key-metrics {
            background: {{primaryColor}};
            color: white;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            font-weight: bold;
        }
        .competencies {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .competency {
            background: #f8f9fa;
            padding: 15px;
            text-align: center;
            border: 1px solid #e9ecef;
            font-weight: 500;
            color: {{primaryColor}};
        }
        .education-executive {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding: 20px;
            background: #f8f9fa;
        }
        .degree-info {
            flex: 1;
        }
        .degree-title {
            font-size: 1.2em;
            font-weight: bold;
            color: {{primaryColor}};
        }
        .institution {
            color: #666;
            font-style: italic;
        }
        .year {
            color: #888;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">{{name}}</div>
        <div class="executive-title">Senior Executive</div>
        <div class="contact-info">
            {{email}} | {{contact}}{{#if linkedin}} | {{linkedin}}{{/if}}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Executive Summary</div>
        <div class="executive-summary">
            {{summary}}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Professional Experience</div>
        {{experience}}
    </div>

    <div class="section">
        <div class="section-title">Core Competencies</div>
        <div class="competencies">
            {{skills}}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Education</div>
        {{education}}
    </div>

    {{#if certifications}}
    <div class="section">
        <div class="section-title">Professional Development</div>
        {{certifications}}
    </div>
    {{/if}}
</body>
</html>',
'Executive'
);

-- Insert Technical Template
INSERT INTO templates (name, description, html_code, category) VALUES (
'Technical',
'A structured template optimized for software engineers and technical professionals.',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{name}} - Technical Resume</title>
    <style>
        body {
            font-family: "Fira Code", "Monaco", monospace;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fafafa;
        }
        .terminal-window {
            background: #1e1e1e;
            color: #00ff00;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            font-family: "Fira Code", monospace;
        }
        .terminal-header {
            background: #333;
            color: white;
            padding: 10px;
            margin: -20px -20px 20px;
            border-radius: 8px 8px 0 0;
            font-size: 0.9em;
        }
        .name {
            font-size: 2em;
            color: #00ff00;
            font-weight: bold;
        }
        .role {
            color: #ffff00;
            margin: 10px 0;
        }
        .contact {
            color: #00ffff;
        }
        .section {
            background: white;
            margin-bottom: 25px;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid {{primaryColor}};
        }
        .section-title {
            font-size: 1.3em;
            font-weight: bold;
            color: {{primaryColor}};
            margin-bottom: 20px;
            font-family: "Fira Code", monospace;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .section-title::before {
            content: "// ";
            color: #999;
        }
        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        .tech-item {
            background: {{primaryColor}};
            color: white;
            padding: 8px 12px;
            text-align: center;
            border-radius: 4px;
            font-size: 0.85em;
            font-family: "Fira Code", monospace;
        }
        .experience-block {
            margin-bottom: 25px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 3px solid {{primaryColor}};
        }
        .job-function {
            font-size: 1.1em;
            font-weight: bold;
            color: {{primaryColor}};
            font-family: "Fira Code", monospace;
            margin-bottom: 5px;
        }
        .company-tenure {
            color: #666;
            margin-bottom: 15px;
            font-family: "Fira Code", monospace;
        }
        .tech-highlights {
            background: #e8f4fd;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }
        .code-block {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 4px;
            font-family: "Fira Code", monospace;
            font-size: 0.9em;
            margin: 10px 0;
            overflow-x: auto;
        }
        .achievement-list {
            list-style: none;
            padding: 0;
        }
        .achievement-list li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        .achievement-list li::before {
            content: ">";
            color: {{primaryColor}};
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        .project-card {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .project-title {
            font-weight: bold;
            color: {{primaryColor}};
            margin-bottom: 10px;
            font-family: "Fira Code", monospace;
        }
        .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        .tech-tag {
            background: #e9ecef;
            color: #495057;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 0.8em;
            font-family: "Fira Code", monospace;
        }
    </style>
</head>
<body>
    <div class="terminal-window">
        <div class="terminal-header">user@resume:~$ cat profile.txt</div>
        <div class="name">{{name}}</div>
        <div class="role">SOFTWARE ENGINEER</div>
        <div class="contact">{{email}} | {{contact}}{{#if linkedin}} | {{linkedin}}{{/if}}</div>
    </div>

    <div class="section">
        <div class="section-title">Summary</div>
        <p>{{summary}}</p>
    </div>

    <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="tech-grid">
            {{skills}}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Professional Experience</div>
        {{experience}}
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
'Technical'
);

-- Insert Academic Template
INSERT INTO templates (name, description, html_code, category) VALUES (
'Academic',
'A formal template designed for researchers, professors, and academic professionals.',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{name}} - Academic CV</title>
    <style>
        body {
            font-family: "Times New Roman", serif;
            line-height: 1.7;
            color: #2c2c2c;
            max-width: 750px;
            margin: 0 auto;
            padding: 40px 30px;
            background: white;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid {{primaryColor}};
        }
        .name {
            font-size: 2.2em;
            font-variant: small-caps;
            color: {{primaryColor}};
            margin-bottom: 8px;
            letter-spacing: 1px;
        }
        .academic-title {
            font-size: 1.1em;
            color: #666;
            margin-bottom: 15px;
            font-style: italic;
        }
        .contact-info {
            color: #666;
            font-size: 0.95em;
            line-height: 1.4;
        }
        .section {
            margin-bottom: 35px;
        }
        .section-title {
            font-size: 1.2em;
            font-variant: small-caps;
            font-weight: bold;
            color: {{primaryColor}};
            border-bottom: 1px solid {{primaryColor}};
            margin-bottom: 20px;
            padding-bottom: 5px;
            letter-spacing: 1px;
        }
        .research-summary {
            font-size: 1.05em;
            line-height: 1.8;
            text-align: justify;
            color: #444;
            margin-bottom: 20px;
        }
        .position-entry {
            margin-bottom: 25px;
        }
        .position-title {
            font-weight: bold;
            color: {{primaryColor}};
            font-size: 1.05em;
        }
        .institution {
            color: #666;
            font-style: italic;
            margin-bottom: 5px;
        }
        .date-range {
            color: #888;
            font-size: 0.9em;
            float: right;
        }
        .description {
            color: #555;
            margin-top: 10px;
        }
        .education-entry {
            margin-bottom: 20px;
        }
        .degree {
            font-weight: bold;
            color: {{primaryColor}};
        }
        .university {
            color: #666;
            font-style: italic;
        }
        .thesis {
            color: #555;
            font-size: 0.95em;
            margin-top: 5px;
        }
        .publication {
            margin-bottom: 15px;
            text-align: justify;
            text-indent: -2em;
            margin-left: 2em;
        }
        .authors {
            font-weight: 500;
        }
        .journal {
            font-style: italic;
            color: {{primaryColor}};
        }
        .award-entry {
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
        }
        .award-title {
            font-weight: 500;
            color: {{primaryColor}};
        }
        .award-year {
            color: #666;
        }
        .research-area {
            background: #f8f9fa;
            padding: 15px;
            border-left: 4px solid {{primaryColor}};
            margin-bottom: 15px;
        }
        .keywords {
            font-style: italic;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">{{name}}</div>
        <div class="academic-title">Academic Researcher</div>
        <div class="contact-info">
            {{email}} | {{contact}}{{#if linkedin}} | {{linkedin}}{{/if}}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Research Interests</div>
        <div class="research-summary">
            {{summary}}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Academic Positions</div>
        {{experience}}
    </div>

    <div class="section">
        <div class="section-title">Education</div>
        {{education}}
    </div>

    <div class="section">
        <div class="section-title">Research Areas</div>
        {{skills}}
    </div>

    {{#if certifications}}
    <div class="section">
        <div class="section-title">Professional Development</div>
        {{certifications}}
    </div>
    {{/if}}
</body>
</html>',
'Academic'
); 