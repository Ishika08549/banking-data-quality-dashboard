import streamlit as st
import pandas as pd
import plotly.express as px
from pathlib import Path
from datetime import datetime

st.set_page_config(page_title="Data Quality Monitor", page_icon="📊", layout="wide")
st.title("📊 Data Quality & Impact Monitor")
st.caption("Prototype using dummy banking data — not connected to a live banking system")
df = pd.read_csv(Path(__file__).parent / "data" / "issues.csv")

with st.sidebar:
    st.header("Filters")
    dataset = st.selectbox("Dataset", ["All"] + sorted(df.dataset.unique().tolist()))
    severity = st.selectbox("Severity", ["All", "Critical", "High", "Medium", "Low"])
    status = st.selectbox("Status", ["All"] + sorted(df.status.unique().tolist()))
    threshold = st.slider("Missing-record alert threshold (%)", 1, 20, 5)

f = df.copy()
if dataset != "All": f = f[f.dataset == dataset]
if severity != "All": f = f[f.severity == severity]
if status != "All": f = f[f.status == status]

open_count = int(f.status.isin(["Open", "In Progress"]).sum())
resolved = f.loc[f.resolution_hours > 0, "resolution_hours"]
a,b,c,d = st.columns(4)
a.metric("Issues detected", len(f))
b.metric("Affected customers", f"{int(f.affected_customers.sum()):,}")
c.metric("Open / in progress", open_count)
d.metric("Average resolution", f"{resolved.mean():.1f} hrs" if len(resolved) else "N/A")

st.subheader("Alerts")
alerts = f[f.missing_rate_pct > threshold]
if alerts.empty:
    st.success(f"No missing-rate alerts above {threshold}% for current filters.")
else:
    for _, r in alerts.iterrows():
        st.warning(f'{r.issue_id} | {r.dataset}: {r.issue_type} — {r.missing_rate_pct}% missing; {r.affected_records:,} records and {r.affected_customers:,} customers potentially affected.')

left,right = st.columns(2)
with left:
    st.subheader("Issues by dataset")
    if len(f):
        x = f.groupby("dataset", as_index=False).size()
        st.plotly_chart(px.bar(x, x="dataset", y="size", color="dataset"), use_container_width=True)
with right:
    st.subheader("Issues by severity")
    if len(f):
        x = f.groupby("severity", as_index=False).size()
        st.plotly_chart(px.pie(x, names="severity", values="size", hole=.45), use_container_width=True)

st.subheader("Issue register")
cols = ["issue_id","dataset","issue_type","severity","affected_records","affected_customers","root_cause","team","status","missing_rate_pct"]
st.dataframe(f[cols], use_container_width=True, hide_index=True)

st.subheader("Drill down into an issue")
if len(f):
    selected = st.selectbox("Select issue ID", f.issue_id.tolist())
    r = f[f.issue_id == selected].iloc[0]
    x,y,z = st.columns(3)
    x.metric("Affected records", f"{int(r.affected_records):,}")
    y.metric("Affected customers", f"{int(r.affected_customers):,}")
    z.metric("Missing rate", f"{r.missing_rate_pct}%")
    st.write("**Dataset:**", r.dataset, "| **Severity:**", r.severity)
    st.write("**Possible root cause:**", r.root_cause)
    st.write("**Suggested action:**", r.suggested_action)
    st.write("**Responsible team:**", r.team)

st.subheader("Create a prototype ticket")
if len(f):
    with st.form("ticket"):
        issue_id = st.selectbox("Issue", f.issue_id.tolist(), key="ticket_issue")
        teams = sorted(df.team.unique().tolist())
        team = st.selectbox("Assign to team", teams)
        priority = st.selectbox("Priority", ["Critical","High","Medium","Low"])
        note = st.text_area("Message to team", "Please investigate the issue, validate the possible root cause, and confirm the impact.")
        submit = st.form_submit_button("Create ticket")
    if submit:
        if "tickets" not in st.session_state: st.session_state.tickets = []
        n = len(st.session_state.tickets) + 1
        st.session_state.tickets.append({"Ticket ID":f"TKT-{n:03d}","Issue ID":issue_id,"Team":team,"Priority":priority,"Note":note,"Created":datetime.now().strftime("%Y-%m-%d %H:%M")})
        st.success(f"Prototype ticket TKT-{n:03d} created. It is not sent to a real ticketing system.")
if st.session_state.get("tickets"):
    st.subheader("Tickets created in this session")
    st.dataframe(pd.DataFrame(st.session_state.tickets), use_container_width=True, hide_index=True)
st.caption("Dummy data only. Root causes are illustrative hypotheses; real integrations and validation would be needed in production.")
