const API_BASE = "https://salary-predictor-seven.vercel.app";
const content = document.getElementById("content");

let currentJob = null;

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  const match = url.match(/jobs\.ashbyhq\.com\/([^/]+)\/([^/?]+)/);
  if (!match) {
    content.innerHTML = '<div class="not-ashby">Navigate to an Ashby job posting to use this extension.</div>';
    return;
  }

  await fetchJob(url);
}

async function fetchJob(url) {
  content.innerHTML = '<div class="loading">Fetching job...</div>';

  try {
    const res = await fetch(`${API_BASE}/api/job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to fetch");
    }

    const { posting } = await res.json();
    currentJob = posting;
    renderJob(posting);
  } catch (err) {
    content.innerHTML = `<div class="error">${err.message}</div>`;
  }
}

function renderJob(job) {
  let meta = [];
  if (job.location) meta.push(`<span>${job.location}</span>`);
  if (job.department) meta.push(`<span>${job.department}</span>`);
  if (job.employmentType) meta.push(`<span>${job.employmentType}</span>`);
  if (job.compensation?.compensationTierSummary) {
    meta.push(`<span class="comp-badge">${job.compensation.compensationTierSummary}</span>`);
  }

  content.innerHTML = `
    <div class="job-title">${job.title}</div>
    <div class="job-meta">${meta.join("")}</div>
    <button id="predictBtn">Predict Salary</button>
    <div id="prediction"></div>
  `;

  document.getElementById("predictBtn").addEventListener("click", getPrediction);
}

async function getPrediction() {
  const btn = document.getElementById("predictBtn");
  const predDiv = document.getElementById("prediction");

  btn.disabled = true;
  btn.textContent = "Analyzing...";
  predDiv.innerHTML = "";
  predDiv.className = "prediction";

  try {
    const res = await fetch(`${API_BASE}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posting: currentJob })
    });

    if (!res.ok) {
      throw new Error("Prediction failed");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      predDiv.textContent += decoder.decode(value, { stream: true });
    }
  } catch (err) {
    predDiv.innerHTML = `<div class="error">${err.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Predict Salary";
  }
}

init();
