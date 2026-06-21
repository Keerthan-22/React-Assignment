# Task Manager (React + Node)

Simple task manager app with a React client and a Node/Express server.

**Structure**
- client: React frontend (src, components, pages, css)
- server: Node/Express backend (routes, controllers, config, database.sql)

**Prerequisites**
- Node.js (v14+)
- npm
- (Optional) MySQL for importing `database.sql` if you use the provided SQL file

**Setup**
1. Install server dependencies:

   ```bash
   cd server
   npm install
   ```

2. Install client dependencies:

   ```bash
   cd ../client
   npm install
   ```

3. Configure database connection in `config/db.js` (server).
4. (Optional) Import the database schema:

   ```sql
   -- run in your MySQL client
   SOURCE database.sql;
   ```

**Run (development)**
- Start server:

  ```bash
  cd server
  npm run dev
  ```

- Start client (in a separate terminal):

  ```bash
  cd client
  npm run dev
  ```

**Build (production client)**

```bash
cd client
npm run build
```

**Notes**
- API routes live in `server/routes` (e.g., `tasks.js`, `profile.js`).
- Controllers are in `server/controllers`.
- The frontend entry is `client/src/main.jsx` and main app at `client/src/App.jsx`.

**License**
- MIT
