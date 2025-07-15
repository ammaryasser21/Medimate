# Medimate Project

## Overview
Medimate is a comprehensive healthcare platform that leverages AI and modern web technologies to provide features such as medical chatbot assistance, drug interaction checks, prescription and medical test OCR, and user management. The project is organized into three main components:
- **Backend Flask**: Handles AI, OCR, and medical logic.
- **Backend Node.js**: Manages authentication, user data, and history APIs.
- **Frontend (Next.js)**: User interface for interacting with the platform.

---

## Features
- AI-powered medical chatbot
- Drug interaction checker
- OCR for prescriptions and medical tests
- User authentication and profile management
- Medical history tracking

---

## Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend 1**: Flask (Python)
- **Backend 2**: Node.js, Express.js
- **Database**: MongoDB
- **Other**: AI/ML models, OCR libraries

---

## Folder Structure
```
GP/
├── Backend Flask/         # Python Flask backend (AI, OCR, medical logic)
│   └── app/
│       ├── chatbot/      # Chatbot logic
│       ├── medicines/    # Drug interaction logic
│       ├── models/       # ML models
│       ├── ocr/          # OCR utilities
│       └── utils/        # Helper utilities
├── Backend Node js/      # Node.js backend (API, Auth, User, History)
│   ├── controllers/      # API controllers
│   ├── middleware/       # Auth middleware
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   └── utilitis/         # Utility functions
├── FrontEnd/             # Next.js frontend
│   ├── app/              # Pages and views
│   ├── components/       # UI components
│   ├── hooks/            # React hooks
│   ├── lib/              # API and utility libraries
│   └── public/           # Static assets
```

---

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- Python 3.8+
- pip (Python package manager)
- MongoDB

### 1. Backend Flask
```bash
cd "Backend Flask"
pip install -r requirements.txt
# To run the Flask server:
python run.py
```

### 2. Backend Node.js
```bash
cd "Backend Node js"
npm install
# To run the Node.js server:
npm start
```

### 3. Frontend (Next.js)
```bash
cd FrontEnd
npm install
# To run the development server:
npm run dev
```

---

## Usage
1. Start the Flask backend (AI/OCR):
   - `python run.py` in `Backend Flask`
2. Start the Node.js backend (API/Auth):
   - `npm start` in `Backend Node js`
3. Start the frontend:
   - `npm run dev` in `FrontEnd`
4. Access the app at `http://localhost:3000` (default Next.js port)

---

## API Overview

### Flask Backend
- `/chatbot` — AI chatbot endpoint
- `/ocr/prescription` — OCR for prescriptions
- `/ocr/medical-test` — OCR for medical tests
- `/drug-interactions` — Drug interaction checker

### Node.js Backend
- `/api/auth` — User authentication (login/register)
- `/api/user` — User profile management
- `/api/history` — Medical history endpoints

> See `API_DOCUMENTATION.md` and `docs/` folders for detailed API specs.

---

## Contact
For questions or support, please contact the project maintainer. 