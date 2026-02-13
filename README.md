# Salary Predictor

Live URL: https://salary-predictor-seven.vercel.app/

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

## Tests

Run tests with:
```bash
npm test
```

Basic tests for URL parsing logic are in `src/tests/`.

## Chrome Extension (Bonus)

There's also a Chrome extension in the `extension/` folder.

To install:
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/` folder

Then navigate to any Ashby job posting and click the extension icon to get a salary prediction.

## Caching

The app uses a simple in-memory cache to avoid repeated API calls for the same job posting. If you click "Predict Salary" twice on the same job, the second request uses the cached result.

This is a basic approach for the demo. In a real scenario I'd probably:
- Use Redis or a database to persist predictions server-side
- Add cache expiration (predictions might get stale as market changes)
- Cache by job ID instead of URL
- Add rate limiting per user/IP to prevent abuse

## AI Assistance

I used AI (Claude) to help build some parts of this project:
- **Chrome extension**: I had no prior experience with browser extensions
- **Tests**: Basic test setup and structure

The core app logic (API routes, frontend, streaming) was built by me. If AI usage disqualifies the bonus features, feel free to discard those points.

## Note

The API key included for demo purposes has limited credits and may hit rate limits. If you get a 400 error, the credits probably ran out.
