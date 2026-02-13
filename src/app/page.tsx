"use client";

import { useState } from "react";
import styles from "./page.module.css";

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

export default function Home() {
  const [url, setUrl] = useState("");
  const [job, setJob] = useState<JobPosting | null>(null);
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState("");

  async function fetchJob(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setJob(null);
    setPrediction("");
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function getPrediction() {
    if (!job) return;

    setPrediction("");
    setPredicting(true);
    setError("");

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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setPrediction((prev) => prev + chunk);
      }
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

      {error && <div className={styles.error}>{error}</div>}

      {job && (
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
      )}

      {prediction && (
        <div className={styles.predictionCard}>
          <h3>Salary Analysis</h3>
          <div className={styles.predictionText}>{prediction}</div>
        </div>
      )}
    </div>
  );
}
