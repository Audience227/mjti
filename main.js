// MJTI 引擎与页面逻辑：计分 → 取最高 → 结果页（支持上一题回退）
let current = 0;
let answers = [];   // 每题已选的选项下标，用于回退
let score = {};

function start() {
  current = 0;
  answers = [];
  ROLES.forEach(r => score[r] = 0);
  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[current];
  document.getElementById("q-progress").textContent = `${current + 1} / ${QUESTIONS.length}`;
  document.getElementById("q-bar").style.width = ((current) / QUESTIONS.length * 100) + "%";
  document.getElementById("q-text").textContent = q.q;
  document.getElementById("btn-prev").style.visibility = current === 0 ? "hidden" : "visible";
  const box = document.getElementById("q-options");
  box.innerHTML = "";
  q.o.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "opt";
    btn.textContent = String.fromCharCode(65 + i) + " · " + opt.t;
    btn.onclick = () => answer(i);
    box.appendChild(btn);
  });
}

function answer(i) {
  const q = QUESTIONS[current];
  answers.push(i);
  for (const r in q.o[i].w) score[r] = (score[r] || 0) + q.o[i].w[r];
  current++;
  if (current < QUESTIONS.length) {
    renderQuestion();
  } else {
    showResult(computeResult());
  }
}

function prevQuestion() {
  if (current === 0) return;
  current--;
  const q = QUESTIONS[current];
  const last = answers.pop();
  for (const r in q.o[last].w) score[r] -= q.o[last].w[r];
  renderQuestion();
}

function computeResult() {
  let best = ROLES[0];
  ROLES.forEach(r => { if (score[r] > score[best]) best = r; });
  if (best === "strange") {
    const serious = score.captain + score.iron;
    const funny = score.spider + score.starlord;
    return serious >= funny ? "qi1" : "qi2";
  }
  return best;
}

function showResult(key) {
  const r = RESULTS[key];
  document.getElementById("r-img").src = r.img;
  document.getElementById("r-name").textContent = r.name;
  document.getElementById("r-quote").textContent = r.quote;
  document.getElementById("r-desc").textContent = r.desc;
  // 分享链接带上结果参数
  const link = location.origin + location.pathname + "#r=" + key;
  document.getElementById("r-link").value = link;
  showScreen("result");
  document.getElementById("q-bar").style.width = "100%";
}

function copyLink() {
  const input = document.getElementById("r-link");
  input.select();
  try {
    navigator.clipboard.writeText(input.value).then(() => alert("链接已复制，发给朋友看你的结果"));
  } catch (e) {
    document.execCommand("copy");
    alert("链接已复制");
  }
}

function openSharedResult() {
  const m = location.hash.match(/r=(\w+)/);
  if (m && RESULTS[m[1]]) {
    showResult(m[1]);
    document.getElementById("shared-tip").style.display = "block";
    return true;
  }
  return false;
}

function showScreen(id) {
  document.getElementById("shared-tip").style.display = "none";
  ["home", "quiz", "result"].forEach(s => {
    document.getElementById("screen-" + s).style.display = s === id ? "block" : "none";
  });
}

window.onload = () => {
  if (!openSharedResult()) showScreen("home");
};
