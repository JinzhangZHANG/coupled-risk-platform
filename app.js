const STORAGE_KEY = "coupled-risk-platform-v2";
const SETTINGS_KEY = "coupled-risk-interface-settings-v1";

const demoState = {
  project: {
    name: "Qingdao Jiaozhou Bay Second Subsea Tunnel",
    type: "Subsea tunnel",
    location: "Qingdao, Shandong, China",
    unit: "Fault f12 · drill-and-blast section",
    threshold: 0.03,
    maxDepth: 4,
  },
  target: 0,
  risks: [
    { name: "Safety Risk", short: "Safety", grade: 3, color: "#1262d6" },
    { name: "Schedule Risk", short: "Schedule", grade: 3, color: "#ec6d1f" },
    { name: "Quality Risk", short: "Quality", grade: 4, color: "#079f9a" },
    { name: "Investment Risk", short: "Investment", grade: 4, color: "#6552bf" },
  ],
  coupling: [
    [1.000, 1.966, 1.788, 2.123],
    [1.141, 1.000, 1.106, 1.181],
    [1.296, 1.004, 1.000, 1.072],
    [1.210, 1.334, 1.248, 1.000],
  ],
  transmission: [
    [0.000, 0.416, 0.339, 0.466],
    [0.123, 0.000, 0.270, 0.228],
    [0.310, 0.253, 0.000, 0.106],
    [0.188, 0.274, 0.237, 0.000],
  ],
};

const gradeNames = ["", "Extreme", "High", "Moderate", "Low"];
const roman = ["", "I", "II", "III", "IV"];
const gradeAdjustment = [
  [1.00, 1.03, 1.07, 1.10],
  [0.97, 1.00, 1.03, 1.07],
  [0.93, 0.97, 1.00, 1.03],
  [0.90, 0.93, 0.97, 1.00],
];

const riskPriorityRules = [
  /safety|安全/i,
  /quality|质量/i,
  /schedule|progress|进度|工期/i,
  /investment|cost|投资|造价|成本/i,
  /contract|合约|合同/i,
  /technical|technology|技术/i,
  /management|管理/i,
  /environment|环境/i,
  /integrity|廉政/i,
  /social|stability|other|社会稳定|其他/i,
];

const clone = value => JSON.parse(JSON.stringify(value));
let state = loadState();
let interfaceSettings = loadInterfaceSettings();
const originalTextNodes = new WeakMap();

const zhText = {
  "Assessment Platform":"评估平台", "Dashboard":"仪表盘", "Project Setup":"项目设置", "Risk Library":"风险库",
  "Coupling Matrix":"耦合矩阵", "Transfer Matrix":"传递矩阵", "Effective Paths":"有效路径", "Target-Risk Assessment":"目标风险评估",
  "Reports":"报告", "Settings":"设置", "Engineering risk decision support":"工程风险决策支持", "Coupled Multi-Risk Assessment Platform":"多风险耦合评估平台",
  "Sign Out":"退出登录", "Reset Demo":"重置演示", "Export Full Report":"导出完整报告", "Project Summary":"项目概况",
  "Project Type":"项目类型", "Location":"项目位置", "Assessment Unit":"评估单元", "Model Focus":"模型重点", "Initial Target Grade":"目标风险初始等级",
  "Coupled Grade":"耦合后等级", "Amplification Factor":"放大系数", "Effective Paths":"有效路径", "Analysis Status":"分析状态",
  "Dominant Path":"主导路径", "Network Density":"网络密度", "Control Priority":"管控优先项", "Apply":"应用", "Add Risk":"添加风险",
  "Project name":"项目名称", "Project type":"项目类型", "Assessment unit":"评估单元", "Path threshold T0":"路径阈值 T0", "Max path length":"最大路径长度",
  "Risk Interaction Network":"风险相互作用网络", "Coupling C":"耦合 C", "Transfer T":"传递 T", "Coupled Assessment Result":"耦合评估结果",
  "Target risk":"目标风险", "Initial numerical grade":"初始数值等级", "Coupled numerical grade":"耦合后数值等级", "Risk change":"风险变化",
  "Original Coupling Matrix C₀":"原始耦合系数矩阵 C₀", "Original Transfer Matrix T₀":"原始传递系数矩阵 T₀",
  "Risk Grade Matrix G":"风险等级矩阵 G", "Coefficient Adjustment Matrix A":"系数修正矩阵 A", "Adjusted Coupling Matrix C*":"修正后耦合矩阵 C*",
  "Adjusted Transfer Matrix T*":"修正后传递矩阵 T*", "Effective Propagation Paths":"有效传播路径", "Analysis Report":"分析报告", "Copy Summary":"复制摘要",
  "expert initial input · editable":"专家初始输入 · 可编辑", "automatically generated from Risk Library":"根据风险库自动生成", "embedded from the manuscript":"论文内置矩阵",
  "C₀ × grade adjustment factor":"C₀ × 等级修正因子", "T₀ × grade adjustment factor":"T₀ × 等级修正因子", "consequence amplification":"后果放大",
  "cascading tendency":"级联传递倾向", "Target risk is located at the centre":"目标风险位于中心", "Line thickness reflects coefficient magnitude":"线宽表示系数大小",
  "Arrow direction indicates risk propagation":"箭头方向表示风险传递", "Interface Preferences":"界面偏好", "Interface language":"界面语言", "Report language":"报告语言",
  "Interface font":"界面字体", "Text size":"文字大小", "Display density":"显示密度", "Accent colour":"主题颜色", "Preview":"预览",
  "Restore Defaults":"恢复默认", "Save Settings":"保存设置", "Welcome back":"欢迎回来", "Sign in to open the assessment workspace.":"登录后进入评估工作区。",
  "Username":"账号", "Password":"密码", "Sign In":"登录", "English report":"英文报告", "Small":"小", "Standard":"标准", "Large":"大",
  "Comfortable":"舒适", "Compact":"紧凑", "Engineering Blue":"工程蓝", "Ocean Teal":"海洋青", "Deep Navy":"深海蓝",
  "Target risk":"目标风险", "Interacting risk":"关联风险", "Automatically recalculated whenever a risk grade or original coefficient changes.":"风险等级或原始系数变化时自动重新计算。",
  "One-hot encoding generated directly from the current Risk Library.":"根据当前风险库自动生成 one-hot 风险等级矩阵。"
};

function loadInterfaceSettings() {
  try {
    return {font:"system",size:"1",density:"comfortable",accent:"blue",language:"en",reportLanguage:"en",...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")};
  } catch {
    return {font:"system",size:"1",density:"comfortable",accent:"blue",language:"en",reportLanguage:"en"};
  }
}

function applyInterfaceSettings() {
  const fonts={system:'"Aptos", "Segoe UI", "Microsoft YaHei", sans-serif',arial:'Arial, "Microsoft YaHei", sans-serif',times:'"Times New Roman", "Microsoft YaHei", serif',georgia:'Georgia, "Microsoft YaHei", serif'};
  const accents={blue:["#1262d6","#0b3e91"],teal:["#078f92","#086a78"],navy:["#244a86","#142f5e"]};
  const root=document.documentElement, palette=accents[interfaceSettings.accent] || accents.blue;
  root.style.setProperty("--ui-font",fonts[interfaceSettings.font] || fonts.system);
  root.style.setProperty("--ui-scale",interfaceSettings.size || "1");
  root.style.setProperty("--blue",palette[0]);
  root.style.setProperty("--blue-deep",palette[1]);
  document.body.classList.toggle("compact-ui",interfaceSettings.density === "compact");
}

function syncSettingsForm() {
  el("languageSetting").value=interfaceSettings.language;
  el("reportLanguageSetting").value=interfaceSettings.reportLanguage;
  el("fontFamilySetting").value=interfaceSettings.font;
  el("fontSizeSetting").value=interfaceSettings.size;
  el("densitySetting").value=interfaceSettings.density;
  el("accentSetting").value=interfaceSettings.accent;
}

function applyLanguage() {
  const language = interfaceSettings.language || "en";
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!originalTextNodes.has(node)) originalTextNodes.set(node, node.nodeValue);
    const original = originalTextNodes.get(node), trimmed = original.trim();
    if (!trimmed) continue;
    const translated = language === "zh" ? zhText[trimmed] : null;
    node.nodeValue = language === "zh" && translated ? original.replace(trimmed, translated) : original;
  }
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved?.risks?.length >= 2 ? saved : clone(demoState);
  } catch {
    return clone(demoState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function adjusted(matrix, from, to) {
  // Eq. (6): grade adjustment; c_ii = 1, t_ii = 0, and adjusted transfer coefficients are capped at 1
  const isTransfer = matrix === state.transmission;
  if (from === to) return isTransfer ? 0 : 1;
  const factor = gradeAdjustment[state.risks[from].grade - 1][state.risks[to].grade - 1];
  const value = matrix[from][to] * factor;
  return isTransfer ? Math.min(1, value) : value;
}

function riskPriority(risk) {
  const label = `${risk.name} ${risk.short}`;
  const index = riskPriorityRules.findIndex(rule => rule.test(label));
  return index < 0 ? riskPriorityRules.length : index;
}

function identifyTargetRisk() {
  let best = 0;
  for (let i = 1; i < state.risks.length; i++) {
    const candidate = state.risks[i], current = state.risks[best];
    if (candidate.grade < current.grade || (candidate.grade === current.grade && riskPriority(candidate) < riskPriority(current))) best = i;
  }
  state.target = best;
  return best;
}

function enumeratePaths() {
  const paths = [];
  const target = state.target;
  const maxNodes = Math.min(state.project.maxDepth, state.risks.length);
  function walk(route) {
    const last = route.at(-1);
    if (last === target) {
      if (route.length > 1) paths.push(route);
      return;
    }
    if (route.length >= maxNodes) return;
    for (let next = 0; next < state.risks.length; next++) {
      if (!route.includes(next) && (next === target || next !== route[0])) walk([...route, next]);
    }
  }
  for (let start = 0; start < state.risks.length; start++) if (start !== target) walk([start]);
  return paths.map(route => {
    let probability = 1;
    let amplification = 1;
    for (let i = 0; i < route.length - 1; i++) {
      probability *= adjusted(state.transmission, route[i], route[i + 1]);
      amplification *= adjusted(state.coupling, route[i], route[i + 1]);
    }
    return { route, probability, amplification };
  }).filter(x => x.probability + 1e-10 >= state.project.threshold)
    .sort((a, b) => b.probability - a.probability);
}

function calculate() {
  const paths = enumeratePaths();
  const total = paths.reduce((sum, x) => sum + x.probability, 0);
  paths.forEach(x => {
    x.weight = total ? x.probability / total : 0;
    x.contribution = x.weight * x.amplification;
  });
  const lambda = paths.reduce((sum, x) => sum + x.contribution, 0) || 1;
  const initial = state.risks[state.target].grade;
  const coupled = initial / lambda;
  const grade = Math.max(1, Math.min(4, Math.ceil(coupled - 0.5)));
  return { paths, lambda, initial, coupled, grade };
}

function el(id) { return document.getElementById(id); }
function fmt(value, digits = 3) { return Number(value).toFixed(digits); }

function render() {
  identifyTargetRisk();
  const result = calculate();
  renderProject(result);
  renderRiskList();
  renderMatrix("couplingMatrix", "coupling");
  renderMatrix("transmissionMatrix", "transmission");
  renderGradeMatrix();
  renderAdjustmentMatrix();
  renderReadOnlyRiskMatrix("adjustedCouplingMatrix", "coupling");
  renderReadOnlyRiskMatrix("adjustedTransmissionMatrix", "transmission");
  renderPaths(result);
  renderNetwork();
  renderGauge(result);
  renderReport(result);
  el("reportText").value = buildReportSummary(interfaceSettings.reportLanguage || "en");
  applyLanguage();
  saveState();
}

function renderProject(r) {
  el("projectTitle").textContent = state.project.name;
  el("projectTypeText").textContent = state.project.type;
  el("locationText").textContent = state.project.location;
  el("unitText").textContent = state.project.unit;
  el("projectName").value = state.project.name;
  el("projectType").value = state.project.type;
  el("projectLocation").value = state.project.location;
  el("assessmentUnit").value = state.project.unit;
  el("thresholdInput").value = state.project.threshold;
  el("maxDepthInput").value = state.project.maxDepth;
  el("initialGradeMetric").textContent = roman[r.initial];
  el("initialGradeName").textContent = gradeNames[r.initial];
  el("coupledGradeMetric").textContent = roman[r.grade];
  el("coupledGradeName").textContent = gradeNames[r.grade];
  el("ampMetric").textContent = fmt(r.lambda);
  el("ampChange").textContent = r.lambda >= 1 ? `↑ ${fmt((r.lambda - 1) * 100, 1)}% amplification` : "Attenuation";
  el("pathMetric").textContent = r.paths.length;
  el("thresholdMetric").textContent = `T₀ = ${state.project.threshold}`;
  el("warningText").textContent = gradeNames[r.grade];
  el("warningText").style.color = r.grade <= 2 ? "#ec6d1f" : "#079f9a";
  el("targetName").textContent = state.risks[state.target].name;
  el("initialValue").textContent = fmt(r.initial, 2);
  el("coupledValue").textContent = fmt(r.coupled, 3);
  const delta = Math.max(0, r.initial - r.grade);
  el("riskChange").textContent = delta ? `Upgraded by ${delta} level${delta > 1 ? "s" : ""}` : "Grade unchanged";
  const dominant = r.paths[0];
  const activeEdges = state.transmission.flatMap((row, i) => row.map((v, j) => i !== j && adjusted(state.transmission, i, j) >= state.project.threshold ? 1 : 0)).reduce((a,b)=>a+b,0);
  const possibleEdges = state.risks.length * (state.risks.length - 1);
  el("analysisHealth").textContent = r.paths.length ? "Analysis Completed" : "Review Inputs";
  el("healthDetail").textContent = `${state.risks.length} risks · ${r.paths.length} effective paths`;
  el("dominantPath").textContent = dominant ? dominant.route.map(i => state.risks[i].short).join(" → ") : "None";
  el("dominantContribution").textContent = dominant ? `${fmt(dominant.contribution / r.lambda * 100, 1)}% weighted contribution` : "No path above threshold";
  el("networkDensity").textContent = possibleEdges ? `${fmt(activeEdges / possibleEdges * 100, 0)}%` : "0%";
  el("controlPriority").textContent = dominant ? state.risks[dominant.route[0]].short : "—";
}

function renderRiskList() {
  el("riskList").innerHTML = state.risks.map((risk, i) => `
    <div class="risk-row" style="border-left:4px solid ${risk.color}">
      <i class="risk-list-icon" style="color:${risk.color}" aria-hidden="true">${riskGlyph(risk)}</i>
      <div><strong>${escapeHtml(risk.name)}</strong><small>${i === state.target ? "Target risk" : "Interacting risk"}</small></div>
      <select data-grade="${i}" aria-label="Grade for ${escapeHtml(risk.name)}">
        ${[1,2,3,4].map(g => `<option value="${g}" ${g === risk.grade ? "selected" : ""}>Grade ${roman[g]}</option>`).join("")}
      </select>
      <span class="auto-target-badge ${i === state.target ? "" : "inactive"}" title="Target risk is selected automatically">${i === state.target ? "TARGET" : "AUTO"}</span>
    </div>`).join("");
  document.querySelectorAll("[data-grade]").forEach(node => node.onchange = e => {
    state.risks[+e.target.dataset.grade].grade = +e.target.value; render();
  });
}

function riskGlyph(risk) {
  const name = `${risk.name} ${risk.short}`.toLowerCase();
  if (name.includes("safety")) return "♢";
  if (name.includes("schedule")) return "◷";
  if (name.includes("quality")) return "✓";
  if (name.includes("cost") || name.includes("investment")) return "$";
  return "●";
}

function renderMatrix(hostId, key) {
  const names = state.risks.map(x => x.short);
  el(hostId).innerHTML = `<table class="matrix"><thead><tr><th>From ↓ / To →</th>${names.map(escapeHtml).map(n => `<th>${n}</th>`).join("")}</tr></thead><tbody>${state.risks.map((risk, i) => `<tr><td>${escapeHtml(risk.short)}</td>${state.risks.map((_, j) => i === j
    ? `<td class="locked">1.000</td>`
    : `<td><input type="number" min="0" step="0.001" value="${fmt(state[key][i][j])}" data-matrix="${key}" data-row="${i}" data-col="${j}" aria-label="${key} ${i} to ${j}"></td>`).join("")}</tr>`).join("")}</tbody></table>`;
  el(hostId).querySelectorAll("input").forEach(input => input.onchange = e => {
    const v = Math.max(0, Number(e.target.value) || 0);
    state[e.target.dataset.matrix][+e.target.dataset.row][+e.target.dataset.col] = v;
    render();
  });
}

function renderReadOnlyRiskMatrix(hostId, key) {
  const names = state.risks.map(x => x.short);
  el(hostId).innerHTML = `<table class="matrix"><thead><tr><th>From ↓ / To →</th>${names.map(escapeHtml).map(n => `<th>${n}</th>`).join("")}</tr></thead><tbody>${state.risks.map((risk, i) => `<tr><td>${escapeHtml(risk.short)}</td>${state.risks.map((_, j) => `<td class="readonly">${fmt(adjusted(state[key], i, j))}</td>`).join("")}</tr>`).join("")}</tbody></table><p class="matrix-note">Automatically recalculated whenever a risk grade or original coefficient changes.</p>`;
}

function renderGradeMatrix() {
  el("gradeMatrix").innerHTML = `<table class="matrix"><thead><tr><th>Risk</th>${[1,2,3,4].map(g => `<th>Grade ${roman[g]}</th>`).join("")}</tr></thead><tbody>${state.risks.map(risk => `<tr><td>${escapeHtml(risk.short)}</td>${[1,2,3,4].map(g => `<td class="readonly ${risk.grade === g ? "active-grade" : ""}">${risk.grade === g ? 1 : 0}</td>`).join("")}</tr>`).join("")}</tbody></table><p class="matrix-note">One-hot encoding generated directly from the current Risk Library.</p>`;
}

function renderAdjustmentMatrix() {
  el("adjustmentMatrix").innerHTML = `<table class="matrix"><thead><tr><th>Coupling ↓ / Coupled →</th>${[1,2,3,4].map(g => `<th>Grade ${roman[g]}</th>`).join("")}</tr></thead><tbody>${gradeAdjustment.map((row, i) => `<tr><td>Grade ${roman[i+1]}</td>${row.map(v => `<td class="readonly">${fmt(v,2)}</td>`).join("")}</tr>`).join("")}</tbody></table><p class="matrix-note">Embedded coefficient adjustment matrix from the manuscript. Row = source risk grade; column = affected risk grade.</p>`;
}

function renderPaths(r) {
  el("pathSummary").textContent = `${r.paths.length} paths retained · ΣT = ${fmt(r.paths.reduce((s,x)=>s+x.probability,0))}`;
  el("pathsBody").innerHTML = r.paths.length ? r.paths.map((x, i) => `<tr>
    <td><span class="badge">P${i + 1}</span></td>
    <td>${x.route.map(k => escapeHtml(state.risks[k].short)).join(" → ")}</td>
    <td>${fmt(x.probability)}</td><td>${fmt(x.weight)}</td><td>${fmt(x.amplification)}</td><td><strong>${fmt(x.contribution)}</strong></td>
  </tr>`).join("") : `<tr><td colspan="6">No path meets the current threshold. Lower T₀ or increase transfer coefficients.</td></tr>`;
}

function renderNetwork() {
  const svg = el("networkSvg");
  const n = state.risks.length, cx = 450, cy = 310, radius = n > 6 ? 245 : 225;
  const order = [...Array(n).keys()].filter(i => i !== state.target);
  const pts = Array(n);
  pts[state.target] = {x:cx,y:cy};
  order.forEach((riskIndex, k) => { const angle=-Math.PI/2+k*Math.PI*2/order.length; pts[riskIndex]={x:cx+Math.cos(angle)*radius,y:cy+Math.sin(angle)*radius}; });
  let html = `<defs>
    <filter id="nodeShadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#153765" flood-opacity=".2"/></filter>
    <marker id="transferArrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L0,9 L9,4.5 z" fill="#079f9a"/></marker>
  </defs>`;
  const pairSeen = new Set();
  for (let i=0;i<n;i++) for(let j=i+1;j<n;j++) {
    const c1=adjusted(state.coupling,i,j), c2=adjusted(state.coupling,j,i);
    const a=pts[i], b=pts[j], dx=b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy), nx=-dy/len, ny=dx/len;
    const bend=Math.min(42,len*.12), mx=(a.x+b.x)/2+nx*bend, my=(a.y+b.y)/2+ny*bend;
    const avg=(c1+c2)/2;
    html += `<path d="M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="#7967d5" stroke-width="${Math.max(2,Math.min(7,avg*2.8))}" opacity=".25" data-edge="coupling"><title>Mutual coupling: ${state.risks[i].short} ↔ ${state.risks[j].short}; C=${fmt(c1)}/${fmt(c2)}</title></path>`;
  }
  for (let i=0;i<n;i++) for(let j=0;j<n;j++) if(i!==j && adjusted(state.transmission,i,j) >= state.project.threshold) {
    const a=pts[i], b=pts[j], dx=b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy), ux=dx/len, uy=dy/len, nx=-uy, ny=ux;
    const offset=i<j?9:-9, startR=i===state.target?68:54, endR=j===state.target?74:60;
    const x1=a.x+ux*startR+nx*offset, y1=a.y+uy*startR+ny*offset, x2=b.x-ux*endR+nx*offset, y2=b.y-uy*endR+ny*offset;
    const strength=adjusted(state.transmission,i,j);
    html += `<path d="M ${x1} ${y1} Q ${(x1+x2)/2+nx*18} ${(y1+y2)/2+ny*18} ${x2} ${y2}" fill="none" stroke="#079f9a" stroke-width="${Math.max(1.5,Math.min(4.5,1+strength*6))}" stroke-dasharray="8 6" opacity=".82" marker-end="url(#transferArrow)"><title>Transfer: ${state.risks[i].short} → ${state.risks[j].short}; T=${fmt(strength)}</title></path>`;
  }
  pts.forEach((p,i) => {
    const r=state.risks[i], target=i===state.target, rx=target?78:62, ry=target?68:50;
    html += `<g filter="url(#nodeShadow)"><rect x="${p.x-rx}" y="${p.y-ry}" width="${rx*2}" height="${ry*2}" rx="${target?34:26}" fill="${target?'#1262d6':r.color}" stroke="white" stroke-width="6"/></g>
      <text x="${p.x-rx+18}" y="${p.y-ry+23}" text-anchor="middle" fill="white" font-size="${target?17:14}" font-weight="800">${riskGlyph(r)}</text>
      <text x="${p.x}" y="${p.y-2}" text-anchor="middle" fill="white" font-size="${target?20:16}" font-weight="800">${escapeHtml(r.short)}</text>
      <text x="${p.x}" y="${p.y+23}" text-anchor="middle" fill="white" font-size="12">Grade ${roman[r.grade]}${target?' · TARGET':''}</text>`;
  });
  svg.innerHTML = html;
}

function renderGauge(r) {
  const colors=["#d92727","#ef741c","#f4b51e","#65b842"];
  const center={x:210,y:195}, rad=135;
  const polar = deg => ({x:center.x+rad*Math.cos(deg*Math.PI/180),y:center.y+rad*Math.sin(deg*Math.PI/180)});
  let html="";
  for(let i=0;i<4;i++) { const a=180+i*45,b=a+43,p1=polar(a),p2=polar(b); html+=`<path d="M ${p1.x} ${p1.y} A ${rad} ${rad} 0 0 1 ${p2.x} ${p2.y}" fill="none" stroke="${colors[3-i]}" stroke-width="28"/>`; }
  const normalized=Math.max(0,Math.min(1,(4.5-r.coupled)/4));
  const angle=180+normalized*180, tip={x:center.x+105*Math.cos(angle*Math.PI/180),y:center.y+105*Math.sin(angle*Math.PI/180)};
  html += `<line x1="${center.x}" y1="${center.y}" x2="${tip.x}" y2="${tip.y}" stroke="#111827" stroke-width="7" stroke-linecap="round"/><circle cx="${center.x}" cy="${center.y}" r="12" fill="#111827"/><text x="210" y="232" text-anchor="middle" font-size="25" font-weight="800" fill="#ec6d1f">${roman[r.grade]} · ${gradeNames[r.grade]}</text>`;
  el("gaugeSvg").innerHTML=html;
}

function renderReport(r) {
  const risk=state.risks[state.target];
  const matrixText = (key, corrected=false) => state.risks.map((risk,i)=>`${risk.short}: ${state[key][i].map((v,j)=>corrected?fmt(adjusted(state[key],i,j)):fmt(v)).join("  ")}`).join("\n");
  el("reportText").value = `COUPLED MULTI-RISK ASSESSMENT REPORT\nGenerated: ${new Date().toLocaleString()}\n\n1. PROJECT INFORMATION\nProject: ${state.project.name}\nProject type: ${state.project.type}\nLocation: ${state.project.location}\nAssessment unit: ${state.project.unit}\nTarget risk: ${risk.name}\nMethod: Gradient-variation coupling + upper-tail transfer + effective-path screening\nThreshold T₀: ${state.project.threshold}\nMaximum path nodes: ${state.project.maxDepth}\n\n2. RISK LIBRARY\n${state.risks.map((x,i)=>`${i+1}. ${x.name} | Grade ${roman[x.grade]} (${gradeNames[x.grade]})${i===state.target?' | TARGET':''}`).join("\n")}\n\n3. COUPLING MATRIX C (row = source, column = affected risk)\nColumns: ${state.risks.map(x=>x.short).join("  ")}\n${matrixText("coupling")}\n\n4. TRANSFER MATRIX T (row = source, column = receiving risk)\nColumns: ${state.risks.map(x=>x.short).join("  ")}\n${matrixText("transmission")}\n\n5. EFFECTIVE PROPAGATION PATHS\n${r.paths.map((x,i)=>`${i+1}. ${x.route.map(k=>state.risks[k].short).join(" → ")} | T=${fmt(x.probability)} | p=${fmt(x.weight)} | C=${fmt(x.amplification)} | pC=${fmt(x.contribution)}`).join("\n") || "No effective paths."}\n\n6. COUPLED ASSESSMENT RESULT\nInitial grade: ${roman[r.initial]} (${gradeNames[r.initial]})\nEffective paths: ${r.paths.length}\nOverall amplification factor Λ = Σ(pk × Ck): ${fmt(r.lambda)}\nCoupled numerical value R/Λ: ${fmt(r.coupled)}\nCoupled grade: ${roman[r.grade]} (${gradeNames[r.grade]})\n\n7. MANAGEMENT CONCLUSION\n${r.grade < r.initial ? `The target risk is upgraded by ${r.initial-r.grade} level(s) after multi-risk coupling. Prioritize controls for ${r.paths[0] ? state.risks[r.paths[0].route[0]].name : "upstream risks"} and verify the dominant propagation paths.` : "The target risk grade remains unchanged under the current parameters. Continue routine monitoring and review the model when inputs change."}`;
}

function buildFullReportHtml() {
  const r=calculate(), risk=state.risks[state.target];
  const matrixTable = (key,title,corrected=false) => {
    const table = `<h2>${title}</h2><table><thead><tr><th>From / To</th>${state.risks.map(x=>`<th>${escapeHtml(x.short)}</th>`).join("")}</tr></thead><tbody>${state.risks.map((x,i)=>`<tr><th>${escapeHtml(x.short)}</th>${state[key][i].map((v,j)=>`<td>${corrected?fmt(adjusted(state[key],i,j)):fmt(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    if (corrected) return table;
    return key === "coupling" ? `${table}${gradeTable}${adjustmentTable}${matrixTable("coupling","Adjusted coupling matrix C*",true)}` : `${table}${matrixTable("transmission","Adjusted transfer matrix T*",true)}`;
  };
  const gradeTable = `<h2>Risk grade matrix G</h2><table><tr><th>Risk</th>${[1,2,3,4].map(g=>`<th>Grade ${roman[g]}</th>`).join("")}</tr>${state.risks.map(x=>`<tr><th>${escapeHtml(x.short)}</th>${[1,2,3,4].map(g=>`<td>${x.grade===g?1:0}</td>`).join("")}</tr>`).join("")}</table>`;
  const adjustmentTable = `<h2>Coefficient adjustment matrix A</h2><table><tr><th>Source / Affected</th>${[1,2,3,4].map(g=>`<th>Grade ${roman[g]}</th>`).join("")}</tr>${gradeAdjustment.map((row,i)=>`<tr><th>Grade ${roman[i+1]}</th>${row.map(v=>`<td>${fmt(v,2)}</td>`).join("")}</tr>`).join("")}</table>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(state.project.name)} - Risk Report</title><style>body{font:14px/1.55 Segoe UI,Arial,sans-serif;color:#172033;max-width:1180px;margin:36px auto;padding:0 28px}h1{color:#0b3e91;margin-bottom:4px}h2{margin-top:30px;color:#1262d6;border-bottom:2px solid #dce8f7;padding-bottom:7px}.sub{color:#62708a}.report-actions{position:fixed;right:24px;top:20px}.report-actions button{border:0;border-radius:10px;padding:11px 16px;color:white;background:#1262d6;cursor:pointer;box-shadow:0 8px 20px #1262d633}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:22px 0}.card{padding:16px;border:1px solid #d8e2f0;border-radius:12px}.card b{display:block;font-size:24px;color:#1262d6}.meta{display:grid;grid-template-columns:160px 1fr;gap:7px}.meta dt{color:#62708a}.meta dd{margin:0;font-weight:600}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #d8e2f0;padding:9px;text-align:center}th{background:#f2f6fb}td small{display:block;color:#62708a}.warn{padding:14px 18px;border-left:5px solid #ec6d1f;background:#fff6ed}.footer{margin-top:36px;color:#7b8799;font-size:12px}@media print{body{margin:0;max-width:none}.report-actions{display:none}.summary{break-inside:avoid}h2{break-after:avoid}table{break-inside:auto}tr{break-inside:avoid}}</style></head><body><div class="report-actions"><button onclick="window.print()">Print / Save as PDF</button></div><h1>Coupled Multi-Risk Assessment Report</h1><div class="sub">Complete project export · Generated ${new Date().toLocaleString()}</div><h2>Project information</h2><dl class="meta"><dt>Project</dt><dd>${escapeHtml(state.project.name)}</dd><dt>Project type</dt><dd>${escapeHtml(state.project.type)}</dd><dt>Location</dt><dd>${escapeHtml(state.project.location)}</dd><dt>Assessment unit</dt><dd>${escapeHtml(state.project.unit)}</dd><dt>Target risk</dt><dd>${escapeHtml(risk.name)}</dd><dt>Path threshold</dt><dd>${state.project.threshold}</dd><dt>Maximum path nodes</dt><dd>${state.project.maxDepth}</dd></dl><div class="summary"><div class="card">Initial grade<b>${roman[r.initial]}</b>${gradeNames[r.initial]}</div><div class="card">Coupled grade<b>${roman[r.grade]}</b>${gradeNames[r.grade]}</div><div class="card">Amplification Λ<b>${fmt(r.lambda)}</b>${fmt((r.lambda-1)*100,1)}%</div><div class="card">Effective paths<b>${r.paths.length}</b>T₀=${state.project.threshold}</div></div><h2>Risk library</h2><table><tr><th>No.</th><th>Risk</th><th>Initial grade</th><th>Role</th></tr>${state.risks.map((x,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(x.name)}</td><td>${roman[x.grade]} · ${gradeNames[x.grade]}</td><td>${i===state.target?"Target":"Interacting"}</td></tr>`).join("")}</table>${matrixTable("coupling","Coupling matrix C")}${matrixTable("transmission","Transfer matrix T")}<h2>Effective propagation paths</h2><table><tr><th>No.</th><th>Route</th><th>Probability Tₖ</th><th>Weight pₖ</th><th>Amplification Cₖ</th><th>Contribution pₖCₖ</th></tr>${r.paths.map((x,i)=>`<tr><td>${i+1}</td><td>${x.route.map(k=>escapeHtml(state.risks[k].short)).join(" → ")}</td><td>${fmt(x.probability)}</td><td>${fmt(x.weight)}</td><td>${fmt(x.amplification)}</td><td>${fmt(x.contribution)}</td></tr>`).join("")}</table><h2>Assessment result and management conclusion</h2><div class="warn"><b>${escapeHtml(risk.name)}: Grade ${roman[r.initial]} → Grade ${roman[r.grade]}</b><br>Coupled numerical value: ${fmt(r.coupled)}. ${r.grade<r.initial?`Risk is upgraded by ${r.initial-r.grade} level(s). Prioritize ${r.paths[0]?escapeHtml(state.risks[r.paths[0].route[0]].name):"upstream risk"} and the dominant propagation chain.`:"The grade remains unchanged; continue routine monitoring."}</div><div class="footer">Method basis: directional coupling coefficients, directional transfer coefficients, effective-path screening and path-weighted amplification.</div></body></html>`;
}

function buildReportSummary(language="en") {
  const r=calculate(), target=state.risks[state.target], zh=language==="zh";
  const top=r.paths.slice(0,3).map((x,i)=>`${i+1}. ${x.route.map(k=>state.risks[k].short).join(" → ")} (${fmt(x.contribution/r.lambda*100,1)}%)`).join("\n") || (zh?"无满足阈值的有效路径":"No effective path meets the threshold.");
  return zh
    ? `多风险耦合评估报告摘要\n\n一、项目与方法\n项目：${state.project.name}\n评估单元：${state.project.unit}\n本模型首先根据风险等级和预设优先级自动识别目标风险，再利用风险等级矩阵与论文系数修正矩阵，对专家初始给定的耦合系数和传递系数进行修正。\n\n二、目标风险识别\n自动识别结果：${target.name}（等级 ${roman[target.grade]}）\n判定规则：优先选择风险等级最高的风险；同等级时按照安全、质量、进度、投资、合约、技术、管理、环境、廉政、社会稳定及其他风险的顺序确定。\n\n三、矩阵处理\n报告包含原始耦合矩阵 C0、原始传递矩阵 T0、风险等级矩阵 G、系数修正矩阵 A、修正后耦合矩阵 C* 和修正后传递矩阵 T*。修正公式为 X*ij = X0ij × A(gi, gj)。\n\n四、主要传播路径\n${top}\n\n五、评估结果\n初始等级：${roman[r.initial]}（${gradeNames[r.initial]}）\n耦合后等级：${roman[r.grade]}（${gradeNames[r.grade]}）\n总体放大系数：${fmt(r.lambda)}\n有效路径数量：${r.paths.length}\n\n六、管理建议\n${r.grade<r.initial?`耦合作用使目标风险提升 ${r.initial-r.grade} 个等级。建议优先控制主导上游风险 ${r.paths[0]?state.risks[r.paths[0].route[0]].name:"相关风险"}，并针对贡献率较高的传播路径设置监测与阻断措施。`:"当前参数下目标风险等级未发生提升，建议继续监测关键系数和风险等级变化，并定期复核专家初始输入。"}`
    : `COUPLED MULTI-RISK ASSESSMENT REPORT SUMMARY\n\n1. PROJECT AND METHOD\nProject: ${state.project.name}\nAssessment unit: ${state.project.unit}\nThe model automatically identifies the target risk from severity grade and predefined priority, then applies the risk-grade matrix and manuscript-based adjustment matrix to the expert-supplied coupling and transfer coefficients.\n\n2. TARGET-RISK IDENTIFICATION\nAutomatically selected: ${target.name} (Grade ${roman[target.grade]})\nRule: select the highest-severity grade; ties are resolved by the fixed risk-type priority.\n\n3. MATRIX PROCESSING\nThe report contains original C0 and T0, risk-grade matrix G, coefficient-adjustment matrix A, and adjusted matrices C* and T*. The adjustment is X*ij = X0ij × A(gi, gj).\n\n4. DOMINANT PROPAGATION PATHS\n${top}\n\n5. ASSESSMENT RESULT\nInitial grade: ${roman[r.initial]} (${gradeNames[r.initial]})\nCoupled grade: ${roman[r.grade]} (${gradeNames[r.grade]})\nOverall amplification factor: ${fmt(r.lambda)}\nEffective paths: ${r.paths.length}\n\n6. MANAGEMENT INTERPRETATION\n${r.grade<r.initial?`Coupling upgrades the target risk by ${r.initial-r.grade} level(s). Prioritize the dominant upstream risk ${r.paths[0]?state.risks[r.paths[0].route[0]].name:"identified risk"} and establish monitoring and interruption measures for the highest-contribution paths.`:"The target grade remains unchanged under the current parameters. Continue monitoring key coefficients and risk grades, and periodically review expert inputs."}`;
}

function buildDetailedReportHtml(language="en") {
  const r=calculate(), target=state.risks[state.target], zh=language==="zh";
  const riskName=x=>zh?({"Safety Risk":"安全风险","Quality Risk":"质量风险","Schedule Risk":"进度风险","Investment Risk":"投资风险"}[x.name]||x.name):x.name;
  const matrix=(key,title,corrected=false)=>`<h2>${title}</h2><p>${zh?(corrected?"该矩阵由专家初始系数与等级修正因子逐项相乘得到，并用于后续路径计算。":"该矩阵为专家初步给定的输入数据，可在软件中编辑。"):(corrected?"This matrix is generated by multiplying each expert coefficient by its grade-adjustment factor and is used in path calculations.":"This matrix contains the editable coefficients initially supplied by experts.")}</p><table><tr><th>${zh?"作用风险 / 被作用风险":"From / To"}</th>${state.risks.map(x=>`<th>${escapeHtml(riskName(x))}</th>`).join("")}</tr>${state.risks.map((x,i)=>`<tr><th>${escapeHtml(riskName(x))}</th>${state[key][i].map((v,j)=>`<td>${corrected?fmt(adjusted(state[key],i,j)):fmt(v)}</td>`).join("")}</tr>`).join("")}</table>`;
  const gradeTable=`<h2>${zh?"风险等级矩阵 G":"Risk Grade Matrix G"}</h2><p>${zh?"依据风险库中的当前等级自动生成 one-hot 矩阵。":"Automatically generated as a one-hot matrix from the current Risk Library grades."}</p><table><tr><th>${zh?"风险":"Risk"}</th>${[1,2,3,4].map(g=>`<th>Grade ${roman[g]}</th>`).join("")}</tr>${state.risks.map(x=>`<tr><th>${escapeHtml(riskName(x))}</th>${[1,2,3,4].map(g=>`<td>${x.grade===g?1:0}</td>`).join("")}</tr>`).join("")}</table>`;
  const adjustTable=`<h2>${zh?"系数修正矩阵 A":"Coefficient Adjustment Matrix A"}</h2><p>${zh?"行表示作用风险等级，列表示被作用风险等级；矩阵取自论文模型。":"Rows represent source-risk grades and columns represent affected-risk grades; values follow the manuscript model."}</p><table><tr><th>${zh?"作用 / 被作用":"Source / Affected"}</th>${[1,2,3,4].map(g=>`<th>Grade ${roman[g]}</th>`).join("")}</tr>${gradeAdjustment.map((row,i)=>`<tr><th>Grade ${roman[i+1]}</th>${row.map(v=>`<td>${fmt(v,2)}</td>`).join("")}</tr>`).join("")}</table>`;
  const paths=`<h2>${zh?"有效传播路径及解释":"Effective Propagation Paths and Interpretation"}</h2><p>${zh?`共保留 ${r.paths.length} 条超过阈值 ${state.project.threshold} 的路径。贡献率越高，表示该路径对目标风险耦合放大的作用越显著。`:`${r.paths.length} paths exceed the threshold ${state.project.threshold}. A higher contribution indicates a stronger role in amplifying the target risk.`}</p><table><tr><th>No.</th><th>${zh?"传播路径":"Route"}</th><th>Tk</th><th>pk</th><th>Ck</th><th>${zh?"贡献值":"Contribution"}</th></tr>${r.paths.map((x,i)=>`<tr><td>${i+1}</td><td>${x.route.map(k=>escapeHtml(riskName(state.risks[k]))).join(" → ")}</td><td>${fmt(x.probability)}</td><td>${fmt(x.weight)}</td><td>${fmt(x.amplification)}</td><td>${fmt(x.contribution)}</td></tr>`).join("")}</table>`;
  const conclusion=zh?(r.grade<r.initial?`耦合作用使 ${riskName(target)} 从 Grade ${roman[r.initial]} 提升至 Grade ${roman[r.grade]}。建议优先管控 ${r.paths[0]?riskName(state.risks[r.paths[0].route[0]]):"上游风险"}，重点监测高贡献传播链，并复核相关专家系数。`:`当前参数下 ${riskName(target)} 的等级未提升。建议继续监测风险等级、耦合系数和传递系数，并定期更新专家判断。`):(r.grade<r.initial?`Coupling upgrades ${riskName(target)} from Grade ${roman[r.initial]} to Grade ${roman[r.grade]}. Prioritize ${r.paths[0]?riskName(state.risks[r.paths[0].route[0]]):"the dominant upstream risk"}, monitor high-contribution chains, and review the related expert coefficients.`:`The grade of ${riskName(target)} remains unchanged. Continue monitoring grades and coefficients and periodically update expert judgments.`);
  return `<!doctype html><html lang="${zh?"zh-CN":"en"}"><head><meta charset="utf-8"><title>${zh?"多风险耦合评估报告":"Coupled Multi-Risk Assessment Report"}</title><style>body{font:14px/1.65 ${zh?'"Microsoft YaHei",Arial':'Segoe UI,Arial'},sans-serif;color:#172033;max-width:1180px;margin:34px auto;padding:0 28px}h1{color:#0b3e91;margin-bottom:4px}h2{margin-top:30px;color:#1262d6;border-bottom:2px solid #dce8f7;padding-bottom:7px}p{color:#42516a}.sub{color:#62708a}.actions{position:fixed;right:22px;top:18px}.actions button{border:0;border-radius:9px;padding:11px 15px;color:white;background:#1262d6}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}.card{padding:15px;border:1px solid #d8e2f0;border-radius:12px}.card b{display:block;font-size:23px;color:#1262d6}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #d8e2f0;padding:8px;text-align:center}th{background:#f2f6fb}.note{padding:16px 18px;border-left:5px solid #ec6d1f;background:#fff6ed}.meta{display:grid;grid-template-columns:170px 1fr;gap:7px}.meta dd{margin:0;font-weight:600}@media print{.actions{display:none}body{margin:0;max-width:none}h2{break-after:avoid}tr{break-inside:avoid}}</style></head><body><div class="actions"><button onclick="window.print()">${zh?"打印 / 保存为 PDF":"Print / Save as PDF"}</button></div><h1>${zh?"多风险耦合评估完整报告":"Coupled Multi-Risk Assessment Full Report"}</h1><div class="sub">${zh?"生成时间":"Generated"}: ${new Date().toLocaleString()}</div><h2>${zh?"1. 项目信息与评估方法":"1. Project Information and Method"}</h2><dl class="meta"><dt>${zh?"项目":"Project"}</dt><dd>${escapeHtml(state.project.name)}</dd><dt>${zh?"评估单元":"Assessment unit"}</dt><dd>${escapeHtml(state.project.unit)}</dd><dt>${zh?"路径阈值":"Path threshold"}</dt><dd>${state.project.threshold}</dd><dt>${zh?"自动识别目标风险":"Automatically selected target"}</dt><dd>${escapeHtml(riskName(target))} · Grade ${roman[target.grade]}</dd></dl><p>${zh?"目标风险首先按风险等级确定；如果多个风险处于相同最高等级，则按照安全、质量、进度、投资、合约、技术、管理、环境、廉政、社会稳定及其他风险的优先顺序确定。":"The target is selected first by severity grade. Ties are resolved by the fixed priority: safety, quality, schedule, investment, contract, technical, management, environmental, integrity, social stability and other risks."}</p><div class="summary"><div class="card">${zh?"初始等级":"Initial grade"}<b>${roman[r.initial]}</b>${gradeNames[r.initial]}</div><div class="card">${zh?"耦合后等级":"Coupled grade"}<b>${roman[r.grade]}</b>${gradeNames[r.grade]}</div><div class="card">${zh?"放大系数":"Amplification"}<b>${fmt(r.lambda)}</b></div><div class="card">${zh?"有效路径":"Effective paths"}<b>${r.paths.length}</b></div></div>${matrix("coupling",zh?"2. 原始耦合系数矩阵 C0":"2. Original Coupling Matrix C0")}${matrix("transmission",zh?"3. 原始传递系数矩阵 T0":"3. Original Transfer Matrix T0")}${gradeTable}${adjustTable}${matrix("coupling",zh?"6. 修正后耦合矩阵 C*":"6. Adjusted Coupling Matrix C*",true)}${matrix("transmission",zh?"7. 修正后传递矩阵 T*":"7. Adjusted Transfer Matrix T*",true)}${paths}<h2>${zh?"9. 耦合评估结论与管理建议":"9. Coupled Assessment Conclusion and Management Recommendations"}</h2><div class="note"><b>${escapeHtml(riskName(target))}: Grade ${roman[r.initial]} → Grade ${roman[r.grade]}</b><br>${escapeHtml(conclusion)}</div></body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

const AUTH_KEY = "coupled-risk-demo-auth";
const setAuthenticated = authenticated => {
  document.body.classList.toggle("authenticated", authenticated);
  if (authenticated) requestAnimationFrame(() => el("loginUsername").blur());
  else requestAnimationFrame(() => el("loginUsername").focus());
};
el("loginForm").onsubmit = event => {
  event.preventDefault();
  const valid = el("loginUsername").value.trim() === "test" && el("loginPassword").value === "1234";
  el("loginError").textContent = valid ? "" : "Incorrect username or password.";
  if (valid) { sessionStorage.setItem(AUTH_KEY, "true"); setAuthenticated(true); }
};
el("signOut").onclick = () => {
  sessionStorage.removeItem(AUTH_KEY);
  el("loginPassword").value = "";
  setAuthenticated(false);
};

el("applyProject").onclick = () => {
  state.project = {
    name: el("projectName").value.trim() || demoState.project.name,
    type: el("projectType").value.trim() || "Engineering project",
    location: el("projectLocation").value.trim() || "Not specified",
    unit: el("assessmentUnit").value.trim() || "Assessment unit",
    threshold: Math.max(0, Math.min(1, Number(el("thresholdInput").value) || 0)),
    maxDepth: Math.max(2, Math.min(state.risks.length, Number(el("maxDepthInput").value) || state.risks.length)),
  }; render();
};

el("addRisk").onclick = () => {
  const name = prompt("Risk name (for example: Environmental Risk)");
  if (!name?.trim()) return;
  const n=state.risks.length;
  state.risks.push({name:name.trim(),short:name.trim().replace(/\s+risk$/i,""),grade:4,color:["#d64d8e","#008db8","#7b8d26"][n%3]});
  state.coupling.forEach(row=>row.push(1)); state.coupling.push(Array(n+1).fill(1));
  state.transmission.forEach(row=>row.push(0)); state.transmission.push(Array(n+1).fill(0)); state.transmission[n][n]=0;
  state.project.maxDepth=Math.min(n+1,6); render();
};

el("resetDemo").onclick = () => { if(confirm("Reset all inputs to the paper case-study data?")){ state=clone(demoState); render(); } };
el("printReport").onclick = () => {
  const result=calculate();
  const zhReport=interfaceSettings.reportLanguage === "zh";
  sessionStorage.setItem("coupled-risk-report-visuals", `<h2>${zhReport?"风险相互作用网络":"Risk Interaction Network"}</h2><p>${zhReport?"网络同时展示风险之间的耦合作用与定向传递关系，中心节点为自动识别的目标风险。":"The network combines mutual coupling and directional transfer relations; the central node is the automatically selected target risk."}</p><div class="report-network">${el("networkSvg").outerHTML}</div><h2>${zhReport?"耦合评估结果图":"Coupled Assessment Result"}</h2><p>${zhReport?"仪表盘对比目标风险的初始等级与考虑多风险耦合后的最终等级。":"The gauge compares the target risk's initial grade with its final grade after multi-risk coupling."}</p><div class="report-result"><div>${el("gaugeSvg").outerHTML}</div><dl><dt>${zhReport?"目标风险":"Target risk"}</dt><dd>${escapeHtml(state.risks[state.target].name)}</dd><dt>${zhReport?"初始等级":"Initial grade"}</dt><dd>${roman[result.initial]} · ${gradeNames[result.initial]}</dd><dt>${zhReport?"耦合后等级":"Coupled grade"}</dt><dd>${roman[result.grade]} · ${gradeNames[result.grade]}</dd><dt>${zhReport?"放大系数":"Amplification factor"}</dt><dd>${fmt(result.lambda)}</dd><dt>${zhReport?"耦合数值":"Coupled value"}</dt><dd>${fmt(result.coupled)}</dd></dl></div>`);
  sessionStorage.setItem("coupled-risk-full-report", buildDetailedReportHtml(interfaceSettings.reportLanguage || "en"));
  location.href="./report.html";
};
el("copyReport").onclick = async () => { await navigator.clipboard.writeText(el("reportText").value); el("copyReport").textContent="Copied"; setTimeout(()=>el("copyReport").textContent="Copy Summary",1200); };
document.querySelectorAll(".nav-item").forEach(item => item.onclick = () => { document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active")); item.classList.add("active"); });

el("openSettings").onclick = () => { syncSettingsForm(); el("settingsOverlay").hidden=false; };
el("closeSettings").onclick = () => { el("settingsOverlay").hidden=true; };
el("settingsOverlay").onclick = event => { if(event.target === el("settingsOverlay")) el("settingsOverlay").hidden=true; };
el("saveSettings").onclick = () => {
  interfaceSettings={language:el("languageSetting").value,reportLanguage:el("reportLanguageSetting").value,font:el("fontFamilySetting").value,size:el("fontSizeSetting").value,density:el("densitySetting").value,accent:el("accentSetting").value};
  localStorage.setItem(SETTINGS_KEY,JSON.stringify(interfaceSettings));
  applyInterfaceSettings(); render();
  el("settingsOverlay").hidden=true;
};
el("resetSettings").onclick = () => {
  interfaceSettings={font:"system",size:"1",density:"comfortable",accent:"blue",language:"en",reportLanguage:"en"};
  localStorage.setItem(SETTINGS_KEY,JSON.stringify(interfaceSettings));
  syncSettingsForm(); applyInterfaceSettings(); render();
};
document.addEventListener("keydown",event=>{ if(event.key === "Escape") el("settingsOverlay").hidden=true; });

applyInterfaceSettings();
setAuthenticated(sessionStorage.getItem(AUTH_KEY) === "true");
render();
