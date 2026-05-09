# Ecom Admin Node.js + MongoDB Backend

## Setup

1. Copy `.env.example` to `.env` and fill in your values.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   node src/server.js
   ```

## Folder Structure
- `src/server.js` - Main server entry
- `src/routes/` - Express route definitions
- `src/controllers/` - Route handlers
- `src/models/` - Mongoose models

## Features
- Express.js server
- MongoDB with Mongoose
- Admin authentication (login/logout)
- Environment variable support

## Requirements
- Node.js >= 14
- MongoDB

---
Replace placeholder secrets in `.env` before running in production.
