# Product Management Dashboard

A full-stack product management system built with Angular, Node.js, and PostgreSQL (Supabase).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21, Angular Material |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Supabase) |
| Auth | JWT (JSON Web Tokens) |
| File Upload | Multer |
| Reports | fast-csv, ExcelJS |

---

## Features

- User authentication (Login / Register)
- User management (CRUD)
- Category management (CRUD)
- Product management (CRUD with image upload)
- Bulk product upload via CSV
- Export reports as CSV and Excel
- Server-side pagination, search, and price sorting
- Responsive UI (mobile + desktop)
- Skeleton loading animations

---

## Project Structure

```
augmont_assignment/
├── productPanel/
│   ├── backend/          # Node.js + Express API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── db.js
│   │   ├── uploads/      # Uploaded images
│   │   └── server.js
│   └── frontend/         # Angular app
│       └── src/
│           └── app/
│               ├── components/
│               ├── services/
│               ├── guards/
│               └── interceptors/
├── sample_bulk_upload.csv
├── ProductPanel.postman_collection.json
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- Angular CLI (`npm install -g @angular/cli`)

### 1. Backend Setup

```bash
cd productPanel/backend
npm install
```

Create a `.env` file:

```env
PORT=5000
DB_HOST=your_supabase_host
DB_USER=your_supabase_user
DB_PASSWORD=your_password
DB_NAME=postgres
DB_PORT=6543
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd productPanel/frontend
npm install
ng serve
```

App runs on `http://localhost:4200`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT token |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get products (paginated, filterable) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (with image) |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/products/bulk-upload` | Bulk upload via CSV |
| GET | `/api/products/download/csv` | Download all products as CSV |
| GET | `/api/products/download/excel` | Download all products as Excel |

### Product Query Parameters
```
GET /api/products?page=1&limit=10&sortBy=price&order=desc&search=gold&category=Electronics
```

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  unique_id UUID DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  unique_id UUID DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  unique_id UUID DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  image TEXT,
  price NUMERIC(10,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## CSV Bulk Upload Format

```csv
name,price,category_id
iPhone 15 Pro,129999,1
Samsung Galaxy S24,89999,1
```

> Use actual category IDs from your database.

---

## Postman Collection

Import `ProductPanel.postman_collection.json` into Postman.  
Login request automatically saves the token for all other requests.

---

## Deployment

- **Frontend** → Vercel
- **Backend** → Render
- **Database** → Supabase (PostgreSQL)
