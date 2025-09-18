# 📝 Task Manager Web App

A simple **Task Manager** built with **Spring Boot (Backend)** and **HTML/CSS/JavaScript (Frontend)**.
The app allows you to **add, view, edit, complete, and delete tasks**.

---

## 🚀 Features

* Add new tasks with title and description.
* View all tasks in a clean, responsive UI.
* Mark tasks as complete or edit them.
* Delete tasks you don’t need.
* Fully connected to **Spring Boot REST API**.

---

## 🛠️ Tech Stack

**Backend:** Java, Spring Boot, JPA, MySQL/PostgreSQL
**Frontend:** HTML, CSS, JavaScript (Vanilla)
**API Communication:** Fetch API

---

## 📂 Project Structure

```
task-manager/
│
├── backend/                  # Spring Boot backend
│   ├── src/main/java/...     # Java code (controllers, services, models)
│   ├── src/main/resources/   # application.properties
│   └── pom.xml               # Maven config
│
├── frontend/                 # Frontend code
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
└── README.md                 # Project documentation
```

---

## ⚙️ Setup Instructions

### 1️⃣ Backend (Spring Boot)

1. Clone the repository.
2. Navigate to the `backend/` folder.
3. Configure your database in `application.properties`:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/taskdb
   spring.datasource.username=root
   spring.datasource.password=yourpassword
   spring.jpa.hibernate.ddl-auto=update
   ```
4. Run the Spring Boot application:

   ```bash
   mvn spring-boot:run
   ```
5. Backend will start at: **[http://localhost:8080](http://localhost:8080)**

---

### 2️⃣ Frontend

1. Navigate to the `frontend/` folder.
2. Open `index.html` in your browser.
3. The app will connect to the backend API running on **[http://localhost:8080/api/tasks](http://localhost:8080/api/tasks)**.

---

## 🔗 API Endpoints

| Method | Endpoint        | Description        |
| ------ | --------------- | ------------------ |
| GET    | /api/tasks      | Get all tasks      |
| POST   | /api/tasks      | Add new task       |
| PUT    | /api/tasks/{id} | Update/edit a task |
| DELETE | /api/tasks/{id} | Delete a task      |

---


## 👨‍💻 Author

Built by **Harsh Thakur** ✨

