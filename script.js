
const sampleIssues = [
  {
    id: "DQ-101",
    title: "Missing customer identifiers",
    dataset: "Customer Master",
    product: "Savings Account",
    severity: "Critical",
    missing: 12.4,
    impacted: 1240,
    status: "Open",
    cause: "Customer IDs may be missing from the source or ingestion pipeline.",
    impact: "Customer records may not join correctly to accounts and transactions.",
    action: "Check source and warehouse counts and validate customer_id.",
    team: "Data Engineering"
  },
  {
    id: "DQ-102",
    title: "Unmatched loan applications",
    dataset: "Loan Applications",
    product: "Personal Loan",
    severity: "High",
    missing: 7.8,
    impacted: 386,
    status: "In Progress",
    cause: "Customer keys may use different formats or load at different times.",
    impact: "Application and approval reporting may be inaccurate.",
    action: "Reconcile unmatched application IDs with the source data.",
    team: "ETL / Pipeline Team"
  },
  {
    id: "DQ-103",
    title: "Card transaction date gaps",
    dataset: "Card Transactions",
    product: "Premium Credit Card",
    severity: "High",
    missing: 5.6,
    impacted: 562,
    status: "Open",
    cause: "Timestamp mapping may be inconsistent.",
    impact: "Daily transaction and revenue reports may be inaccurate.",
    action: "Validate timestamps and add date completeness checks.",
    team: "ETL / Pipeline Team"
  },
  {
    id: "DQ-104",
    title: "Incorrect account status mapping",
    dataset: "Account Master",
    product: "Current Account",
    severity: "Medium",
    missing: 3.2,
    impacted: 219,
    status: "Open",
    cause: "A source status may not map to the standard status list.",
    impact: "Active-account reporting may be incorrect.",
    action: "Compare source and target status values.",
    team: "Source System Team"
  },
  {
    id: "DQ-105",
    title: "Null outstanding balance",
    dataset: "Loan Balances",
    product: "Home Loan",
    severity: "Critical",
    missing: 8.9,
    impacted: 178,
    status: "In Progress",
    cause: "The balance feed may be incomplete.",
    impact: "Outstanding exposure may be understated.",
    action: "Reconcile balances and inspect failed calculations.",
    team: "Data Engineering"
  },
  {
    id: "DQ-106",
    title: "Duplicate payment references",
    dataset: "Digital Payments",
    product: "Digital Payments",
    severity: "Medium",
    missing: 1.4,
    impacted: 92,
    status: "Resolved",
    cause: "Retry events may be loaded without deduplication.",
    impact: "Transaction counts may be overstated.",
    action: "Validate transaction identifiers and deduplication.",
    team: "ETL / Pipeline Team"
  },
  {
    id: "DQ-107",
    title: "Missing card limit values",
    dataset: "Card Accounts",
    product: "Personal Credit Card",
    severity: "Low",
    missing: 2.1,
    impacted: 74,
    status: "Open",
    cause: "Card limit details may be delayed.",
    impact: "Credit utilisation calculations may be incomplete.",
    action: "Validate missing limits against the card source.",
    team: "Product Operations"
  },
  {
    id: "DQ-108",
    title: "Stale customer contact details",
    dataset: "Customer Master",
    product: "Savings Account",
    severity: "Low",
    missing: 1.8,
    impacted: 61,
    status: "Resolved",
    cause: "The latest contact refresh may not have run.",
    impact: "Customer profile completeness may be reduced.",
    action: "Check the refresh schedule and freshness rules.",
    team: "Source System Team"
  },
  {
    id: "DQ-109",
    title: "Missing decision timestamp",
    dataset: "Loan Applications",
    product: "Home Loan",
    severity: "High",
    missing: 6.1,
    impacted: 143,
    status: "Open",
    cause: "Decision events may not reach the application table.",
    impact: "Turnaround-time reporting may be incomplete.",
    action: "Trace decision events from source to target.",
    team: "Product Operations"
  },
  {
    id: "DQ-110",
    title: "Account-to-customer join mismatch",
    dataset: "Account Master",
    product: "Current Account",
    severity: "Medium",
    missing: 4.4,
    impacted: 207,
    status: "In Progress",
    cause: "Account customer keys may be absent from the current snapshot.",
    impact: "Customer-level balance reporting may not reconcile.",
    action: "Run an anti-join and check source refresh timing.",
    team: "Data Governance"
  }
];

const productData = [
  { name: "Personal Credit Card", apps: "2,840", txn: "₹1.42 Cr", bal: "₹48 L", rev: "₹8.6 L", status: "Watch" },
  { name: "Premium Credit Card", apps: "1,260", txn: "₹2.18 Cr", bal: "₹72 L", rev: "₹12.4 L", status: "At risk" },
  { name: "Personal Loan", apps: "2,360", txn: "₹1.16 Cr", bal: "₹86 L", rev: "₹9.8 L", status: "At risk" },
  { name: "Home Loan", apps: "1,140", txn: "₹94 L", bal: "₹1.42 Cr", rev: "₹7.1 L", status: "At risk" },
  { name: "Savings Account", apps: "3,480", txn: "₹1.36 Cr", bal: "₹18 L", rev: "₹3.4 L", status: "Watch" },
  { name: "Current Account", apps: "840", txn: "₹86 L", bal: "₹10 L", rev: "₹2.2 L", status: "Watch" },
  { name: "Digital Payments", apps: "560", txn: "₹50 L", bal: "—", rev: "₹3.3 L", status: "Healthy" }
];

const sevColors = {
  Critical: "#d9485f",
  High: "#e79a2e",
  Medium: "#e9c34a",
  Low: "#249b7a"
};

let selectedId = null;
let tickets = [];

const $ = id => document.getElementById(id);

function filtered() {
  return sampleIssues.filter(i =>
    ($("dataset").value === "All datasets" ||
      i.dataset === $("dataset").value) &&
    ($("severity").value === "All severities" ||
      i.severity === $("severity").value) &&
    ($("status").value === "All statuses" ||
      i.status === $("status").value) &&
    ($("product").value === "All products" ||
      i.product === $("product").value)
  );
}

function badge(text) {
  let cls = text.toLowerCase().replace(" ", "");
  if (text === "In Progress") cls = "progress";
  return `<span class="tag ${cls}">${text}</span>`;
}

function shortLabel(s) {
  return s.replace("Customer ", "")
    .replace(" Transactions", " Txns")
    .replace(" Applications", " Apps")
    .replace(" Master", "")
    .replace(" Payments", " Pay")
    .replace(" Balances", " Bal.");
}

function renderBars(el, items, color) {
  const max = Math.max(1, ...items.map(x => x.count));

  $(el).innerHTML = items.length
    ? items.map(x => `
      <div class="bar-row" title="${x.name}: ${x.count}">
        <div class="bar-name" title="${x.name}">${shortLabel(x.name)}</div>
        <div class="bar-track">
          <div class="bar-fill"
            style="width:${Math.max(2, x.count / max * 100)}%;background:${color || "#5577ed"}">
          </div>
        </div>
        <div class="bar-count">${x.count}</div>
      </div>
    `).join("")
    : `<div class="empty">No matching issues</div>`;
}

function render() {
  const arr = filtered();
  const open = sampleIssues.filter(i => i.status !== "Resolved").length;
  $("kOpen").textContent = open;

  const ds = {};
  arr.forEach(i => ds[i.dataset] = (ds[i.dataset] || 0) + 1);

  renderBars(
    "datasetBars",
    Object.entries(ds)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    "#5577ed"
  );

  const pd = {};
  arr.forEach(i => pd[i.product] = (pd[i.product] || 0) + 1);

  renderBars(
    "productBars",
    Object.entries(pd)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    "#259b83"
  );

  const sev = ["Critical", "High", "Medium", "Low"].map(s => ({
    name: s,
    count: arr.filter(i => i.severity === s).length,
    color: sevColors[s]
  }));

  const total = arr.length;
  let cur = 0;
  const stops = [];

  sev.forEach(s => {
    const end = cur + (total ? s.count / total * 100 : 0);
    stops.push(`${s.color} ${cur}% ${end}%`);
    cur = end;
  });

  $("severityDonut").style.background = total
    ? `conic-gradient(${stops.join(",")})`
    : "#edf1f7";

  $("sevTotal").textContent = total;

  $("severityKey").innerHTML = sev.map(s =>
    `<div><i style="background:${s.color}"></i>${s.name} <b>${s.count}</b></div>`
  ).join("");

  $("issueCount").textContent =
    `${arr.length} matching issue${arr.length === 1 ? "" : "s"}`;

  $("issueRows").innerHTML = arr.length
    ? arr.map(i => `
      <tr>
        <td><b>${i.title}</b><div class="small">${i.id}</div></td>
        <td>${i.dataset}</td>
        <td>${badge(i.severity)}</td>
        <td>${i.missing.toFixed(1)}%</td>
        <td>${i.impacted.toLocaleString("en-IN")}</td>
        <td>${badge(i.status)}</td>
        <td><button class="btn secondary" onclick="selectIssue('${i.id}')">Inspect</button></td>
      </tr>
    `).join("")
    : `<tr><td colspan="7" class="empty">No issues match these filters.</td></tr>`;

  const threshold = Math.max(
    1, Math.min(50, Number($("threshold").value) || 5)
  );

  const alerts = arr.filter(i => i.missing >= threshold);

  $("alertTitle").textContent = alerts.length
    ? `${alerts.length} issue${alerts.length === 1 ? "" : "s"} at or above ${threshold}% missing rate`
    : `No issue meets the ${threshold}% threshold`;

  $("alertText").textContent = alerts.length
    ? alerts.map(i => `${i.id} (${i.missing}%)`).join(" · ")
    : "Try lowering the threshold or broadening the filters to review more records.";

  $("alertBox").style.background = alerts.length ? "#fff9eb" : "#edf9f4";
  $("alertBox").style.borderColor = alerts.length ? "#f2d7a1" : "#c9ebdc";
  $("alertTitle").style.color = alerts.length ? "#8a5a0b" : "#16745b";

  $("productRows").innerHTML = productData.map(p => `
    <tr>
      <td><b>${p.name}</b></td>
      <td>${p.apps}</td>
      <td>${p.txn}</td>
      <td>${p.bal}</td>
      <td>${p.rev}</td>
      <td>${
        p.status === "At risk"
          ? '<span class="tag critical">At risk</span>'
          : p.status === "Watch"
            ? '<span class="tag medium">Watch</span>'
            : '<span class="tag low">Healthy</span>'
      }</td>
    </tr>
  `).join("");

  if (selectedId && arr.some(i => i.id === selectedId)) {
    selectIssue(selectedId);
  } else if (arr.length) {
    selectIssue(arr[0].id);
  } else {
    $("issueDetails").innerHTML =
      '<div class="empty">No matching issue to inspect.</div>';
  }
}

function selectIssue(id) {
  selectedId = id;
  const i = sampleIssues.find(x => x.id === id);
  if (!i) return;

  $("issueDetails").innerHTML = `
    <div class="detail-box" style="margin-top:0">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:start">
        <div>
          <div class="small">${i.id} · ${i.dataset}</div>
          <h3 style="margin-top:4px">${i.title}</h3>
        </div>
        ${badge(i.severity)}
      </div>

      <div class="detail-grid">
        <div><b>Impacted records</b><span>${i.impacted.toLocaleString("en-IN")}</span></div>
        <div><b>Missing rate</b><span>${i.missing}%</span></div>
        <div><b>Product</b><span>${i.product}</span></div>
        <div><b>Assigned team</b><span>${i.team}</span></div>
      </div>

      <p><b>Possible root cause</b><br>${i.cause}</p>
      <p><b>Business / reporting impact</b><br>${i.impact}</p>
      <p><b>Suggested next step</b><br>${i.action}</p>
      <p><b>Current status</b> ${badge(i.status)}</p>
      <button class="btn" onclick="prefillTicket('${i.id}')">Prepare action ticket</button>
    </div>
  `;

  $("ticketTitle").value = `${i.id}: ${i.title}`;
  $("ticketTeam").value = i.team;
  $("ticketPriority").value = i.severity;
  $("ticketAction").value = i.action;
}

function prefillTicket(id) {
  selectIssue(id);
  $("ticketTitle").focus();
  $("ticketTitle").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function renderTickets() {
  $("tickets").innerHTML = tickets.length
    ? tickets.map(t => `
      <div class="ticket">
        <div>
          <b>${t.id} · ${t.title}</b>
          <small>${t.team} · ${t.priority} priority · ${t.action}</small>
        </div>
        <select aria-label="Ticket status"
          onchange="updateTicket('${t.id}',this.value)"
          style="width:auto;max-width:130px;padding:7px">
          <option ${t.status === "Open" ? "selected" : ""}>Open</option>
          <option ${t.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option ${t.status === "Resolved" ? "selected" : ""}>Resolved</option>
        </select>
      </div>
    `).join("")
    : '<div class="empty">No tickets created yet.</div>';
}

function updateTicket(id, status) {
  const t = tickets.find(x => x.id === id);
  if (t) t.status = status;
  renderTickets();
}

$("createTicket").addEventListener("click", () => {
  const title = $("ticketTitle").value.trim();

  if (!title) {
    $("ticketMsg").textContent = "Please enter a ticket summary first.";
    return;
  }

  const ticket = {
    id: "PT-" + String(tickets.length + 1).padStart(3, "0"),
    title,
    team: $("ticketTeam").value,
    priority: $("ticketPriority").value,
    action: $("ticketAction").value.trim() ||
      "Investigate and validate the affected data.",
    status: "Open"
  };

  tickets.unshift(ticket);
  renderTickets();
  $("ticketMsg").textContent =
    `Created ${ticket.id} in this browser prototype.`;
  $("ticketTitle").value = "";
});

["dataset", "severity", "status", "product", "threshold"]
  .forEach(id => $(id).addEventListener("change", render));

$("reset").addEventListener("click", () => {
  $("dataset").selectedIndex = 0;
  $("severity").selectedIndex = 0;
  $("status").selectedIndex = 0;
  $("product").selectedIndex = 0;
  $("threshold").value = 5;
  render();
});

[...new Set(sampleIssues.map(i => i.dataset))]
  .sort()
  .forEach(d => {
    const o = document.createElement("option");
    o.textContent = d;
    $("dataset").appendChild(o);
  });

render();
renderTickets();
