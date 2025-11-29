# AlgoPilot

AI-assisted algorithm benchmarking platform with GitHub Pages UI, Vercel serverless API, and GitHub Actions orchestration that runs real benchmarks and trains an ONNX model for client-side inference.

## Architecture

- Frontend (`/frontend`): React + TypeScript + Vite, Tailwind CSS, Monaco editor, Recharts, `onnxruntime-web`. Built to GitHub Pages using `HashRouter`.
- Backend (`/api`): Vercel Serverless Functions using TypeScript and `@octokit/rest` for GitHub integration.
- CI/Compute (`/.github/workflows/benchmark.yml`): GitHub Actions workflow that loads experiment config, generates datasets, runs benchmarks, trains an ML model, generates report, and publishes artifacts to `gh-pages`.
- Benchmarking (`/benchmarking`): Python scripts to generate datasets, run user code, train models, and produce reports.
- ML artifacts (`/ml`): ONNX outputs per experiment are published under `gh-pages/experiments/<id>/ml/`.

## Data Model

- Experiment: `id`, `title`, `language`, `implementations[]`, `inputProfile`, `metricsRequested`, `constraints`, `status`
- BenchmarkResult: per-implementation metrics for size and distribution
- AIAnalysis: `complexityClass`, predictions, recommended implementation, justification

Artifacts on `gh-pages/experiments/<id>/`:

- `config.json`, `raw_results.json`, `results.json`, `report.md`, `ml/model.onnx`, `ml/memory.onnx`

## Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- GitHub repo with Pages enabled and a `gh-pages` branch
- Vercel project connected to this repo

### Environment Variables

Set these for Vercel (`Project Settings → Environment Variables`) and local dev via `.env` files or shell:

- `GITHUB_OWNER`: your GitHub username or org
- `GITHUB_REPO`: repository name
- `GITHUB_TOKEN`: PAT with `repo` scope (used by API)

Frontend expects:

- `VITE_API_BASE_URL`: Vercel deployment base URL (e.g., `https://<project>.vercel.app`)
- `VITE_GITHUB_OWNER`, `VITE_GITHUB_REPO`: same as above for fetching artifacts

### Frontend

```
cd frontend
npm install
npm run dev
```

Open the Dev Server and use the UI to create experiments.

### Backend (Vercel)

The `api` directory contains serverless functions:

- `POST /api/experiments`: creates `experiments/<id>/config.json` and dispatches `benchmark.yml`
- `GET /api/experiments/:id/status`: checks workflow status or `results.json` on `gh-pages`
- `GET /api/experiments/:id/results`: returns `results.json` from `gh-pages`
- `POST /api/predict`: runs ONNX inference server-side using `onnxruntime-node`

Deploy by connecting the repo in Vercel; functions are auto-detected.

### GitHub Actions Workflow

The workflow runs on `workflow_dispatch` with input `experiment_id`.

Steps:

- Checkout repo
- Setup Python + Node
- Install Python deps from `benchmarking/requirements.txt`
- Run `benchmarking/run_benchmarks.py --experiment-id <id>`
- Commit artifacts to `gh-pages`

### Benchmarking Scripts

- `generate_datasets.py`: creates input arrays by size and distribution
- `run_benchmarks.py`: executes user code in Python or TypeScript using `run_algorithm`/`runAlgorithm` entry points, measures runtime and memory using `psutil`, writes `raw_results.json`, runs training and report generation, commits to `gh-pages`
- `train_model.py`: trains simple linear regressors for runtime and memory, exports ONNX models to `experiments/<id>/ml/`
- `generate_report.py`: writes `report.md` from results summary

## Development Notes

- Ensure `gh-pages` branch exists and is published via GitHub Pages
- The workflow checks out `gh-pages` to push results; repo must allow write from Actions
- ONNX model input is a single feature `size`; predictions are extrapolated via linear regression

## Lint & Test

Frontend:

```
cd frontend
npm run lint
npm run test
```

API:

```
cd api
npm install
npm run lint
```

## Usage

1. In the Frontend, create an experiment. Add one or more implementations. For Python, define `def run_algorithm(x):`; for TypeScript, export `function runAlgorithm(x: any): any`.
2. Choose input sizes and distributions, select metrics, submit. The API writes config and triggers the workflow.
3. The UI polls status via API and results via `gh-pages`, visualizes runtime and memory charts, and shows AI insights.

## Security

- User code is executed in CI inside the Actions runner with basic isolation via subprocess; do not run untrusted code in production environments.

