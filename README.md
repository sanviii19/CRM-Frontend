# Xeno Mini CRM - Frontend

This is the frontend user interface for the Xeno Mini CRM application. It provides a clean, modern web app for creating customer segments, managing marketing campaigns, and viewing real-time delivery statistics.

## Tech Stack

- **Framework**: React.js
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Real-time Updates**: Socket.io Client
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Features

- **Audience Segmentation**: Create targeted customer lists based on complex conditions (e.g., total spending, number of visits, last visit date).
- **Campaign Management**: Compose dynamic, personalized messages and launch communication campaigns.
- **Real-time Analytics**: Watch campaign statuses (SENT, DELIVERED, FAILED) update in real-time as the backend processes them.
- **Customer Dashboard**: View all customers and their corresponding statistics.

## Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   If you have a `.env` file, ensure you set the correct backend URLs. By default, it expects the CRM API to run on `http://localhost:5000` and the Channel service (for sockets) on `http://localhost:5001` or as configured in your code.

3. **Running in Development**
   Start the Vite development server:
   ```bash
   npm run dev
   ```
   This will spin up the application, typically on `http://localhost:5173`.

## Building for Production

To create a production-ready build:

```bash
npm run build
```

This will generate a `dist` folder containing the optimized static assets that can be served by any web server (e.g., Nginx, Vercel, Render).

## Linting

You can run ESLint to check for code issues:
```bash
npm run lint
```
