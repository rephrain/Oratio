# Oratio Deployment Guide (ClawCloud Run via Docker Hub)

This guide provides instructions for deploying Oratio to ClawCloud Run using Docker Hub for image management.

## 1. Prerequisites

- A Docker Hub account (repo: `rephrainarchaimeric/oratio`)
- A ClawCloud Run account (`rephrain.archaimeric@lautan-luas.com`)
- A PostgreSQL database (external — Neon, Supabase, Railway, or ClawCloud DB)
- Docker Desktop installed locally for building images

## 2. Local Machine — Build & Push Image

### Build and Push
Use the provided `push.sh` script:
```bash
chmod +x push.sh
./push.sh
```
Or manually:
```bash
docker build -t rephrainarchaimeric/oratio:latest .
docker login
docker push rephrainarchaimeric/oratio:latest
```

## 3. ClawCloud Run — Create App

Go to **run.claw.cloud → App Launchpad → Create App**.

### Image Source
- **Image**: `rephrainarchaimeric/oratio:latest`
- **Registry**: Docker Hub
- If the repo is private, add credentials:
  - Registry URL: `https://index.docker.io/v1/`
  - Username: your Docker Hub username
  - Password: your Docker Hub password/token

### Network Configuration
- **Container Port**: `3000`
- **Public Network Access**: Enabled

### Environment Variables (Advanced Configuration)
Add these environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/oratio` | Your external PostgreSQL URL |
| `JWT_SECRET` | `<long random string>` | Production JWT secret |
| `SATUSEHAT_ENV` | `staging` or `production` | API environment |
| `SATUSEHAT_CLIENT_ID` | `<your client id>` | |
| `SATUSEHAT_CLIENT_SECRET` | `<your client secret>` | |
| `SATUSEHAT_ORG_ID` | `<your org id>` | |
| `SNOWSTORM_BASE_URL` | `https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand` | |
| `ENABLE_CRON` | `true` | |
| `ORIGIN` | `https://<your-clawcloud-url>` | Set after first deploy |
| `PORT` | `3000` | Already in Dockerfile |
| `HOST` | `0.0.0.0` | Already in Dockerfile |
| `TZ` | `Asia/Jakarta` | Already in Dockerfile |

> **Important**: Deploy first without `ORIGIN` to get your public URL, then update `ORIGIN` to match and redeploy.

## 4. Database Setup

ClawCloud Run runs a single container — no docker-compose support. You need an **external PostgreSQL database**.

### Recommended Providers
- **Neon** (neon.tech) — Free tier, serverless PostgreSQL
- **Supabase** (supabase.com) — Free tier PostgreSQL
- **Railway** (railway.app) — Managed PostgreSQL
- **ClawCloud Database** — Check if available in your ClawCloud dashboard

### After provisioning:
1. Get the connection string (format: `postgresql://user:password@host:port/dbname`)
2. Set it as the `DATABASE_URL` environment variable in ClawCloud
3. The app will run migrations automatically on startup

## 5. Post-Deploy Checklist

| Step | Action |
|------|--------|
| 1 | Verify the app starts (check ClawCloud logs) |
| 2 | Copy the public URL from ClawCloud |
| 3 | Set `ORIGIN` env var to the public URL |
| 4 | Redeploy the app |
| 5 | Test login functionality |
| 6 | Seed the database if needed (`docker exec` or connect directly) |

## 6. Updating the App

After making code changes:
```bash
# Build and push new image
./push.sh

# Then in ClawCloud, redeploy the app (it will pull the latest image)
```

## 7. Viewing Logs

Check logs in the ClawCloud Run dashboard for your app.

## 8. File Uploads

⚠️ **Warning**: Container storage is ephemeral on ClawCloud Run. Uploaded files (profile images, documents) will be lost on container restart. Consider using external object storage (S3-compatible) for production file persistence.
