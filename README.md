## Getting Started

First, setup the local development server:

1. Clone the repository on your machine

2. Make a copy of `.env.local.example` to `.env.local`

3. Add the environment variable values in `.env.local`

```bash
# Upstash setup
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Nextauth secrets setup
NEXTAUTH_JWT_SECRET="NEXTAUTH-JWT-SECRET"
NEXTAUTH_SECRET="NEXTAUTH-SECRET"

# Google secrets setup
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

4. Run following commands on your project terminal

```bash
npm install

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
