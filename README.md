# 🚗 Smart-Pay: Car Dealership Edition

Welcome to **Smart-Pay**, a premium RFID-based wallet management system tailored for automotive service centers and car dealerships. This platform enables seamless, cashless transactions for vehicle maintenance, detailing, and rentals using secure RFID cards.

## 🌐 Live Demonstration
Access the system here: **[http://157.173.101.159:9205](http://157.173.101.159:9205)**

---

## 🔑 Demo Credentials

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Agent** | `agent` | `admin123` | Full Dashboard, Top-Ups, Global Logs |
| **Salesperson** | `sales` | `sales123` | Payments, Receipts, Card Scans |

---

## ✨ Key Features

### 👤 Role-Based Management
- **Agent Interface**: Manage wallet balances, monitor system-wide health, and access a consolidated manager dashboard.
- **Salesperson Interface**: Process payments for services like oil changes, tire rotations, and detailing with one-click RFID validation.

### 📊 Consolidated Manager Dashboard
- Real-time tracking of **Total Sales** and **Total Top-Ups**.
- Monitoring of active cards in circulation.
- Live global transaction feed.

### 🧾 Automated Digital Receipts
- Instant receipt generation after every successful payment.
- Detailed breakdown of items, quantities, and remaining balance.

### 📡 Integrated RFID Technology
- **MQTT Protocol**: Real-time communication with physical IoT devices (ESP32/RFID-RC522).
- **WebSockets**: Live UI updates when a card is scanned or a transaction is processed.
- **Atomic Transactions**: MongoDB Atlas backed sessions ensure data integrity and prevent double-spending.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JS, Glassmorphism CSS, HTML5, Socket.io
- **Backend**: Node.js, Express, MQTT.js
- **Database**: MongoDB Atlas (Cloud)
- **Communication**: WebSockets & MQTT

---

## 🚀 Local Development

1. **Clone & Install**:
   ```powershell
   npm install
   ```
2. **Environment Setup**:
   Configure `.env` in the `backend` folder with your MongoDB URI and MQTT Broker details.
3. **Database Seed**:
   ```powershell
   cd backend
   node reset_products.js
   ```
4. **Start Server**:
   ```powershell
   node server.js
   ```

---

## 🛡️ Team
Developed by **iot_team_07** (Smart-Pay Implementation Group).
