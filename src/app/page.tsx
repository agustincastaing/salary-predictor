"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

type HistoryItem = { url: string; title: string };

type JobPosting = {
  title: string;
  department?: string;
  team?: string;
  location?: string;
  employmentType?: string;
  isRemote?: boolean;
  descriptionHtml?: string;
  compensation?: {
    compensationTierSummary?: string;
  };
};

const cache: Record<string, string> = {};

export default function Home() {
  const [url, setUrl] = useState("");
  const [job, setJob] = useState<JobPosting | null>(null);
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("jobHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  async function fetchJob(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPrediction("");
    setJob(null);
    setLoading(true);

    try {
      const res = await fetch("/api/job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch job");
      }

      const { posting } = await res.json();
      setJob(posting);

      const newHistory = [{ url, title: posting.title }, ...history.filter(h => h.url !== url)].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem("jobHistory", JSON.stringify(newHistory));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function getPrediction() {
    if (!job) return;

    const cacheKey = url;
    if (cache[cacheKey]) {
      setPrediction(cache[cacheKey]);
      setFromCache(true);
      return;
    }

    setPrediction("");
    setPredicting(true);
    setError("");
    setFromCache(false);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posting: job }),
      });

      if (!res.ok) {
        throw new Error("Prediction failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setPrediction(fullText);
      }

      cache[cacheKey] = fullText;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPredicting(false);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Salary Predictor</h1>
        <p>Paste an Ashby job posting URL to get a salary estimate</p>
      </header>

      <form onSubmit={fetchJob} className={styles.form}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://jobs.ashbyhq.com/company/job-id"
          required
          className={styles.input}
        />
        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? "Loading..." : "Fetch Job"}
        </button>
      </form>

      {history.length > 0 && (
        <div className={styles.history}>
          <span>Recent:</span>
          {history.map((h) => (
            <button key={h.url} onClick={() => setUrl(h.url)} className={styles.historyItem}>
              {h.title}
            </button>
          ))}
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {loading && (
        <div className={styles.skeleton}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonMeta}>
            <div className={styles.skeletonTag} />
            <div className={styles.skeletonTag} />
            <div className={styles.skeletonTag} />
          </div>
          <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} style={{ width: "60%" }} />
          </div>
        </div>
      )}

      {job && (
        <div className={styles.columns}>
          <div className={styles.jobCard}>
            <div className={styles.jobHeader}>
              <h2>{job.title}</h2>
              {job.compensation?.compensationTierSummary && (
                <span className={styles.compBadge}>
                  {job.compensation.compensationTierSummary}
                </span>
              )}
            </div>

            <div className={styles.jobMeta}>
              {job.location && <span>{job.location}</span>}
              {job.department && <span>{job.department}</span>}
              {job.employmentType && <span>{job.employmentType}</span>}
              {job.isRemote && <span>Remote</span>}
            </div>

            {job.descriptionHtml && (
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: job.descriptionHtml }}
              />
            )}

            <button
              onClick={getPrediction}
              disabled={predicting}
              className={styles.predictBtn}
            >
              {predicting ? "Analyzing..." : "Predict Salary"}
            </button>
          </div>

          <div className={styles.predictionCard}>
            <h3>
              Salary Analysis
              {fromCache && <span className={styles.cacheTag}>(cached)</span>}
            </h3>
            <div className={styles.predictionText}>
              {prediction || "Click 'Predict Salary' to get an estimate"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
