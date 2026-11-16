const key = "mc-render-trace-v1";
const defaults = {version:"1.19.4", step:0, entries:{}};
function readProgress() {
  try { return {...defaults, ...JSON.parse(localStorage.getItem(key))}; }
  catch { return {...defaults, entries:{}}; }
}
const progress = readProgress();
if (!versions.includes(progress.version)) progress.version = defaults.version;
function save() {
  try { localStorage.setItem(key, JSON.stringify(progress)); }
  catch { document.querySelector(".side-foot small").textContent = "浏览器存储不可用，本次记录仅保留到关闭页面。"; }
}
const byId = id => document.getElementById(id);
const pad = n => String(n).padStart(2,"0");
const total = lessons.length;
const numberFromHash = () => /^#step-([1-9])$/.exec(location.hash)?.[1];
const overviewActive = () => location.hash === "#overview";
const reviewActive = () => location.hash === "#review";
const current = () => Number(numberFromHash() || 0) - 1;
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
})[c]);
function entry(i) { return progress.entries[i] ||= {}; }
function renderNav() {
  const mastered = lessons.filter((_, i) => entry(i).mastered).length;
  const doubts = lessons.filter((_, i) => entry(i).doubt).length;
  byId("count").textContent = mastered + " / " + total;
  byId("bar").style.width = (mastered / total * 100) + "%";
  const bar = document.querySelector(".progress");
  bar.setAttribute("aria-valuemax", total);
  bar.setAttribute("aria-valuenow", mastered);
  byId("steps").innerHTML = lessons.map((l,i) => {
    const state = entry(i);
    const badges = (state.mastered ? '<span title="已掌握" aria-label="已掌握">✓</span>' : "") +
      (state.doubt ? '<span title="有疑问" aria-label="有疑问">?</span>' : "");
    return `<a class="navstep" href="#step-${i+1}" ${current()===i&&!reviewActive()?'aria-current="step"':""}>
      <span class="step-index">${pad(i+1)}</span><span>${l.name}</span><span class="navstate">${badges}</span></a>`;
  }).join("");
  byId("review").textContent = "查看疑问 (" + doubts + ")";
  byId("review").setAttribute("aria-pressed", reviewActive());
}
function renderReview() {
  const items = lessons.map((l,i) => ({l,i,state:entry(i)})).filter(x => x.state.doubt);
  byId("lesson").innerHTML = `<h2 class="lesson-title" tabindex="-1">待复习的疑问</h2>
    <p class="lead">打开对应步骤可查看笔记、重做练习或取消疑问标记。</p>
    ${items.length ? items.map(({l,i,state}) => `<section class="notes"><h3><a href="#step-${i+1}">${pad(i+1)} · ${l.name}</a></h3>
      ${state.note ? `<p style="white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(state.note)}</p>` : ""}</section>`).join("") : "<p>目前没有标记疑问的步骤。</p>"}
    <p><a href="#step-${progress.step+1}">返回上次学习的步骤</a></p>`;
}
function renderOverview() {
  const version = progress.version;
  byId("lesson").innerHTML = `<div class="source-head"><h2 class="lesson-title" tabindex="-1">从输入到绘制的整条路径</h2>
    <label for="overview-version">Mojang 映射版本 <select id="overview-version">${versionOptions(version)}</select></label></div>
    <p class="lead">以原版石头、可见区段、solid 渲染层为例。点开步骤可以按实际方法逐个跟踪。</p>
    <ol class="pipeline">${lessons.map((lesson, i) => `<li><a href="#step-${i+1}">${lesson.name}</a>
      ${renderChain(lesson, version)}</li>`).join("")}</ol>`;
  byId("overview-version").onchange = event => {
    progress.version = event.target.value;
    save(); renderOverview(); byId("overview-version").focus();
  };
}
function versionOptions(version) {
  return versions.map(v => `<option ${v===version ? "selected" : ""}>${v}</option>`).join("");
}
function renderChain(lesson, version) {
  const chain = lesson.chains?.[version] || lesson.chain;
  return `<div class="chain" aria-label="调用与数据交接">${chain.map((node, i) =>
    (i ? '<span aria-hidden="true">→</span>' : "") + `<code>${escapeHtml(node)}</code>`).join("")}</div>`;
}
function renderMethods(section, version) {
  const [title, methods] = section;
  const items = methods.filter(row => row.when(version)).map(({id, explanation}) => {
    const [path, signatures] = traceLocations[version][id];
    const label = id.split(":")[0].replaceAll("$", ".");
    return `<li><div><a class="method-name" href="https://mappings.dev/${version}/${path}.html" target="_blank" rel="noopener noreferrer"><code>${escapeHtml(label)}</code> ↗</a>
      <small class="signature">${signatures.map(([signature, lines]) =>
        escapeHtml(signature + (lines ? " · L" + lines : ""))).join(" / ")}</small></div>
      <p>${escapeHtml(explanation)}</p></li>`;
  }).join("");
  return `<section class="method-section"><h3>${escapeHtml(title)}</h3><ol class="method-list">${items}</ol></section>`;
}
function renderLesson(i) {
  const lesson = lessons[i], state = entry(i);
  const v = progress.version, vi = versions.indexOf(v);
  const trace = traces[i];
  const sources = lesson.versionSources?.[v] || lesson.sources;
  const code = lesson.examples?.[v] || lesson.code;
  const sourceLinks = sources.map(([name,path]) => `<span><a href="https://mappings.dev/${v}/${path}.html" target="_blank" rel="noopener noreferrer">${escapeHtml(name)} ↗</a><small>${escapeHtml(locations[v][i][path] || "")}</small></span>`).join("");
  byId("lesson").innerHTML = `
    <div class="lesson-top"><span class="tag">步骤 ${pad(i+1)} / ${pad(total)} · ${lesson.phase}</span><div class="actions">
      <button id="master" type="button" aria-pressed="${!!state.mastered}"></button><button id="doubt" type="button" aria-pressed="${!!state.doubt}"></button>
    </div></div>
    <h2 class="lesson-title" tabindex="-1">${lesson.title}</h2><p class="lead">${lesson.lead}</p>
    ${renderChain(lesson, v)}
    <details data-part="detail" open><summary>逐个方法追踪</summary><div>
      <p>${lesson.detail}</p>${trace.sections.map(section => renderMethods(section, v)).join("")}
      ${trace.side ? `<details class="side-trace"><summary>${escapeHtml(trace.side[0])}</summary><div>${renderMethods(trace.side, v)}</div></details>` : ""}
    </div></details>
    <details data-part="source" open><summary>源码位置与版本差异</summary><div>
    <div class="source-head"><label for="version">Mojang 映射版本</label><select id="version">${versionOptions(v)}</select></div>
    <p id="diff">${lesson.diff[vi]}</p><div class="source-links">${sourceLinks}</div>
    <p class="subtle"><small>链接用于核对类名和签名。行号来自 Mojang 客户端映射，IDEA 反编译后的行号可能不同，可按方法名定位。</small></p>
    </div></details>
    <details data-part="code"><summary>Java 示例</summary><div><small>节选式示例。上下文变量与必要的原版逻辑已省略。</small><pre tabindex="0"><code>${escapeHtml(code)}</code></pre></div></details>
    <section class="notes" id="notes" hidden><h3><label for="note">疑问笔记</label></h3><textarea id="note" maxlength="3000" placeholder="记下想回源码验证的问题"></textarea></section>
    <form class="quiz" id="quiz"><h3>理解题</h3><fieldset><legend>${lesson.q}</legend>
    ${lesson.choices.map((choice,j) => `<label><input type="radio" name="choice" value="${j}" required ${state.choice===j?"checked":""}> <span>${choice}</span></label>`).join("")}
    </fieldset><div class="actions"><button class="primary" type="submit">检查答案</button><button id="retry" type="button">重新练习</button>
    <small id="attempts"></small></div><p class="feedback" id="feedback" role="status"></p></form>
    <div class="pager"><button id="prev" ${i===0?"disabled":""}>← 上一步</button><button id="next" ${i===total-1?"disabled":""}>下一步 →</button></div>`;
  const paintState = () => {
    for (const [id, prop, off, on] of [["master","mastered","标记已掌握","✓ 已掌握"],["doubt","doubt","标记疑问","? 已标疑问"]]) {
      const button = byId(id);
      button.textContent = state[prop] ? on : off;
      button.setAttribute("aria-pressed", !!state[prop]);
      button.classList.toggle("selected", !!state[prop]);
    }
    byId("notes").hidden = !state.doubt;
  };
  const paintQuiz = () => {
    byId("attempts").textContent = state.attempts ? "已作答 " + state.attempts + " 次" : "";
    const feedback = byId("feedback");
    const correct = state.choice === lesson.answer;
    feedback.classList.toggle("wrong", state.choice != null && !correct);
    feedback.textContent = state.choice == null ? "" :
      correct ? "答对了。 " + lesson.why : "这次选错了。 " + lesson.why + " 可以重新练习。";
    byId("quiz").querySelectorAll("input, button[type=submit]").forEach(el => el.disabled = state.choice != null);
  };
  paintState(); paintQuiz();
  byId("note").value = state.note || "";
  byId("note").oninput = event => { state.note = event.target.value; save(); };
  byId("master").onclick = () => { state.mastered = !state.mastered; save(); paintState(); renderNav(); };
  byId("doubt").onclick = () => {
    state.doubt = !state.doubt; save(); paintState(); renderNav();
    if (state.doubt) byId("note").focus();
  };
  byId("quiz").onsubmit = event => {
    event.preventDefault();
    const answer = new FormData(event.target).get("choice");
    if (answer === null || state.choice != null) return;
    state.choice = Number(answer); state.attempts = (state.attempts || 0) + 1;
    save(); paintQuiz(); byId("retry").focus();
  };
  byId("retry").onclick = () => {
    delete state.choice;
    byId("quiz").querySelectorAll("input").forEach(input => input.checked = false);
    save(); paintQuiz(); byId("quiz").querySelector("input").focus();
  };
  byId("version").onchange = event => {
    const open = [...document.querySelectorAll("details")].map(x => x.open);
    progress.version = event.target.value; save(); renderLesson(i);
    document.querySelectorAll("details").forEach((x,j) => x.open = open[j]);
    byId("version").focus();
  };
  byId("prev").onclick = () => location.hash = "step-" + i;
  byId("next").onclick = () => location.hash = "step-" + (i+2);
}
function show(focus) {
  if (reviewActive()) renderReview();
  else if (overviewActive()) renderOverview();
  else {
    const i = Math.max(0, current());
    progress.step = i; save(); renderLesson(i);
  }
  renderNav();
  if (focus) {
    document.querySelector(".lesson-title").focus({preventScroll:true});
    byId("lesson").scrollIntoView({block:"start"});
  }
}
if (!reviewActive() && !overviewActive() && current() < 0) {
  const i = Number.isInteger(progress.step) && progress.step >= 0 && progress.step < total ? progress.step : 0;
  history.replaceState(null, "", "#step-" + (i+1));
}
byId("review").onclick = () => location.hash = reviewActive() ? "step-" + (progress.step+1) : "review";
window.addEventListener("hashchange", () => show(true));
show(false);
