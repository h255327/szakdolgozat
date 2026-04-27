# HealthyEat — Healthy Eating & Diet Planning App

A full-stack web application for healthy eating, meal planning, and nutrition tracking.

Users can browse and create recipes, log meals, track daily calorie intake, plan weekly diets, generate shopping lists, rate and comment on recipes and articles, and get personalised advice from an AI-powered nutrition chatbot.

---

## Quick Start

> These are the minimal steps to get the application running with demo data.

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd healty-eating-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (in a separate terminal)
cd ../frontend
npm install
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in your MySQL credentials and a JWT secret:

```env
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=healthy_eating_app
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
JWT_SECRET=any_long_random_string_here

# Optional — only needed for the AI chatbot feature
OPENAI_API_KEY=sk-...
```

### 3. Create the database, apply schema, and seed demo data

Run this **once** from the `backend/` directory:

```bash
cd backend
npm run setup
```

This single command:
- Creates the `healthy_eating_app` database
- Applies the base schema and all migrations
- Seeds the demo user, recipes, articles, and food data
- Promotes the demo account to admin automatically

### 4. Start the application (two terminals required)

**Terminal 1 — Backend**

```bash
cd backend
npm run dev
```

API available at `http://localhost:5001`.

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

App available at `http://localhost:5173`.

### 5. Log in

| Role | Email | Password |
|---|---|---|
| Admin | `demo@healthyeat.dev` | `demo1234` |

---

## Features

| Feature | Description |
|---|---|
| Recipe browser | Search and filter recipes by keyword and category |
| Recipe CRUD | Authenticated users can create, edit, and delete their own recipes |
| Meal logging | Log recipes to breakfast / lunch / dinner / snack for any date |
| Calorie tracker | Daily summary with progress chart vs. target |
| Progress page | Weekly/monthly charts: calories consumed, adherence, estimated weight trend |
| Nutrition info | Per-serving macros (calories, protein, carbs, fat) per recipe |
| TDEE calculator | Mifflin–St Jeor-based recommended calorie target from body metrics |
| Diet planner | Generates a personalised daily meal plan based on user profile |
| Shopping list | Aggregates ingredients from multiple recipes |
| Recipe ratings | 1–5 star ratings per recipe per user |
| Comments | Comments on recipes and articles; admin moderation |
| Articles | Educational nutrition articles with category filtering |
| AI chatbot | OpenAI-powered nutrition assistant personalised to the user's profile |
| Admin panel | User management, content moderation |
| Responsive UI | Works on desktop and mobile browsers |

---

## Technologies

**Frontend**
- React 18 with React Router v6
- Vite 5 (dev server + build)
- Recharts (progress charts)
- Axios (HTTP client)

**Backend**
- Node.js + Express
- mysql2 (MySQL connection pool)
- jsonwebtoken (JWT authentication)
- bcrypt (password hashing)
- OpenAI Node SDK (chatbot)

**Database**
- MySQL 8.x

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | v18 or later recommended (developed on v25) |
| npm | v8 or later |
| MySQL | 8.x running locally |
| OpenAI API key | Optional — only needed for the AI chatbot feature |

---

## Project Structure

```
healty-eating-app/
├── backend/
│   ├── scripts/
│   │   ├── setup.js            # One-command project setup (npm run setup)
│   │   ├── seed.js             # Demo user + 12 base recipes + diet types
│   │   ├── seedMoreRecipes.js  # 30 additional recipes
│   │   ├── importRecipes.js    # Recipes from TheMealDB API (requires internet)
│   │   ├── importArticles.js   # 20 curated articles
│   │   └── seedFoods.js        # 55 common foods with nutrition data
│   ├── src/
│   │   ├── config/             # Database connection (db.js)
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # JWT auth middleware
│   │   ├── models/             # Database query functions
│   │   ├── routes/             # Express routers
│   │   ├── services/           # Business logic
│   │   └── utils/              # TDEE calculator, progress helpers
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── database/
│   ├── schema.sql              # Base schema
│   └── migrations/             # Incremental schema changes (002–009)
├── frontend/
│   ├── src/
│   │   ├── components/         # Shared UI components (Navbar, CommentsSection, …)
│   │   ├── pages/              # One file per page/route
│   │   ├── services/           # API client functions
│   │   └── utils/              # TDEE calculator, JWT decode, …
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Building for Production

```bash
# Build the frontend
cd frontend
npm run build
# Output is in frontend/dist/

# Start the backend in production mode
cd backend
npm start
```

To preview the production frontend build locally:

```bash
cd frontend
npm run preview
```

---

## Demo Accounts

After running `npm run setup`:

| Role | Email | Password |
|---|---|---|
| Admin | `demo@healthyeat.dev` | `demo1234` |

The setup script automatically promotes the demo account to admin. To create a separate admin account, register through the UI and then run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Manual Setup (Advanced / Fallback)

If `npm run setup` fails for any reason, you can run each step manually.

### Create the database

```bash
mysql -u <user> -p -e "CREATE DATABASE IF NOT EXISTS healthy_eating_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Apply the schema

```bash
mysql -u <user> -p healthy_eating_app < database/schema.sql
```

### Apply all migrations in order

```bash
mysql -u <user> -p healthy_eating_app < database/migrations/002_add_recipe_fields.sql
mysql -u <user> -p healthy_eating_app < database/migrations/003_add_article_fields.sql
mysql -u <user> -p healthy_eating_app < database/migrations/004_rebuild_meal_items.sql
mysql -u <user> -p healthy_eating_app < database/migrations/006_add_image_url_to_articles.sql
mysql -u <user> -p healthy_eating_app < database/migrations/007_create_foods_table.sql
mysql -u <user> -p healthy_eating_app < database/migrations/008_add_user_metrics.sql
mysql -u <user> -p healthy_eating_app < database/migrations/009_add_recipe_comments_and_ratings.sql
```

### Seed data (run from `backend/`)

```bash
cd backend
npm run seed

# Promote demo user to admin
mysql -u <user> -p -e "USE healthy_eating_app; UPDATE users SET role = 'admin' WHERE email = 'demo@healthyeat.dev';"

npm run seed-more        # 30 additional recipes
npm run import-articles  # 20 educational articles
npm run seed-foods       # 55 common foods with nutrition data
```

---

## Troubleshooting

### `npm run setup` fails — "Cannot connect to MySQL"

- Verify that MySQL is running.
- Check that `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD` in `backend/.env` are correct.

### Backend fails to start — "Database connection failed"

- Run `npm run setup` first (the database may not exist yet).
- Confirm the `healthy_eating_app` database exists: `SHOW DATABASES;` in MySQL.

### Frontend shows blank page or API errors

- Confirm the backend is running on the same port as `VITE_API_BASE_URL` (default `5001`).
- Open the browser developer console and check the network tab for failed requests.
- Ensure CORS is not blocked — the backend enables CORS for all origins in development.

### JWT errors / "Unauthorized" on all requests

- Confirm `JWT_SECRET` is set in `backend/.env` and is not empty.
- Clear `localStorage` in the browser (the old token was signed with a different secret).

### Chatbot returns an error

- Check that `OPENAI_API_KEY` is set in `backend/.env` and is a valid key.
- The chatbot is the only feature that requires the OpenAI key; all other features continue to work without it.

### Port already in use

Change the port in `backend/.env` (`PORT=5001`) and update the frontend `.env` to match:

```env
VITE_API_BASE_URL=http://localhost:<new_port>/api
```
