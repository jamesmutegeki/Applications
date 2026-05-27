# Dermatology AI — Clinical Decision Support System

AI-powered dermatology triage and diagnosis support system with clinician-in-the-loop (HITL) reinforcement learning.

## Features

- **AI Diagnosis** — HRNet-CBM model predicts skin lesion type with concept-based explanations (asymmetry, border, color, etc.)
- **XAI** — Grad-CAM heatmaps and Integrated Gradients visualisations
- **Clinician Override** — Doctors can correct AI predictions; feedback trains a PPO agent online
- **Fairness Tracking** — Accuracy, precision, recall, F1 tracked per Fitzpatrick skin type
- **Admin Dashboard** — Doctor management, activity log, analytics charts, bulk actions
- **Role-based Access** — Admin and physician login with per-doctor permissions
- **PPO Agent** — Offline policy optimisation tunes triage recommendations from override history

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Launch the dashboard
python main.py --dashboard --port 8000
```

Open **http://localhost:8000** in your browser.

### Login

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Doctor | _varies_ | set by admin |

## Architecture

```
server.py          — FastAPI REST API (auth, doctors, patients, analytics)
dashboard.html     — Single-page admin & doctor UI (vanilla JS + Chart.js)
model.py           — HRNet-CBM with XAI (Grad-CAM, Integrated Gradients)
rl_module.py       — PPO agent + dermatology triage environment
hitl_pipeline.py   — Online/offline HITL policy optimisation
metrics_tracker.py — Fairness-aware accuracy tracking
main.py            — CLI entry point (headless, Gradio UI, or dashboard)
ui.py              — Gradio web UI
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/login` | Admin authentication |
| GET | `/api/admin/doctors` | List all doctors |
| POST | `/api/admin/doctors` | Create a doctor |
| PUT | `/api/admin/doctors/{id}` | Update a doctor |
| POST | `/api/admin/doctors/bulk` | Bulk activate/deactivate |
| POST | `/api/login` | Doctor authentication |
| POST | `/api/diagnose` | Run AI diagnosis on images |
| GET | `/api/analytics` | System metrics |
| GET | `/api/admin/analytics-data` | Chart data |
| GET | `/api/admin/activity` | Activity log |
| GET | `/api/admin/sessions` | Active sessions |

## Tech Stack

- **Backend:** Python, FastAPI, uvicorn
- **Model:** PyTorch, HRNet backbone, concept bottleneck
- **RL:** PPO (Stable-Baselines3–compatible)
- **Frontend:** Vanilla HTML/CSS/JS, Chart.js
- **Auth:** bcrypt password hashing, token sessions

## License

MIT
