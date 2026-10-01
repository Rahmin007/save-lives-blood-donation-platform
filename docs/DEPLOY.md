# Deploying Save Lives (free)

One **Render** web service runs everything, with **MongoDB Atlas** as the database.

## 1. Database

Use any MongoDB Atlas cluster (an existing free cluster is fine). The app stores its data in its own database, `save-lives`, so it won't touch other apps on the same cluster.

You need the connection string with the password filled in:
```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=Cluster0
```
In Atlas, **Network Access** must allow `0.0.0.0/0`.

## 2. Render

1. Push this repo to GitHub.
2. On render.com, choose **New → Blueprint** and select the repo. Render reads `render.yaml`.
3. Fill in:
   - `MONGO_URI`: the Atlas connection string
   - `ADMIN_EMAILS`: the email(s) that should get the admin dashboard, e.g. `you@gmail.com`
4. Deploy. The first build takes about 5 minutes.
5. Open `https://<your-service>.onrender.com/api/health`. It should show `{"status":"ok","database":"connected"}`.

JWT secrets are generated automatically. Blood banks and demo data (`SEED_DEMO_DATA=true`) are added on first start. Set `SEED_DEMO_DATA` to `false` if you don't want sample donors.

## 3. Use it

Open the site and **sign up with the email you put in `ADMIN_EMAILS`**; you'll land on the admin dashboard. Register a normal user in another browser to test requests, chat and blood-bank approvals.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Build fails at `vite build` | Make sure the build command is `npm run build` and the root directory is `backend`. |
| `/api/health` shows `degraded` or the deploy fails with `ECONNREFUSED` / `bad auth` | Check the password in `MONGO_URI` and Atlas Network Access (`0.0.0.0/0`). |
| You're not admin | The email must match `ADMIN_EMAILS` exactly. Update it on Render; existing accounts are promoted on the next restart. |
| The first load is slow | The free plan sleeps after 15 minutes idle; the first request wakes it (about 50 s). |
