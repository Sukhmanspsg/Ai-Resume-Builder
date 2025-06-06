# 🚀 AI Resume Builder

A modern, full-stack resume builder application with AI-powered features, multiple professional templates, and comprehensive user management.

## ✨ Features

### 📄 Resume Creation & Management
- **Multiple Professional Templates** - Choose from Professional, Modern, and Minimal designs
- **Interactive Resume Editor** - Real-time editing with instant preview
- **Color Customization** - Multiple color schemes for each template
- **Smart Form Validation** - Ensures complete and professional resumes
- **Export Options** - PDF and DOCX download capabilities

### 📝 Cover Letter System  
- **Automatic Generation** - AI-powered cover letter creation
- **Template Matching** - Consistent styling with selected resume template
- **Customizable Content** - Edit and personalize generated letters

### 🔐 User Management
- **Secure Authentication** - JWT-based login system
- **User Profiles** - Personalized dashboard experience
- **Resume History** - Save and manage multiple resumes
- **Admin Panel** - Administrative controls and user management

### 🛠️ Technical Features
- **Modern UI/UX** - Built with React 19 and Tailwind CSS
- **Responsive Design** - Works perfectly on all devices
- **Database Integration** - MySQL backend for data persistence
- **RESTful API** - Clean backend architecture
- **Feedback System** - User feedback collection and management

## 🏗️ Tech Stack

### Frontend
- **React 19.1.0** - Modern React with latest features
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

### AI Integration
- **GROQ API** - Advanced AI language model integration
- **LLaMA 4 Scout** - Latest AI model for content generation

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- GROQ API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sukhmanspsg/Ai-Resume-Builder.git
   cd Ai-Resume-Builder
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Configure your environment variables
   # - Database credentials
   # - GROQ API key
   # - JWT secret
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npm run migrate
   ```

5. **Start the application**
   ```bash
   # Start backend server
   cd backend
   npm start
   
   # In another terminal, start frontend
   cd ..
   npm start
   ```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
Ai-Resume-Builder/
├── src/                    # Frontend React application
│   ├── components/         # Reusable React components
│   ├── pages/             # Application pages
│   ├── services/          # API service functions
│   └── styles/            # CSS and styling files
├── backend/               # Backend Node.js application
│   ├── controllers/       # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API route definitions
│   ├── middleware/       # Authentication & validation
│   └── utils/            # Utility functions
├── public/               # Static files
└── package.json         # Project dependencies
```

## 🎯 Available Templates

1. **Professional Template** - Classic design perfect for traditional industries
2. **Modern Template** - Contemporary design with gradient headers
3. **Minimal Template** - Clean, minimalist design focusing on content

Each template includes:
- Multiple color schemes
- Responsive design
- Professional formatting
- Export capabilities

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Resumes
- `GET /api/resumes` - Get user resumes
- `POST /api/resumes` - Create new resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Templates
- `GET /api/templates` - Get available templates
- `POST /api/templates/generate` - AI template generation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sukhman Singh**
- GitHub: [@Sukhmanspsg](https://github.com/Sukhmanspsg)
- Project Link: [https://github.com/Sukhmanspsg/Ai-Resume-Builder](https://github.com/Sukhmanspsg/Ai-Resume-Builder)

## 🙏 Acknowledgments

- Built with modern web technologies
- AI integration powered by GROQ
- UI/UX inspired by modern design principles
- Community feedback and contributions

---

⭐ **If you found this project helpful, please give it a star!** ⭐
