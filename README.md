# InstaLite 📸

A lightweight Instagram-like backend API built with Express.js and Prisma ORM.

## Features

- User authentication & profiles
- Post creation with image support
- Like & comment system
- Follow / unfollow users
- Feed generation

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma 7
- **Database:** PostgreSQL
- **Auth:** JWT + bcrypt

## Getting Started

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/users/:id` | Get user profile |
| POST | `/api/posts` | Create a post |
| GET | `/api/feed` | Get user feed |

## License

MIT
