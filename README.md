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

## Chrome Extension (Bonus)

There's also a Chrome extension in the `extension/` folder.

To install:
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/` folder

Then navigate to any Ashby job posting and click the extension icon to get a salary prediction.

Note: I had no prior experience with Chrome extensions, so I used AI assistance to build this part. If AI usage was not allowed for the bonus, feel free to discard the bonus points.

## Note

Live URL: https://salary-predictor-seven.vercel.app/

The API key included for demo purposes has limited credits and may hit rate limits. If you get a 400 error, the credits probably ran out.
