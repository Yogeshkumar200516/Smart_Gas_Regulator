# 🔥 **Smart Gas Regulator – IoT Powered Safety System**

Welcome to the official repository of **Smart Gas Regulator** 🏡 – an **IoT-based real-time monitoring system** that ensures safety and efficiency in LPG usage.  

This project leverages **React (Vite + MUI)** for a modern frontend, **Node.js + Express** for robust backend services, **MySQL** for data storage, and **Firebase** for **real-time communication** between IoT sensors and the web app.  

---

## 📚 **Project Overview**

The **Smart Gas Regulator** is designed to **detect gas leaks (via MQ-6 Sensor)** and **monitor LPG cylinder weight (via Load Cell)** in real time. Users can track **live gas levels**, receive **alerts in case of leakage**, and ensure safety at home, hotels, and industries.  

This project not only improves **safety** but also provides **predictive insights** into gas consumption, reducing accidents and enhancing convenience.  

---

## 🛠️ **Technologies Used**

### **Frontend:**
- **React + Vite** ⚛️  
- **MUI (Material-UI)** 🎨  
- **Tailwind CSS** 💨  
- **AOS Animations** ✨  

### **Backend:**
- **Node.js** 🟢  
- **Express.js** 🚀  
- **MySQL** 🗄️  
- **Sequelize ORM** 📊  

### **IoT & Real-time Communication:**
- **Firebase Realtime Database** 🔥  
- **MQ-6 Gas Sensor** 🛑 (Gas leak detection)  
- **HX711 Load Cell Module** ⚖️ (Cylinder weight measurement)  
- **ESP32 / Arduino (IoT Device)** 📡 (Data transfer to Firebase)  

---

## 🌐 **Key Features**

- 🛑 **Gas Leak Detection** → MQ-6 sensor detects leaks instantly and triggers alerts.  
- ⚖️ **Live Gas Monitoring** → Load cell provides real-time cylinder weight → calculates gas levels.  
- 🔔 **Smart Alerts** → Leak alerts & low gas notifications via frontend and database triggers.  
- 📊 **Data Visualization** → Graphs & charts to monitor gas usage trends over time.  
- 💻 **User-Friendly Dashboard** → Responsive React + MUI design for better UX.  
- ⚡ **Real-Time Updates** → Firebase ensures instant data sync between IoT devices and web app.  
- 🔒 **Secure Data Handling** → Role-based login with JWT authentication.  

---

## 📸 **Screenshots**

Take a glimpse at the **UI & Dashboard** 👇  

1. ![Dashboard](./assets/screenshots/dashboard.jpeg)  
2. ![Gas Leak Alert](./assets/screenshots/gas_leak_alert.jpeg)  
3. ![Gas Level Monitor](./assets/screenshots/gas_level.jpeg)  
4. ![Login Page](./assets/screenshots/login.jpeg)  
5. ![Analytics](./assets/screenshots/analytics.jpeg)  

*(👉 Add your actual screenshots inside `assets/screenshots/` folder in your repo to make them visible on GitHub)*  

---

## ⚙️ **System Architecture – Workflow**

Here’s the **end-to-end workflow** represented visually:  

```mermaid
flowchart TD
    A[MQ-6 Gas Sensor] -->|Leak Data| B[ESP32/Arduino]
    D[HX711 Load Cell] -->|Weight Data| B[ESP32/Arduino]

    B -->|Push Data| C[Firebase Realtime Database]
    C -->|Sync Data| E[Node.js Backend]
    E -->|Store & Manage| F[MySQL Database]

    E -->|API Data| G[React + MUI Frontend Dashboard]

    G -->|Alerts & Visualization| H[End User]
