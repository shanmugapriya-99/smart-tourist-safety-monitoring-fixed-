# Publish the Smart Tourist Safety website (Render)

## Before you deploy
- This project is a React/Vite frontend served by a Python Flask backend. The included `render.yaml` builds the frontend and runs Flask with Gunicorn.
- The app uses SQLite. The Render blueprint attaches a persistent disk at `/var/data` so registrations and incidents survive restarts. A persistent disk may require a paid Render plan; check current pricing before creating the service.
- Set a strong, unique `ADMIN_PASSWORD` and keep it private. Do not use the demo password on a public website.

## Steps
1. Extract this ZIP file.
2. Create a GitHub account (if needed), create a **private** repository, and upload the contents of this project folder (the folder containing `render.yaml`).
3. In Render, choose **New + → Blueprint**, connect GitHub, and select this repository.
4. Render reads `render.yaml`. Confirm the service settings and create the service.
5. In the service environment settings, enter `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD`. Keep the generated `SECRET_KEY` and `JWT_SECRET_KEY` values.
6. Wait for the build and deployment to finish. Open the `https://...onrender.com` URL Render provides.
7. Test tourist registration, admin login, GPS permission, SOS, and dashboard actions.

## Important
- Browser GPS works only on HTTPS or localhost; the Render URL uses HTTPS. The visitor must grant location permission.
- The project currently uses a simulated blockchain ledger and rule-based AI risk scoring, as described in its source code; do not present these as a production blockchain network or trained AI model.
- Do not publish real tourist personal/medical data in this college demo.
- The website URL is created by Render after deployment. I cannot create the live URL without access to your GitHub and hosting account; you must complete the account authorization and deployment steps.
