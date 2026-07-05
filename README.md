# VaultShare 🔒

VaultShare is a secure, modern full-stack web application designed for private file storage, encrypted file sharing, and workspace collaboration. It features real-time notifications, multi-language localization support, cryptographic session tracking, and a comprehensive administrative control hub.

---

## 🚀 Key Features

* **Secure Dashboard Overview:** Displays storage utilization analytics and core navigation layout hooks.
* **Encrypted Data Hub:** Manage personal assets, shared networks, and user workspace directories.
* **Advanced Profile Controls:** Multi-device active session audit logging with cryptographic revocation triggers and two-factor authentication (2FA) hooks.
* **Administrative Command Center:** High-level metrics tracking for platform scale (user accounts, document pipelines, risk profiles) paired with real-time capped event streaming.
* **Dynamic Theme & Localization Engine:** Seamless toggling between dark/light layout layers, bundled with internationalization capabilities (English, Hindi, Spanish).

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React (Vite Wrapper)
* **State Management:** Redux Toolkit (Slice Architectures)
* **Routing:** React Router DOM v6
* **Styling:** Modular Glassmorphism Native CSS Layouts
* **Icons:** Lucide React

### Backend (Server)
* **Runtime Environment:** Node.js
* **Framework:** Express.js
* **Database Object Modeling:** Mongoose / MongoDB
* **Security:** Cryptographic Password Hashing (BcryptJS)

---

## 📂 Project Architecture

```text
VaultShare/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Shell frames (AppLayout.jsx)
│   │   │   └── ui/             # Reusable UI Blocks (Modal.jsx, MetricCard.jsx)
│   │   ├── pages/              # Main Route Components (Admin.jsx, Settings.jsx)
│   │   ├── store/
│   │   │   └── slices/         # Redux State Management Controllers
│   │   ├── lib/                # API Client wrappers & Global Labels Mapping
│   │   └── styles.css          # Main stylesheet layer layout engine
└── server/                     # Backend API Core Engine
    └── models/
        └── User.js             # Mongoose Schemas & Login Activity Tracking Protocols

```


## ⚙️ Installation & Local Setup

Follow these steps to get your local development environment up and running.

### Prerequisites
Before installing, ensure you have the following software installed on your machine:
* **Node.js** (v18.0.0 or higher)
* **npm** (comes bundled with Node) or **yarn**
* **MongoDB** (Local Community Server or a MongoDB Atlas connection string)
