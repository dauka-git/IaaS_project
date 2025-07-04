# Mastercard IaaS Application

A comprehensive web application for Mastercard Issuing-as-a-Service (IaaS) that allows potential customers to apply for card issuing services with real-time ROI calculations and admin management capabilities.

## Features

- **Multi-step Application Form**: Guided application process with real-time ROI calculations
- **Real-time ROI Analysis**: Dynamic cost comparison and break-even analysis with interactive charts
- **User Authentication**: Secure registration and login system
- **User Dashboard**: Track application status and view submitted applications
- **Admin Dashboard**: Review and manage applications with status updates
- **Responsive Design**: Modern UI built with Material-UI
- **Chart Visualization**: Interactive charts using Recharts

## Tech Stack

- **Frontend**: React 19, TypeScript, Material-UI, Recharts, Formik, Yup
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT tokens
- **Charts**: Recharts for data visualization

## Project Structure

```
mastercard-iaas-app/
├── server/                 # Backend application
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts
│   ├── index.js           # Server entry point
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── interfaces/    # TypeScript interfaces
│   │   ├── utils/         # Utility functions and API
│   │   └── styles/        # CSS styles
│   ├── package.json       # Frontend dependencies
│   └── index.html         # HTML entry point
├── package.json           # Root package.json for workspace
└── README.md             # This file
```

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Development Servers
```bash
npm run dev
```

This will start both:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5174

### 3. Individual Commands
```bash
# Start only backend
npm run server

# Start only frontend
npm run frontend

# Start backend with nodemon (auto-restart)
npm run server:dev
```

## Environment Setup

The server `.env` file is already configured with:
- MongoDB connection to local database
- JWT secret for authentication
- CORS settings for frontend
- Server port configuration

## Usage

1. **Register/Login**: Create an account or sign in
2. **Dashboard**: View your applications and create new ones
3. **Apply**: Fill out the multi-step IaaS application form
4. **ROI Analysis**: See real-time cost comparisons and charts
5. **Admin**: Access admin dashboard (if admin role)

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile/:userId` - Update user profile

### IaaS Applications
- `POST /api/applications` - Submit new application
- `GET /api/applications/user/:userId` - Get user's applications
- `GET /api/applications/:applicationId` - Get specific application
- `POST /api/calculate-roi` - Calculate ROI without saving

### Admin Endpoints
- `GET /api/admin/applications` - Get all applications (admin only)
- `PUT /api/admin/applications/:applicationId` - Update application status (admin only)
- `POST /api/admin/applications/:applicationId/contact` - Add contact attempt (admin only)

## Database Models

### User
- Basic user information (name, email, company)
- Role-based access (user/admin)
- Authentication data

### IaaSApplication
- Application details (company, requirements, timeline)
- Calculated ROI data
- Status tracking and admin notes
- Contact attempt history

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 