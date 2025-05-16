# Drug Inventory and Management System

This project is a full-stack application for managing drug inventory using a **Node.js (Express)** backend and a **Next.js** frontend.

---

## 📦 Backend Setup (`/backend`)

### 👉 Step 1: Navigate to the backend folder

```bash
cd backend
```

### 👉 Step 2: Install dependencies

```bash
npm install
```

### 👉 Step 3: Create a `.env` file in the `backend` folder with the following content:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drug-inventory
JWT_SECRET=secreteFORJWTSECRET
```

> ✅ Make sure MongoDB is running locally before starting the server.

### 👉 Step 4: Run the development server

```bash
npm run dev
```

> The backend will start on: `http://localhost:5000`

---

## 🌐 Frontend Setup (`/frontend`)

### 👉 Step 1: Navigate to the frontend folder

```bash
cd frontend
```

### 👉 Step 2: Install dependencies

```bash
npm install
```

### 👉 Step 3: Run the development server

```bash
npm run dev
```

> The frontend will start on: `http://localhost:3000`

---

## 🛠 Technologies Used

- **Backend:** Node.js, Express.js, MongoDB, JWT
- **Frontend:** Next.js, React, (Tailwind CSS)
- **Database:** MongoDB

---

## 📝 Notes

- Make sure to configure CORS properly if frontend and backend are on different ports.
- Do not commit the `.env` file to version control.
- Always run `npm install` in both frontend and backend before starting development.
