# Data Quality & Impact Monitor

Beginner-friendly Streamlit prototype with illustrative dummy banking data.

## Run these commands one at a time:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
streamlit run app.py
```

1. Open the local URL shown in Terminal, usually http://localhost:8501.
2. Stop with Control+C in Terminal.

Features: KPI cards, filters, threshold-based alerts, charts, issue table, drill-down, and simulated ticket creation.

All data is fictional. Tickets stay in the current app session; nothing is sent to a real team or bank. Root causes are examples, not verified diagnoses.
