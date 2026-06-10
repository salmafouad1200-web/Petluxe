# Environment Variables Documentation

## Frontend (`frontend/.env`)
Create this file if needed for local development, or configure these on Vercel:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | The URL of the Laravel backend API. (e.g. `http://localhost:8000/api` locally, `https://your-backend.com/api` in production) |

## Backend (`backend/.env`)
These are critical for the Laravel application to run on Render:

| Variable | Description | Default/Example |
|----------|-------------|-----------------|
| `APP_NAME` | Name of the application | `PetLuxe` |
| `APP_ENV` | Application environment | `production` |
| `APP_KEY` | Laravel App Key | Generated automatically by Render |
| `APP_DEBUG` | Show debug traces | `false` |
| `DB_CONNECTION` | Database engine | `mysql` |
| `DB_HOST` | Database host URL | (Your MySQL Host) |
| `DB_PORT` | Database port | `3306` |
| `DB_DATABASE` | Database name | `petluxe` |
| `DB_USERNAME` | Database user | (Your MySQL User) |
| `DB_PASSWORD` | Database password | (Your MySQL Password) |
| `LOG_CHANNEL` | Where to output logs | `stderr` (for Render) |
