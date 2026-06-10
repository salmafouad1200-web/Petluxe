# PetLuxe Deployment Guide

## Frontend (Vercel)

The React/Vite frontend is optimized for zero-config deployment on Vercel.

1. Push your code to a GitHub repository.
2. Go to Vercel and import your repository.
3. Configure the project:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables:
   - `VITE_API_URL`: Your production backend API URL (e.g., `https://petluxe-backend.onrender.com/api`)
5. Click **Deploy**. Vercel will automatically read `vercel.json` for SPA routing.

## Backend (Render)

The Laravel backend is configured for deployment on Render via the `render.yaml` Infrastructure as Code approach.

1. In your Render Dashboard, click **New+** -> **Blueprint**.
2. Connect your GitHub repository.
3. Render will detect `render.yaml` and create a `PHP Web Service`.
4. Ensure your environment variables are configured correctly in the Render Dashboard (specifically `DB_*` for your MySQL connection).
5. The `render.yaml` automatically runs:
   - `composer install --no-dev --optimize-autoloader`
   - `php artisan migrate --force`
   - Config, Route, and View caching.
