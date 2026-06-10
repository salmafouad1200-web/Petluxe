# PetLuxe Installation Guide

## Requirements
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL or Docker

## Backend Setup (Laravel)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   composer install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Generate App Key:
   ```bash
   php artisan key:generate
   ```
5. Configure database in `.env` (use MySQL defaults or Docker).
6. Run migrations:
   ```bash
   php artisan migrate --seed
   ```
7. Start the server:
   ```bash
   php artisan serve
   ```

## Frontend Setup (React/Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
