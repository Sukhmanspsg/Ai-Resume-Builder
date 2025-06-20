# AI Resume Builder

An intelligent resume builder application that helps users create professional resumes with AI-powered suggestions and feedback.

## 🚀 Features

- AI-powered resume suggestions
- Multiple professional templates
- Real-time resume preview
- ATS scoring and optimization
- Cover letter generation
- User authentication
- Resume storage and management
- Feedback system

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 📋 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Sukhmanspsg/Ai-Resume-Builder.git
cd ai-resume-builder
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
# Server Configuration
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=resume_builder

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800  # 50MB in bytes

# AI Service Configuration (if using any AI services)
AI_API_KEY=your_ai_api_key
```

4. Set up the database:
```bash
# Run the database setup script
node setup-database.js
```

5. Start the backend server:
```bash
npm start
```

### 3. Frontend Setup

1. Open a new terminal and navigate to the project root:
```bash
cd ai-resume-builder
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The application should now be running at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 Project Structure

```
ai-resume-builder/
├── backend/               # Backend server code
│   ├── controllers/      # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── migrations/      # Database migrations
├── src/                 # Frontend React code
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   └── utils/          # Frontend utilities
└── public/             # Static files
```

## 🔧 Environment Variables

Make sure to set up all required environment variables in the backend `.env` file. The application won't work without proper configuration.

## 📝 API Documentation

The backend API documentation is available at `/api/docs` when running the server.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Sukhman Singh - Initial work

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for their invaluable tools and libraries
