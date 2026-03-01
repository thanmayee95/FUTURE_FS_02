# Mini CRM (Demo)

This is a minimal mini CRM with two interfaces: Admin Dashboard and User Panel. It demonstrates role-based auth, lead management, and animated UIs using simple static frontends.

Run locally:

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file (optional)

```
# SQLite is used by default; database file will be created in project root
# you can override location with SQLITE_FILE=/path/to/file
JWT_SECRET=supersecret
SEED_ADMIN_EMAIL=admin@crm.local
SEED_ADMIN_PASSWORD=Admin123!
```

3. Seed demo data and start (database will seed automatically on first run)

```bash
npm install      # already done earlier
npm run seed     # manual seeding available but not required
npm run start
```
4. Open `http://localhost:4000` and login. Admin dashboard is at `/admin/`, user panel at `/user/`.

Notes:
- This is a demo starter — adapt styles, security, and validation for production.
