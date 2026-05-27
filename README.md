# CampusDesk — Campus Complaint Management System

A full-stack web application for managing campus complaints with real-time updates.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, React Router v6               |
| Real-time  | Socket.io (client + server)             |
| HTTP       | Axios with JWT interceptor              |
| Backend    | Node.js, Express                        |
| Database   | MongoDB with Mongoose                   |
| Auth       | JWT + bcryptjs                          |
| Uploads    | Multer (image attachments)              |
| Toasts     | react-hot-toast                         |

---

## Project Structure

```
campus-complaint/
├── server/
│   ├── config/
│   │   └── db.js                 MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     Register, login, me
│   │   ├── complaintController.js CRUD + socket emits
│   │   └── dashboardController.js Stats aggregation
│   ├── middleware/
│   │   └── auth.js               JWT protect + role guard
│   ├── models/
│   │   ├── User.js
│   │   └── Complaint.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   ├── users.js
│   │   └── dashboard.js
│   ├── utils/
│   │   └── seeder.js             Seeds demo accounts + complaints
│   ├── uploads/                  Stored images
│   ├── .env
│   ├── index.js                  Express + Socket.io server
│   └── package.json
│
└── client/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── axios.js          Axios instance with auth header
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── ComplaintCard.js
    │   │   ├── Badge.js          StatusBadge, PriorityBadge
    │   │   └── StatCard.js       StatCard, Spinner, EmptyState
    │   ├── context/
    │   │   ├── AuthContext.js    Global auth state
    │   │   └── SocketContext.js  Socket.io connection + room join
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── SubmitPage.js
    │   │   ├── ComplaintsPage.js
    │   │   ├── ComplaintDetailPage.js
    │   │   └── UsersPage.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json

  Made with ♥ by Ahishek Meena
