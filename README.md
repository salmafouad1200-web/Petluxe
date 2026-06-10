# PetLuxe - Premium SaaS Platform 🐾

PetLuxe is a full-stack, production-ready SaaS application dedicated to pet care. It features a modern React (Vite) frontend with Tailwind CSS and a robust Laravel backend API.

## Features

- **Authentication**: Secure registration/login using Laravel Sanctum.
- **Pet Management**: Full CRUD for pets, medical records, and document uploads.
- **AI Analysis & Chat**: Integrated AI module for breed detection, health tips, and a chat assistant.
- **Veterinary Appointments**: Discover veterinarians and book appointments online.
- **Marketplace**: Browse products, manage a cart, and complete orders.
- **Community**: Social network features including posts, likes, and comments.
- **Admin Dashboard**: Comprehensive statistics, user management, and exports.

## Architecture & Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router DOM, React Query, Lucide Icons.
- **Backend**: Laravel 11, PHP 8.2.
- **Database**: MySQL (Production via Docker) or SQLite (Development).
- **Caching & Queues**: Redis (via Docker).

## Development Setup

### Backend (Laravel)

1. Navigate to the `backend/` folder.
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Install PHP dependencies:
   ```bash
   composer install
   ```
4. Generate the application key:
   ```bash
   php artisan key:generate
   ```
5. Run the database migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```
6. Start the local development server:
   ```bash
   php artisan serve --port=8000
   ```

### Frontend (React/Vite)

1. Navigate to the `frontend/` folder.
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:3000`.

## Production Deployment

### Docker Setup (Backend + MySQL + Redis)

We provide a complete `docker-compose.yml` file for production deployment.

1. In the `backend/` directory, ensure `.env` is configured for MySQL (see `.env.example`).
2. Run the Docker containers:
   ```bash
   docker-compose up -d --build
   ```
3. Run migrations inside the container:
   ```bash
   docker-compose exec app php artisan migrate --force
   ```

### Vercel / Netlify Deployment (Frontend)

The frontend is fully optimized for Vercel. 
- A `vercel.json` is included for React Router rewrites.
- Ensure to set the `VITE_API_URL` environment variable to your production backend URL (e.g., `https://api.petluxe.com/api`).

## Code Structure Highlights

- **`backend/routes/api.php`**: All endpoints are cleanly defined, utilizing Sanctum for protected routes.
- **`frontend/src/contexts/`**: Contains context providers for Authentication, Cart, and Notifications.
- **`frontend/vite.config.js`**: Configured with code-splitting and chunk size optimizations.

## Quality Assurance

- All user inputs are strictly validated.
- Robust React Error Boundaries prevent "White Screens of Death".
- Axios interceptors gracefully handle 401 Unauthorized responses.
- `FormData` requests dynamically handle file boundaries to prevent 422 errors.

---
*Built with ❤️ for pets and their owners.*
