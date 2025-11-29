# Dashboard Complete - Quiz 2

A comprehensive full-stack document management system with advanced analytics dashboard, built with React frontend and Node.js backend.

## 🚀 Features

### 🔐 Authentication & User Management
- ✅ User Registration with Client-side Validation
- ✅ User Registration with Server-side Validation  
- ✅ Data Storage in MongoDB Database
- ✅ User Login Authentication
- ✅ JWT Token-based Authentication with Auto-refresh
- ✅ Password Encryption with bcrypt
- ✅ Redirect to Login Page After Registration
- ✅ LocalStorage for Token Management
- ✅ Protected Routes with AuthContext
- ✅ User Profile Management
- ✅ Password Change Functionality

### 📊 Dashboard & Analytics
- ✅ Real-time Dashboard with Live Statistics
- ✅ Interactive Charts (Line, Area, Bar, Pie)
- ✅ Document Upload Trends Analysis
- ✅ File Type Distribution Analytics
- ✅ User Activity Monitoring
- ✅ Real-time Backend Health Monitoring
- ✅ CountUp Animations for Statistics
- ✅ Responsive Dashboard Layout

### 📄 Document Management System
- ✅ File Upload with Drag & Drop Interface
- ✅ Multi-file Upload Support
- ✅ Document CRUD Operations (Create, Read, Update, Delete)
- ✅ Document Categories (Document, Image, Video, Audio, Other)
- ✅ File Type Detection and Validation
- ✅ Document Tagging System
- ✅ File Size Formatting and Validation
- ✅ Document Status Management
- ✅ Bulk Document Operations
- ✅ Document Search and Filtering
- ✅ Document Details View
- ✅ Upload Progress Tracking
- ✅ File Queue Management

### 👥 Advanced User Management
- ✅ Complete User CRUD Operations
- ✅ User List with Pagination
- ✅ User Search and Filtering
- ✅ Bulk User Operations
- ✅ User Status Management
- ✅ User Profile Updates
- ✅ Real-time User Statistics

### 🎨 UI/UX Features
- ✅ Modern React Components with Framer Motion
- ✅ Responsive Design with Tailwind CSS
- ✅ Loading Spinners and Progress Indicators
- ✅ Toast Notifications System
- ✅ Sticky Upload Button
- ✅ Animated Transitions
- ✅ Professional Gradient Designs
- ✅ Icon Integration (Lucide React)
- ✅ Form Validation with Real-time Feedback

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Hooks
- React Router DOM v6
- Tailwind CSS 3.0
- Vite (Build Tool)
- Framer Motion (Animations)
- Recharts (Analytics Charts)
- React CountUp (Statistics)
- Lucide React (Icons)
- Axios (HTTP Client)

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose ODM
- Multer (File Upload Handling)
- bcrypt (Password Hashing)
- JWT (JSON Web Tokens)
- express-validator (Input Validation)
- CORS (Cross-Origin Resource Sharing)

**Database Models:**
- User Model (Authentication & Profile)
- Document Model (File Management)

## 📁 Project Structure

```
dashboard-complete-quiz-2/
├── BackEnd-Project/              # Node.js Backend
│   ├── models/
│   │   ├── User.js              # User MongoDB Model
│   │   └── Document.js          # Document MongoDB Model
│   ├── myFiles/                 # API Routes
│   │   ├── register.js          # Registration API
│   │   ├── auth.js              # Authentication API
│   │   ├── users.js             # User Management CRUD
│   │   ├── documents.js         # Document Management CRUD
│   │   ├── analytics.js         # Analytics & Statistics API
│   │   ├── course.js            # Course Management
│   │   ├── exercise.js          # Exercise Management
│   │   └── result.js            # Results Management
│   ├── middleware/
│   │   └── auth.js              # JWT Authentication Middleware
│   ├── utils/
│   │   └── healthMonitor.js     # Health Monitoring Utilities
│   ├── uploads/                 # File Upload Directory
│   ├── db.js                    # Database Connection
│   ├── index.js                 # Main Server File
│   └── package.json
└── FrontEnd-React-Assignment-1/  # React Frontend
    ├── src/
    │   ├── components/          # Reusable Components
    │   │   ├── DocumentManagement.jsx
    │   │   ├── UserManagement.jsx
    │   │   ├── HealthBadge.jsx
    │   │   ├── Layout.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── auth/
    │   │   │   └── ProtectedRoute.jsx
    │   │   └── ui/
    │   │       └── LoadingSpinner.jsx
    │   ├── pages/               # Page Components
    │   │   ├── Dashboard.jsx    # Main Dashboard with Analytics
    │   │   ├── UploadPage.jsx   # Document Upload Interface
    │   │   ├── DocumentDetails.jsx
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Home.jsx
    │   │   ├── About.jsx
    │   │   ├── Contact.jsx
    │   │   ├── Services.jsx
    │   │   └── ForgotPassword.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx  # Authentication Context
    │   ├── services/
    │   │   ├── api.js           # Axios API Configuration
    │   │   ├── backend.js       # Backend Service Functions
    │   │   └── AI Services/     # AI-powered tools
    │   │       ├── AiHumanizer.jsx
    │   │       ├── KeywordChecker.jsx
    │   │       ├── PromptOptimizer.jsx
    │   │       └── ReadabilityAnalyzer.jsx
    │   └── utils/               # Utility Functions
    │       ├── charLength.js
    │       ├── isAlphabetOnly.js
    │       ├── regEmailTest.js
    │       └── sanitizeInput.js
    ├── package.json
    └── vite.config.js
```

## Installation & Setup

### Backend Setup
```bash
cd BackEnd-Project
npm install
node index.js
```

### Frontend Setup
```bash
cd FrontEnd-React-Assignment-1
npm install
npm run dev
```

## Environment Variables

**Important:** For security reasons, environment variables are stored in `env.txt` file instead of `.env` file when pushing to GitHub.

To use environment variables:
1. Rename `env.txt` to `.env` in your local development
2. Update the values with your actual credentials
3. The `.env` file is ignored by git for security

Example env.txt (rename to .env for local use):
```
MONGO_URI=mongodb://localhost:27017/myDBTest
JWT_SECRET=your-secret-key-here
PORT=5000
```

**Note:** The `env.txt` file contains example values only. Replace with your actual database URI and JWT secret for production use.

## 🔗 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `POST /api/refresh` - Refresh JWT token
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `PUT /api/change-password` - Change password

### User Management (CRUD)
- `GET /api/users` - Get all users with pagination
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `DELETE /api/bulk/:criteria` - Bulk delete users
- `PUT /api/bulk/:criteria` - Bulk update users

### Document Management (CRUD)
- `POST /api/documents/upload` - Upload document(s)
- `GET /api/documents` - Get all documents with filtering
- `GET /api/documents/:id` - Get specific document
- `PUT /api/documents/:id` - Update document metadata
- `DELETE /api/documents/:id` - Delete document
- `PATCH /api/documents/:id/status` - Update document status
- `DELETE /api/documents/bulk/:criteria` - Bulk delete documents

### Analytics & Statistics
- `GET /api/documents/analytics/stats` - Document statistics
- `GET /api/documents/analytics/trends` - Upload trends
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/usage` - Usage statistics

### Health Monitoring
- `GET /health` - Basic server health check
- `GET /health/detailed` - Detailed health information

## Validation Features

### Client-side Validation
- First/Last name: Letters only, 2-35 characters
- Email: Valid email format
- Password: Minimum 6 characters
- Confirm password matching
- Terms agreement required

### Server-side Validation
- Express-validator for input validation
- Duplicate email prevention
- Password encryption with bcrypt
- Structured error responses

## 🚦 Usage Guide

### Getting Started
1. Start MongoDB service
2. Run backend server: `cd BackEnd-Project && node index.js`
3. Run frontend: `cd FrontEnd-React-Assignment-1 && npm run dev`
4. Access application at `http://localhost:3001`

### Application Features
1. **Registration**: Create account at `/signup` with validation
2. **Login**: Access dashboard at `/login` 
3. **Dashboard**: View analytics and manage data at `/dashboard`
4. **Document Upload**: Upload files with drag & drop interface
5. **User Management**: CRUD operations for user accounts
6. **Document Management**: Full document lifecycle management
7. **Analytics**: Real-time statistics and trend analysis

### File Upload Guidelines
- **Maximum file size**: 50MB per file
- **Supported formats**: PDF, DOC, DOCX, images, videos, archives
- **Multiple files**: Simultaneous upload supported
- **Categories**: Auto-detection or manual selection
- **Tagging**: Add tags for better organization

## 💾 Database Schema

### User Model
```javascript
{
  firstName: String (required, 2-35 chars, letters only),
  lastName: String (required, 2-35 chars, letters only),
  email: String (required, unique, validated),
  password: String (required, bcrypt hashed),
  country: String (required),
  agreeToTerms: Boolean (required),
  role: String (default: 'user'),
  status: String (default: 'active'),
  timestamps: Date (createdAt, updatedAt)
}
```

### Document Model
```javascript
{
  title: String (required, max 200 chars),
  description: String (max 1000 chars),
  filename: String (required, system generated),
  originalName: String (required, user uploaded name),
  mimeType: String (required),
  size: Number (required, in bytes),
  path: String (required, file system path),
  uploadedBy: ObjectId (ref: User, required),
  category: String (enum: document, image, video, audio, other),
  tags: Array of Strings,
  status: String (enum: active, archived, deleted),
  isPublic: Boolean (default: false),
  downloadCount: Number (default: 0),
  timestamps: Date (createdAt, updatedAt)
}
```

## 🔄 Application Flow

### Authentication Flow
1. User registers → Validation → Data saved to DB → Redirect to login
2. User logs in → JWT token generated → Stored in localStorage
3. Protected routes use token for authentication
4. Auto token refresh on expiration
5. Automatic logout on token failure

### Document Management Flow
1. User uploads files → Validation → Multer processing → Database storage
2. Files stored in `/uploads` directory with metadata in MongoDB
3. Real-time upload progress tracking
4. Drag & drop interface with file queue management
5. Document CRUD operations with permissions

### Dashboard Analytics Flow
1. Real-time data fetching from MongoDB
2. Statistical calculations and trend analysis
3. Interactive charts rendering with Recharts
4. Live updates and animations

## 🎯 Key Features Implemented

### Complete CRUD Operations
- ✅ **Users**: Create, Read, Update, Delete with bulk operations
- ✅ **Documents**: Full lifecycle management with file uploads
- ✅ **Analytics**: Real-time statistics and trend analysis
- ✅ **Authentication**: Secure JWT-based system with auto-refresh

### Advanced UI Components
- ✅ **Interactive Dashboard**: Charts, statistics, and live data
- ✅ **File Upload Interface**: Drag & drop with progress tracking
- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
- ✅ **Animations**: Smooth transitions with Framer Motion

### Performance & Security
- ✅ **Optimized API calls**: Axios interceptors and error handling
- ✅ **Input validation**: Client and server-side validation
- ✅ **File security**: Proper file type validation and storage
- ✅ **Authentication**: Protected routes and token management

## 🏆 Project Status

This is a **complete full-stack application** with:
- ✅ Frontend: Modern React with advanced UI components
- ✅ Backend: RESTful API with comprehensive CRUD operations  
- ✅ Database: MongoDB with proper schema design
- ✅ Authentication: Secure JWT implementation
- ✅ File Management: Complete upload/download system
- ✅ Analytics: Real-time dashboard with charts
- ✅ Responsive Design: Mobile and desktop optimized

## 👨‍💻 Author

**Created for AWD Course - 5th Semester Project**
- Complete Document Management System
- Advanced Analytics Dashboard  
- Modern React.js Implementation
- RESTful API Design
- MongoDB Database Integration
