import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    const match = url.match(/jobs\.ashbyhq\.com\/([^/]+)\/([^/?]+)/);
    if (!match) {
      return NextResponse.json({ error: "Invalid Ashby URL" }, { status: 400 });
    }

    const [, boardName, postingId] = match;

    const response = await fetch(
      `https://api.ashbyhq.com/posting-api/job-board/${boardName}?includeCompensation=true`
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch job board" }, { status: 502 });
    }

    const data = await response.json();
    const posting = data.jobs?.find((job: any) => job.id === postingId);

    if (!posting) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    return NextResponse.json({ posting, boardName, postingId });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch job posting" }, { status: 500 });
  }
}