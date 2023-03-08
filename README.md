# Kazoodle

The daily game where you have to guess the song, except it's played on the kazoo! Inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html) and [Heardle](https://www.spotify.com/heardle/?).

## Frontend

The frontend is written in Typescript and uses the React framework. It is currently hosted using github pages, and so the project must be built before pushing. To simplify this process, we use [gh-pages](https://www.npmjs.com/package/gh-pages) and the `deploy_frontend` script.

#### Initial install
```
cd frontend
npm install
```
#### Deploy
```
cd scripts
./deploy_frontend
```
### Run locally
First, create a `.env` file in the `/frontend` directory, and write:
```
REACT_APP_BACKEND_URL=http://localhost:8000
```
This is so the frontend knows the URL of the backend. This value is overwritten when deployed during the `build` stage in `package.json`.

## Backend

The backend uses the [FastAPI](https://fastapi.tiangolo.com/) framework, which is written in Python. It also uses the following services:
* AWS S3 - storing song files
* Redis - storing application state and admin users
* Mongo Atlas - storing database of potential songs

Typically Redis isn't used to store users, but I only really needed one admin user, and I hadn't added Mongo yet, so it didn't seem worth it to add a database just for the one user.

### Run locally
Create a `.env` file in the `backend` directory, and fill it with the following:
```
FRONTEND_URL=http://localhost:3000
AWS_ACCESS_KEY_ID=<>
AWS_SECRET_ACCESS_KEY=<>
REDISCLOUD_URL=<>
MONGO_URL=<>
JWT_TOKEN_SECRET_KEY=<>
USER_CREATION_MASTER_PASSWORD=<>
PROD=false
```
The keys for AWS, Redis and Mongo can be obtained by signing up for each of the services. The `JWT_TOKEN_SECRET_KEY` and `USER_CREATION_MASTER_PASSWORD` can be anything. `FRONTEND_URL` is for CORS reasons.

### Create python virtual environment (recommended)
Read [this](https://docs.python.org/3/library/venv.html).

```
(source /path/to/bin/activate)
cd backend
pip install -r requirements.txt
```

```
cd scripts
./run_backend_local
```

### Deploy
This project uses [Heroku](https://www.heroku.com/) to host the backend, but you could use any PaaS. Just add the environment variables from `.env` to the Heroku config for your app (except set `PROD=TRUE`, and `FRONTEND_URL` to whereever the frontend is hosted). The rest can remain the same, but I like having different environments for dev and prod (especially for Redis), and I recommend using different passwords for security reasons.

```
cd scripts
./push_backend
```