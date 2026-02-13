import { describe, it, expect } from "vitest";

function parseAshbyUrl(url: string) {
  const match = url.match(/jobs\.ashbyhq\.com\/([^/]+)\/([^/?]+)/);
  if (!match) return null;
  return { boardName: match[1], postingId: match[2] };
}

describe("parseAshbyUrl", () => {
  it("parses valid ashby url", () => {
    const result = parseAshbyUrl(
      "https://jobs.ashbyhq.com/cohere/e3cb621a-75b8-467c-803c-4325fb0c1301"
    );
    expect(result).toEqual({
      boardName: "cohere",
      postingId: "e3cb621a-75b8-467c-803c-4325fb0c1301",
    });
  });

  it("returns null for invalid url", () => {
    const result = parseAshbyUrl("https://google.com/jobs/123");
    expect(result).toBeNull();
  });

  it("handles url with query params", () => {
    const result = parseAshbyUrl(
      "https://jobs.ashbyhq.com/company/job-id?ref=linkedin"
    );
    expect(result).toEqual({
      boardName: "company",
      postingId: "job-id",
    });
  });
});
