# Rakshak - Emergency Response System

## Introduction
Rakshak is a comprehensive emergency response system designed to connect community members, emergency responders, and local authorities in real-time. The platform facilitates quick emergency reporting, efficient response coordination, and community safety management through an intuitive interface and powerful features.

## Project Type
Fullstack

## Deployed App
Frontend: [https://rakshak.vercel.app](https://rakshak.vercel.app)  
Backend: [https://rakshak-api.onrender.com](https://rakshak-api.onrender.com)  
Database: MongoDB Atlas

## Directory Structure
```
rakshak/
├── src/                    # Frontend source code
│   ├── components/         # Reusable React components
│   ├── features/          # Redux slices and feature modules
│   ├── pages/             # Page components
│   └── services/          # API services
├── server/                # Backend source code
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   └── middlewares/  # Custom middlewares
├── public/               # Static files
└── package.json         # Project dependencies
```

## Video Walkthrough of the project
[Watch Demo](https://youtu.be/sYsCS94QU3c) (1-3 minutes)

## Video Walkthrough of the codebase
[Code Walkthrough](link-to-code-walkthrough) (1-5 minutes)

## Features

### User Features
- Real-time incident reporting with location tracking
- Interactive map view of nearby incidents
- Community forum for safety discussions
- Real-time chat with responders
- Incident status tracking and notifications

### Responder Features
- Live incident tracking and response management
- Real-time location updates and status management
- Direct communication with incident reporters
- Resource coordination tools
- Response analytics and reporting

### Moderator Features
- Incident verification and management
- Community content moderation
- Analytics dashboard
- Resource allocation oversight
- System administration tools

## Design Decisions & Assumptions

### Technical Decisions
1. **Real-time Updates**: Using Socket.IO for real-time communication between users, responders, and the system
2. **Geospatial Data**: MongoDB with 2dsphere indexing for efficient location-based queries
3. **State Management**: Redux for global state management with feature-based slice architecture
4. **Authentication**: JWT-based authentication with role-based access control
5. **UI Framework**: Tailwind CSS for responsive and consistent design

### Assumptions
1. Users have access to devices with GPS capabilities
2. Responders are verified professionals
3. Stable internet connection for real-time features
4. Mobile-first usage patterns
5. Urban area deployment initially

## Installation & Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/rakshak.git
cd rakshak

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configurations

# Start server
npm run dev
```

## Usage

### User Registration & Login
```bash
# Example API call
curl -X POST http://localhost:3000/api/auth/register 
-H "Content-Type: application/json" 
-d '{"name": "John Doe", "email": "john@example.com", "password": "secure123"}'
```

## Credentials
For testing purposes, use these credentials:

**Regular User**:
- Email: user@demo.com
- Password: demo123

**Responder**:
- Email: responder@demo.com
- Password: demo123

**Moderator**:
- Email: moderator@demo.com
- Password: demo123

## APIs Used
- Google Maps API for map visualization
- OpenCage Geocoding API for address lookup
- OpenWeatherMap API for weather conditions

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/profile - Get user profile

### Incidents
- GET /api/incidents - List incidents
- POST /api/incidents - Report new incident
- GET /api/incidents/:id - Get incident details
- PATCH /api/incidents/:id - Update incident
- POST /api/incidents/:id/assign - Assign responders

### Responder Operations
- POST /api/responder/location - Update responder location
- PATCH /api/responder/status - Update responder status

### Community
- GET /api/community/posts - List community posts
- POST /api/community/posts - Create new post
- POST /api/community/posts/:id/like - Like/unlike post

## Technology Stack

### Frontend
- React.js with Vite
- Redux Toolkit for state management
- Tailwind CSS for styling
- Socket.IO client for real-time features
- Leaflet for maps
- Recharts for analytics visualization

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Socket.IO for real-time communication
- JWT for authentication
- Express-validator for input validation
- Bcrypt for password hashing

### DevOps & Tools
- Git for version control
- ESLint for code linting
- Prettier for code formatting
- MongoDB Atlas for database hosting
- Vercel for frontend deployment
- Render for backend deployment
