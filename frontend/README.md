# Hospital Management Dashboard

A comprehensive hospital management system with patient registration, appointment scheduling, billing, and reporting functionalities.

## Features

- User authentication with JWT
- Role-based access control (Admin, Doctor, Staff)
- Patient registration and management
- Interactive dashboard with charts and statistics
- MongoDB database for data storage

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
├── src/                  # Frontend React application
│   ├── api/              # API integration
│   ├── assets/           # Static assets
│   ├── components/       # Reusable components
│   ├── context/          # Context API providers
│   ├── data/             # Static data (dummy data)
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Page layouts
│   ├── pages/            # Main pages
│   ├── styles/           # Global styles
│   └── utils/            # Utility functions
├── backend/              # Node.js Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # API controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Mongoose models
│   └── routes/           # Express routes
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd hospital-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   cd backend && npm install
   ```

3. Configure environment variables:
   - Create .env file in the backend directory with:
     ```
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/hospital_management
     JWT_SECRET=your_jwt_secret_key
     NODE_ENV=development
     ```

4. Run the application:
   ```
   npm start
   ```
   This will start both the frontend (port 5173) and backend (port 5000) concurrently.

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## Usage

1. Register a new user account
2. Login with your credentials
3. Navigate through the dashboard to access different features

## MongoDB Schema

### User
- name (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- role (String, enum: ['admin', 'doctor', 'staff'])
- isActive (Boolean)

### Patient
- personal information (name, age, gender, etc.)
- contact information
- medical history
- membership details

## License

This project is licensed under the MIT License.
