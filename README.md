# Dabble

A little corner of the internet for when you're bored, curious, or both. Shuffle a random activity, then ask an AI guide for a hint on how to start.

## Run it

You need Node 18 or newer and a [Groq](https://console.groq.com) API key.

**Server** (port 5000)

```bash
cd server
npm install
echo "GROQ_API_KEY=your_key_here" > .env
npm run dev
```

**Client**

```bash
cd client
npm install
npm run dev
```

Open the address Vite prints. If your server runs somewhere else, set `VITE_API_URL` before starting the client.

## How it works

- `GET /api/tasks/random` returns a random task from `server/tasks.json`.
- `POST /api/chat` sends the chosen task and your question to Groq and returns a short reply.
- The client is React, Vite, React Router and Framer Motion, with plain CSS.

## Structure

```
client/   React app (Home and Hint pages)
server/   Express API and task data
```
