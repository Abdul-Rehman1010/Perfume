# Perfume Lab Dashboard 🧪✨

A full-stack web application designed for perfume laboratories to manage ingredient inventories, create custom formulas, and automatically calculate batch costs. 

Built with a split Frontend/Backend architecture and deployed on Vercel.

## 🌟 Features

* **Formula Management:** Create, edit, and delete perfume formulas. Automatically calculates the total cost of a batch based on the precise ml amount of each ingredient used.
* **Inventory Dashboard:** Manage your raw materials. Add new ingredients, update pricing (per 50ml), and prevent deletion of ingredients currently used in active formulas.
* **Excel Export:** One-click download of all formulas and ingredient breakdowns into a cleanly formatted `.xlsx` spreadsheet.
* **Secure Access:** Protected by a single shared company password.
* **Master Recovery:** Built-in password reset functionality using a secure Master Recovery Key.
* **Responsive UI:** Fully optimized for both desktop and mobile devices, featuring a seamless Light/Dark mode transition.

## 🛠️ Tech Stack

**Frontend (`/perfume`)**
* React (Vite)
* Tailwind CSS
* Lucide React (Icons)
* Axios

**Backend (`/perfume-backend`)**
* Node.js & Express
* MongoDB & Mongoose (Database)
* ExcelJS (Spreadsheet generation)
* Cors & Dotenv

## 📂 Project Structure

This repository is a monorepo containing both the client and server code in separate directories:

```text
├── perfume/                  # React Frontend
│   ├── src/
│   │   ├── components/       # UI Components (Dashboard, Editor, Modals)
│   │   ├── App.jsx           # Main Application Logic
│   │   └── main.jsx          # React Entry Point
│   ├── public/               # Static assets (Favicon)
│   └── index.html            
│
└── perfume-backend/          # Node/Express Backend
    ├── models/               # Mongoose Schemas (Auth, Ingredient, Perfume)
    ├── server.js             # Express API Routes & Database Connection
    └── vercel.json           # Serverless Deployment Config
