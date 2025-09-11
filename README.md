# Project Setup Guide

This guide will walk you through setting up and running both the **frontend** (Next.js) and **backend** (NestJS) of this project. Ensure you have the required dependencies installed before proceeding.

## **1. Prerequisites**
Before running the project, make sure you have the following installed:
- **Node.js (LTS version recommended)**
- **PostgreSQL** (For the database)
- **Docker** (Optional, for running PostgreSQL easily)
- **Git** (For cloning the repository)

---

## **2. Clone the Repository**
```sh
# Clone the project
git clone https://github.com/YOUR_REPO_URL.git

# Navigate into the project folder
cd YOUR_PROJECT_FOLDER
```

---

## **3. Backend Setup (NestJS) - Located in `server/`**
### **3.1 Install Dependencies**
```sh
cd server
npm install
```

### **3.2 Configure Environment Variables**
Create a `.env` file inside the `server/` folder and add the following:
```
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=test_db
JWT_SECRET=d0cvn28bmd41ueiqd8a#023n9da89&
```
Modify the values as needed based on your PostgreSQL setup.

### **3.3 Run Database (Docker Option)**
If you have Docker installed, you can quickly start a PostgreSQL instance:
```sh
docker run --name postgres-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=test_db -p 5432:5432 -d postgres
```
Otherwise, create a **PostgreSQL database manually** with the same credentials.

### **3.4 Run Migrations & Seed Data**
```sh
npm run migration:run  # Ensure the database tables are created
psql -U postgres -d test_db -a -f dummy_test_data.sql  # Load test data (if needed)
```

### **3.5 Start the Backend Server**
```sh
npm run start:dev
```
The backend should now be running at **http://localhost:5000**.

---

## **4. Frontend Setup (Next.js) - Located in `client/`**
### **4.1 Install Dependencies**
```sh
cd ../client
npm install
```

### **4.2 Configure Environment Variables**
Create a `.env.local` file inside `client/` and add:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
JWT_SECRET='d0cvn28bmd41ueiqd8a#023n9da89&'
```
This ensures the frontend communicates with the backend.

### **4.3 Start the Frontend Server**
```sh
npm run dev
```
The frontend should now be running at **http://localhost:3000**.

---

## **5. Testing Instructions**
### **5.1 Run Backend Tests (Unit & Integration)**
```sh
cd server
npm run test
```

### **5.2 Run Frontend UI Tests**
```sh
cd ../client
npm run test
```

### **5.3 Run Performance & Security Tests**
- **JMeter:** Load test by running the `.jmx` file in Apache JMeter.
- **OWASP ZAP:** Scan API endpoints for vulnerabilities.

---

## **6. Common Issues & Troubleshooting**
### **Backend Issues:**
- ❌ **Port in use?** → Change `PORT` in `.env` and restart.
- ❌ **Database connection failing?** → Check PostgreSQL credentials in `.env`.

### **Frontend Issues:**
- ❌ **API not connecting?** → Ensure the backend is running and `NEXT_PUBLIC_API_BASE_URL` is correct.

---

## **7. Notes for Candidates**
✅ **Everything is pre-configured** – just follow the steps above.
✅ **No need to modify project structure** – focus on testing!
✅ **If you get stuck, check the troubleshooting section**.

🚀 **Good luck with the interview!**
