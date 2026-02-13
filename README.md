# Salary Predictor

Paste an Ashby job posting URL and get a salary estimate powered by Claude.

## Setup

```bash
npm install
```

Create a `.env.local` file:
```
ANTHROPIC_API_KEY=your-key-here
```

Run it:
```bash
npm run dev
```

## How it works

1. Paste a job URL from jobs.ashbyhq.com
2. Click "Fetch Job" to load the posting
3. Click "Predict Salary" to get an AI-generated estimate

The app fetches the job details from Ashby's API and sends them to Claude for analysis.

## Note

The API key included for demo purposes has limited credits and may hit rate limits. If you get a 400 error, the credits probably ran out.
