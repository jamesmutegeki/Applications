# Applications
All my web applications and apps code are kept here

## Dermatology AI — Clinical Decision Support System

AI-powered dermatology triage and diagnosis support system with clinician-in-the-loop (HITL) reinforcement learning.

### Features

- **AI Diagnosis** — HRNet-CBM model predicts skin lesion type with concept-based explanations (asymmetry, border, color, etc.)
- **XAI** — Grad-CAM heatmaps and Integrated Gradients visualisations
- **Clinician Override** — Doctors can correct AI predictions; feedback trains a PPO agent online
- **Fairness Tracking** — Accuracy, precision, recall, F1 tracked per Fitzpatrick skin type
- **Admin Dashboard** — Doctor management, activity log, analytics charts, bulk actions
- **Role-based Access** — Admin and physician login with per-doctor permissions
- **PPO Agent** — Offline policy optimisation tunes triage recommendations from override history

### Quick Start

```bash
pip install -r requirements.txt
python main.py --dashboard --port 8000
```

Open **http://localhost:8000**.

### Login

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Doctor | _varies_ | set by admin |

### Tech Stack

Python, FastAPI, PyTorch, HRNet, PPO, Chart.js, HTML/CSS/JS
