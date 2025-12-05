StudentPool – A Peer-to-Peer Ride-Sharing Platform for Students

deployed at https://student-pool.vercel.app/

StudentPool is a ride-sharing platform built exclusively for students. It solves the chaos of WhatsApp ride coordination by enabling verified students to create, discover, and join rides with transparent cost-sharing and organized communication.

🚀 Features
1. Authentication & Verification

Student signup using college email

Secure login with JWT

Password hashing using bcryptjs

2. Ride Management (CRUD)

Create new rides

View all upcoming rides

Cancel rides

Edit timing, seats, cost (future update)

Auto cost-split per person

3. Ride Discovery

Search by origin → destination

Filter by time, date, seat availability

Map integration (Leaflet + React-Leaflet)

Route preview (future)

4. In-Ride Chat System

Secure chat between ride members

Message history per ride

5. Notifications

When someone joins a ride

When ride details are updated

New chat messages

6. Integrations

WhatsApp share link

Quick redirect to Ola/Uber

🏗 System Architecture
Frontend (React.js)
        ↓
Backend API (Node.js + Express 5)
        ↓
Database (PostgreSQL via Prisma ORM)

🛠 Tech Stack
Frontend

React.js

React Router

Axios

Leaflet + React-Leaflet

Backend

Node.js

Express 5

JWT Authentication

bcryptjs

Prisma ORM

Database

PostgreSQL (Neon)

Dev Tools

nodemon

dotenv

CORS

Hosting

Frontend → Vercel / Netlify

Backend → Render / Railway

Database → Neon

📡 API Endpoints
Auth Routes
Method	Endpoint	Description	Access
POST	/api/auth/signup	Register a new student	Public
POST	/api/auth/login	Login & receive JWT	Public
Ride Routes
Method	Endpoint	Description	Access
GET	/api/rides	Get all available rides	JWT
POST	/api/rides	Create a new ride	JWT
PUT	/api/rides/:id	Update ride details	JWT
DELETE	/api/rides/:id	Cancel ride	JWT
POST	/api/rides/:id/join	Join a ride	JWT
Chat Routes
Method	Endpoint	Description	Access
GET	/api/chat/:rideId	Fetch chat messages	JWT
POST	/api/chat/:rideId	Send chat message	JWT
📁 Project Folder Structure (Recommended)
backend/
│── src/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── prisma/
│   ├── utils/
│   └── index.js
│
├── prisma/
│   └── schema.prisma
│
├── .env
├── package.json
└── README.md

frontend/
│── src/
│── public/
│── package.json
└── README.md

⚙️ Environment Variables (.env)

Backend .env example:

DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=5000


Frontend .env example:



▶️ Running the Project
Backend Setup
cd backend
npm install
npx prisma generate
npm run dev

Frontend Setup
cd frontend
npm install
npm start

🔮 Future Enhancements
AI/ML Features

Smart ride recommendations

Peak travel prediction

Fake account detection

App Features

Real-time location sharing

Payment (UPI) integration

Ratings & reviews

SOS emergency button

🧾 Conclusion

StudentPool transforms messy WhatsApp-based ride coordination into a structured, verified, and organized student-only ride-sharing system.
With a strong stack (React + Express 5 + Prisma + PostgreSQL), the platform is scalable, secure, and ready for real-world deployment.