const STORAGE_KEY = "farmVillageScenarioDraftV4";
const originalScenario = window.FARM_VILLAGE_SCENARIO;
const publishedScenario = loadPublishedScenario();
const draftScenario = publishedScenario || loadDraft();
const scenario = repairScenarioLinks(migrateDiningRoute(normalizeScenarioNames(migrateAssetPaths(draftScenario ? mergeScenarioDraft(structuredClone(originalScenario), draftScenario) : structuredClone(originalScenario)))));
if(draftScenario && !publishedScenario) saveDraft();
const state = { nodeId: scenario.start, background: "field", quest: "intro", progress: 0, affection: {}, flags: {}, log: [], auto: false, tab: "log", editorTab: "scene", title: true, dialoguePage: 0, appliedEffects: new Set(), characters: [] };
const els = {
  backdrop: document.getElementById("backdrop"), backdropFill: document.getElementById("backdropFill"), characters: document.getElementById("characterLayer"), questTitle: document.getElementById("questTitle"), questProgress: document.getElementById("questProgress"), affection: document.getElementById("affectionPanel"),
  speaker: document.getElementById("speaker"), line: document.getElementById("line"), choices: document.getElementById("choices"), next: document.getElementById("nextButton"), auto: document.getElementById("autoButton"), log: document.getElementById("logButton"), reset: document.getElementById("resetButton"),
  panel: document.getElementById("logPanel"), closeLog: document.getElementById("closeLogButton"), panelContent: document.getElementById("panelContent"), editorBody: document.getElementById("editorBody"), playCurrent: document.getElementById("playCurrentButton"),
  titleScreen: document.getElementById("titleScreen"), titleArt: document.getElementById("titleArt"), start: document.getElementById("startButton"), dialogue: document.querySelector(".dialogue")
};
const isPublishMode = new URLSearchParams(window.location.search).has("publish") || window.location.hash.includes("publish");
document.body.classList.toggle("publish-mode", isPublishMode);
let autoTimer = null;
function mergeScenarioDraft(base, draft){
  return {
    ...base,
    ...draft,
    start: draft.start || base.start,
    assets: {
      backgrounds: { ...(base.assets?.backgrounds || {}), ...(draft.assets?.backgrounds || {}) },
      characters: { ...(base.assets?.characters || {}), ...(draft.assets?.characters || {}) }
    },
    characters: { ...(base.characters || {}), ...(draft.characters || {}) },
    quests: { ...(base.quests || {}), ...(draft.quests || {}) },
    nodes: draft.nodes ? { ...draft.nodes } : { ...(base.nodes || {}) }
  };
}
function loadPublishedScenario(){
  const searchData = new URLSearchParams(window.location.search).get("data");
  const hashData = new URLSearchParams(String(window.location.hash || "").replace(/^#/, "")).get("data");
  const data = searchData || hashData;
  if(!data) return null;
  try { return decodeScenarioFromUrl(data); }
  catch { return null; }
}
function encodeScenarioForUrl(value){
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach(function(byte){ binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function decodeScenarioFromUrl(value){
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for(let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}
function rewriteNodeReferences(node, idMap){
  if(node.next && idMap[node.next]) node.next = idMap[node.next];
  (node.choices || []).forEach(function(choice){ if(choice.next && idMap[choice.next]) choice.next = idMap[choice.next]; });
}
function reindexScenarioCopy(source){
  const copy = structuredClone(source);
  const ids = Object.keys(copy.nodes || {});
  const idMap = {};
  ids.forEach(function(id, index){ idMap[id] = "scene_" + String(index + 1).padStart(3, "0"); });
  const nodes = {};
  ids.forEach(function(oldId){
    const newId = idMap[oldId];
    const node = copy.nodes[oldId];
    rewriteNodeReferences(node, idMap);
    nodes[newId] = node;
  });
  copy.nodes = nodes;
  copy.start = idMap[copy.start] || Object.keys(nodes)[0] || copy.start;
  return { scenario: copy, idMap: idMap };
}
function publishedUrl(){
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("publish", "1");
  const hashParams = new URLSearchParams();
  hashParams.set("data", encodeScenarioForUrl(reindexScenarioCopy(scenario).scenario));
  url.hash = hashParams.toString();
  return url.toString();
}
function openPublishedView(){
  window.open(publishedUrl(), "_blank", "popup,width=430,height=760,resizable=yes,scrollbars=no");
}
async function copyPublishedLink(){
  await navigator.clipboard.writeText(publishedUrl());
  showToast("결과 공유 링크를 복사했습니다.");
}
function normalizeSpeakerName(name){
  const value = String(name || "").trim();
  if(!value) return "";
  return value.replace(/^로드(?=$|\s|\()/, "주인공");
}
function speakerCharacterId(speaker){
  const name = normalizeSpeakerName(speaker);
  if(!name) return "";
  if(name.startsWith("주인공")) return "lord";
  const plainName = name.replace(/\s*\(.+?\)\s*$/, "");
  const found = Object.entries(scenario.characters || {}).find(function(pair){
    const id = pair[0];
    const characterName = pair[1]?.name || "";
    return id === plainName || characterName === plainName || plainName.startsWith(characterName + "(");
  });
  return found ? found[0] : "";
}
function normalizeScenarioNames(target){
  if(target?.characters?.lord){
    target.characters.lord.name = "주인공";
    target.characters.lord.note = (target.characters.lord.note || "").replace(/로드/g, "주인공");
  }
  Object.values(target?.nodes || {}).forEach(function(node){
    node.speaker = normalizeSpeakerName(node.speaker);
  });
  return target;
}
function ensureEffect(node, effect){
  node.effects = node.effects || [];
  const exists = node.effects.some(function(item){ return item.type === effect.type && item.key === effect.key && item.character === effect.character; });
  if(!exists) node.effects.push(effect);
}
function migrateDiningRoute(target){
  const nodes = target?.nodes || {};
  if(nodes.intro_001) nodes.intro_001.bg = "field";
  if(nodes.dining_003){
    nodes.dining_003.next = "food_problem";
    delete nodes.dining_003.autoNextWhenChoicesDone;
    nodes.dining_003.choices = [
      { text: "맥스에게 말을 건다", next: "meet_max", hideIfFlag: "met_max" },
      { text: "갈리온에게 말을 건다", next: "meet_gallion", hideIfFlag: "met_gallion" },
      { text: "세바스찬에게 말을 건다", next: "meet_sebastian", hideIfFlag: "met_sebastian" }
    ];
  }
  if(nodes.meet_max) ensureEffect(nodes.meet_max, { type: "flag", key: "met_max", value: true });
  if(nodes.meet_gallion) ensureEffect(nodes.meet_gallion, { type: "flag", key: "met_gallion", value: true });
  if(nodes.meet_sebastian) ensureEffect(nodes.meet_sebastian, { type: "flag", key: "met_sebastian", value: true });
  if(nodes.meet_max_002) nodes.meet_max_002.next = "dining_003";
  if(nodes.meet_gallion_002) nodes.meet_gallion_002.next = "dining_003";
  if(nodes.meet_sebastian_002) nodes.meet_sebastian_002.next = "dining_003";
  return target;
}
function migrateAssetPaths(target){
  const replacements = {
    './assets/char-liddy.png': './assets/char-liddy-cutout.png',
    './assets/char-ethan.png': './assets/char-ethan-cutout.png',
    './assets/char-lord.png': './assets/char-lord-sheet.png',
    './assets/char-liddy-cutout.png': './assets/char-liddy-sheet.png',
    './assets/char-ethan-cutout.png': './assets/char-ethan-sheet.png',
    './assets/char-lord-cutout.png': './assets/char-lord-sheet.png',
    './assets/bg-field.png': './assets/bg-isometric-farm.png'
  };
  if(target?.assets?.characters){
    Object.keys(target.assets.characters).forEach(function(id){
      const value = target.assets.characters[id];
      if(replacements[value]) target.assets.characters[id] = replacements[value];
    });
  }
  if(target?.assets?.backgrounds){
    Object.keys(target.assets.backgrounds).forEach(function(id){
      const value = target.assets.backgrounds[id];
      if(replacements[value]) target.assets.backgrounds[id] = replacements[value];
    });
  }
  if(target?.assets?.characters){
    target.assets.characters.lord = "./assets/char-lord-sheet.png";
    target.assets.characters.liddy = "./assets/char-liddy-sheet.png";
    target.assets.characters.max = "./assets/char-max-sheet.png";
    target.assets.characters.gallion = "./assets/char-gallion-sheet.png";
    target.assets.characters.sebastian = "./assets/char-sebastian-sheet.png";
    target.assets.characters.ethan = "./assets/char-ethan-sheet.png";
  }
  if(target?.nodes){
    if(target.nodes.meet_max) target.nodes.meet_max.characters = [{ id: "lord", position: "left" }, { id: "max", position: "right" }];
    if(target.nodes.meet_max_002) target.nodes.meet_max_002.characters = [{ id: "lord", position: "left" }, { id: "max", position: "right" }];
    if(target.nodes.meet_gallion) target.nodes.meet_gallion.characters = [{ id: "lord", position: "left" }, { id: "gallion", position: "right" }];
    if(target.nodes.meet_gallion_002) target.nodes.meet_gallion_002.characters = [{ id: "lord", position: "left" }, { id: "gallion", position: "right" }];
    if(target.nodes.meet_sebastian) target.nodes.meet_sebastian.characters = [{ id: "lord", position: "left" }, { id: "sebastian", position: "right" }];
    if(target.nodes.meet_sebastian_002) target.nodes.meet_sebastian_002.characters = [{ id: "lord", position: "left" }, { id: "sebastian", position: "right" }];
    if(target.nodes.contract_sword) target.nodes.contract_sword.characters = [{ id: "sebastian", position: "left" }, { id: "ethan", position: "right" }];
  }
  if(!target.titleImage) target.titleImage = "./assets/title-farm-village.png";
  return target;
}
function findNodeIdLoose(id){
  if(!id) return "";
  if(scenario?.nodes?.[id]) return id;
  const lower = String(id).toLowerCase();
  return Object.keys(scenario?.nodes || {}).find(function(nodeId){ return nodeId.toLowerCase() === lower; }) || "";
}
function nextExistingNodeIdAfter(missingId, nodes){
  const match = String(missingId || "").match(/^(.*?)(\d+)([a-z]?)$/i);
  if(!match) return "";
  const prefix = match[1];
  const startNum = Number(match[2]);
  const width = match[2].length;
  for(let n = startNum + 1; n < startNum + 100; n++){
    const candidate = prefix + String(n).padStart(width, "0");
    if(nodes[candidate]) return candidate;
  }
  return "";
}
function repairScenarioLinks(target){
  const nodes = target?.nodes || {};
  Object.values(nodes).forEach(function(node){
    if(node.next && !nodes[node.next]){
      const loose = Object.keys(nodes).find(function(id){ return id.toLowerCase() === String(node.next).toLowerCase(); });
      const inferred = loose || nextExistingNodeIdAfter(node.next, nodes);
      if(inferred) node.next = inferred;
      else delete node.next;
    }
    (node.choices || []).forEach(function(choice){
      if(choice.next && !nodes[choice.next]){
        const loose = Object.keys(nodes).find(function(id){ return id.toLowerCase() === String(choice.next).toLowerCase(); });
        const inferred = loose || nextExistingNodeIdAfter(choice.next, nodes);
        if(inferred) choice.next = inferred;
        else choice.next = "";
      }
    });
  });
  if(target.start && !nodes[target.start]) target.start = Object.keys(nodes)[0] || target.start;
  return target;
}
function loadDraft(){ try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }
function saveDraft(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(scenario)); }
function currentNode(){ return scenario.nodes[state.nodeId]; }
function nodeIds(){ return Object.keys(scenario.nodes); }
function bgIds(){ return Object.keys(scenario.assets.backgrounds); }
function charIds(){ return Object.keys(scenario.characters); }
function questIds(){ return Object.keys(scenario.quests); }
function clear(el){ while(el.firstChild) el.removeChild(el.firstChild); }
function make(tag, className, text){ const el = document.createElement(tag); if(className) el.className = className; if(text != null) el.textContent = text; return el; }
function field(labelText, input){ const wrap = make("label", "field"); wrap.appendChild(make("span", "", labelText)); wrap.appendChild(input); return wrap; }
function instantField(labelText, control){ const wrap = field(labelText, control); wrap.classList.add("instant-field"); wrap.appendChild(make("small", "instant-status", "변경 즉시 저장")); return wrap; }
function bindTextInput(el, onInput){
  let composing = false;
  el.addEventListener("compositionstart", function(){ composing = true; });
  el.addEventListener("compositionend", function(){ composing = false; onInput(el.value); });
  el.addEventListener("input", function(event){ if(composing || event.isComposing) return; onInput(el.value); });
}
function input(value, onInput, type){ const el = document.createElement("input"); el.type = type || "text"; el.value = value || ""; bindTextInput(el, onInput); return el; }
function textarea(value, onInput){ const el = document.createElement("textarea"); el.rows = 5; el.value = value || ""; bindTextInput(el, onInput); return el; }
function draftTextField(labelText, multiline, value, onApply){
  const wrap = make("div", "field apply-field");
  const label = make("span", "", labelText);
  const control = document.createElement(multiline ? "textarea" : "input");
  if(multiline) control.rows = 7;
  else control.type = "text";
  control.value = value || "";
  const actions = make("div", "apply-actions");
  const status = make("span", "apply-status", "수정 후 버튼을 누르면 저장됩니다");
  const apply = button(labelText + " 수정 완료", function(){
    onApply(control.value);
    status.textContent = "저장됨";
    apply.disabled = true;
    wrap.classList.remove("dirty");
    showToast(labelText + " 수정 완료");
  });
  apply.className = "primary-apply-button";
  apply.disabled = true;
  control.addEventListener("input", function(){
    const dirty = control.value !== (value || "");
    apply.disabled = !dirty;
    status.textContent = dirty ? "저장 전 변경 있음" : "저장됨";
    wrap.classList.toggle("dirty", dirty);
  });
  control.addEventListener("keydown", function(event){
    if((event.ctrlKey || event.metaKey) && event.key === "Enter" && !apply.disabled){
      event.preventDefault();
      apply.click();
    }
  });
  actions.appendChild(apply);
  actions.appendChild(status);
  wrap.appendChild(label);
  wrap.appendChild(control);
  wrap.appendChild(actions);
  return wrap;
}
function select(values, selected, onChange, emptyLabel){ const el = document.createElement("select"); if(emptyLabel !== undefined){ const opt = document.createElement("option"); opt.value = ""; opt.textContent = emptyLabel; el.appendChild(opt); } values.forEach(function(v){ const opt = document.createElement("option"); opt.value = v; opt.textContent = v; opt.selected = v === selected; el.appendChild(opt); }); el.addEventListener("change", function(){ onChange(el.value); }); return el; }
function button(text, onClick){ const el = document.createElement("button"); el.type = "button"; el.textContent = text; el.addEventListener("click", onClick); return el; }
function updateNode(mutator){ mutator(currentNode()); repairScenarioLinks(scenario); saveDraft(); closePanel(); // force-start-closed
render(); }
function setNodeField(fieldName, value){ updateNode(function(node){ if(value === "" && ["bg", "quest", "next"].includes(fieldName)) delete node[fieldName]; else if(fieldName === "progress") node[fieldName] = Number(value || 0); else if(fieldName === "next") node[fieldName] = findNodeIdLoose(value) || value; else if(fieldName === "speaker") node[fieldName] = normalizeSpeakerName(value); else node[fieldName] = value; }); }
function setCurrentNode(id){ state.nodeId = id; state.dialoguePage = 0; playCurrent(); }
function reindexEditorSceneIds(){
  const currentId = state.nodeId;
  const result = reindexScenarioCopy(scenario);
  scenario.nodes = result.scenario.nodes;
  scenario.start = result.scenario.start;
  state.nodeId = result.idMap[currentId] || scenario.start;
  state.dialoguePage = 0;
  repairScenarioLinks(scenario);
  saveDraft();
  closePanel();
  render();
  showToast("장면 ID를 scene_001부터 정리했습니다.");
}
function render(){ const node = currentNode(); if(!node) return; if(node.bg) state.background = node.bg; if(node.quest) state.quest = node.quest; if(typeof node.progress === "number") state.progress = node.progress; if(node.characters) state.characters = structuredClone(node.characters); renderBackground(); renderTitleScreen(); renderCharacters(); renderDialogue(node); if(!state.title) applyEffects(node); renderHud(); renderPanel(); if(!isPublishMode) renderEditor(); scheduleAuto(); }
function renderBackground(){
  const bg = scenario.assets.backgrounds[state.background] || "";
  if(els.backdropFill && els.backdropFill.getAttribute("src") !== bg) els.backdropFill.src = bg;
  if(els.backdrop.getAttribute("src") !== bg){
    els.backdrop.classList.remove("loaded");
    els.backdrop.src = bg;
  }
}
function renderTitleScreen(){
  document.body.classList.toggle("title-active", !!state.title);
  if(els.titleScreen) els.titleScreen.hidden = !state.title;
  if(els.titleArt && scenario.titleImage && els.titleArt.getAttribute("src") !== scenario.titleImage) els.titleArt.src = scenario.titleImage;
}
function startGame(){ state.title = false; closePanel(); render(); }
function renderCharacters(){ clear(els.characters); const activeId = speakerCharacterId(currentNode()?.speaker); const hasFocus = state.characters.length > 1 && state.characters.some(function(item){ return item.id === activeId; }); state.characters.forEach(function(item){ const src = scenario.assets.characters[item.id]; if(!src) return; const img = make("img", "character " + (item.position || "center")); if(hasFocus) img.classList.add(item.id === activeId ? "is-speaking" : "is-dimmed"); img.src = src; img.alt = scenario.characters[item.id]?.name || item.id; els.characters.appendChild(img); }); }
function dialoguePages(text){
  const normalized = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").map(function(line){ return line.trim(); }).filter(Boolean);
  if(!lines.length) return [""];
  const pages = [];
  for(let i = 0; i < lines.length; i += 3) pages.push(lines.slice(i, i + 3).join("\n"));
  return pages;
}
function isLastDialoguePage(node){
  const pages = dialoguePages(node?.text || "");
  return state.dialoguePage >= pages.length - 1;
}
function choiceIsVisible(choice){
  if(choice.hideIfFlag && state.flags[choice.hideIfFlag]) return false;
  if(choice.requireFlags && !choice.requireFlags.every(function(flag){ return state.flags[flag]; })) return false;
  return true;
}
function visibleChoices(node){
  return (node?.choices || []).filter(choiceIsVisible);
}
function shouldAutoAdvanceChoicesDone(node){
  return !!(node?.autoNextWhenChoicesDone && node.next && (node.choices || []).length && !visibleChoices(node).length && isLastDialoguePage(node));
}
function renderDialogue(node){
  const pages = dialoguePages(node.text || "");
  if(state.dialoguePage >= pages.length) state.dialoguePage = Math.max(0, pages.length - 1);
  const isLastPage = state.dialoguePage >= pages.length - 1;
  els.speaker.textContent = normalizeSpeakerName(node.speaker) || "";
  els.line.textContent = pages[state.dialoguePage] || "";
  els.line.dataset.page = pages.length > 1 ? String(state.dialoguePage + 1) + " / " + String(pages.length) : "";
  els.next.classList.toggle("has-more-lines", !isLastPage);
  els.next.title = isLastPage ? "다음 장면" : "다음 대사";
  clear(els.choices);
  const choices = visibleChoices(node);
  const hasChoices = isLastPage && choices.length > 0;
  if(els.dialogue) els.dialogue.classList.toggle("has-visible-choices", hasChoices);
  if(!isLastPage) return;
  choices.forEach(function(choice){ const c = make("button", "choice", choice.text || "선택지"); c.type = "button"; c.addEventListener("click", function(){ selectChoice(choice); }); els.choices.appendChild(c); });
}
function renderHud(){ const quest = scenario.quests[state.quest]; els.questTitle.textContent = quest ? quest.title : "-"; const max = Math.max(((quest && quest.steps) ? quest.steps.length : 1) - 1, 1); els.questProgress.style.width = Math.min(100, (state.progress / max) * 100) + "%"; clear(els.affection); Object.entries(scenario.characters).forEach(function(pair){ const id = pair[0]; const ch = pair[1]; const item = make("div", "affection-item"); item.appendChild(make("span", "", ch.name)); item.appendChild(make("strong", "", String(state.affection[id] || 0))); els.affection.appendChild(item); }); }
function applyEffects(node){ if(!node.effects) return; const key = state.nodeId + ":" + JSON.stringify(node.effects); if(state.appliedEffects.has(key)) return; state.appliedEffects.add(key); node.effects.forEach(function(effect){ if(effect.type === "affection"){ state.affection[effect.character] = (state.affection[effect.character] || 0) + Number(effect.amount || 0); showToast(effect.label || "호감도 변경"); } if(effect.type === "quest"){ state.quest = effect.quest || state.quest; state.progress = Number(effect.step || 0); showToast(effect.label || "퀘스트 진행 변경"); } if(effect.type === "flag"){ state.flags[effect.key] = effect.value !== false; } }); }
function selectChoice(choice){ clearAuto(); if(!isLastDialoguePage(currentNode())) return; if(choice.reset) resetGame(); if(choice.action === "openLog") openPanel("log"); if(choice.next && !choice.reset) goTo(choice.next); }
function next(){ if(state.title){ startGame(); return; } const node = currentNode(); if(!node) return; const pages = dialoguePages(node.text || ""); if(state.dialoguePage < pages.length - 1){ state.dialoguePage += 1; render(); return; } if(visibleChoices(node).length) return; if(node.next) goTo(node.next); }
function goTo(id){ const targetId = findNodeIdLoose(id); if(!targetId){ showToast("이동할 장면을 찾을 수 없습니다: " + id); repairScenarioLinks(scenario); saveDraft(); render(); return; } const node = currentNode(); if(node) state.log.push({ speaker: normalizeSpeakerName(node.speaker) || "", text: node.text || "" }); state.nodeId = targetId; state.dialoguePage = 0; render(); }
function resetGame(){ state.nodeId = scenario.start; state.background = "field"; state.quest = "intro"; state.progress = 0; state.affection = {}; state.flags = {}; state.log = []; state.title = true; state.dialoguePage = 0; state.appliedEffects = new Set(); state.characters = []; render(); }
function playCurrent(){ const node = currentNode(); state.title = false; state.dialoguePage = 0; state.background = node.bg || state.background; state.quest = node.quest || state.quest; state.progress = typeof node.progress === "number" ? node.progress : state.progress; state.characters = structuredClone(node.characters || []); state.appliedEffects = new Set(); render(); }
function openPanel(tab){ state.tab = tab || state.tab; els.panel.style.display = "block"; els.panel.style.visibility = "visible"; els.panel.style.pointerEvents = "auto"; els.panel.classList.add("open"); renderPanel(); }
function closePanel(){ if(els.panel){ els.panel.classList.remove("open"); els.panel.style.display = "none"; els.panel.style.visibility = "hidden"; els.panel.style.pointerEvents = "none"; } }
function togglePanel(tab){ if(els.panel.classList.contains("open") && (!tab || state.tab === tab)){ closePanel(); return; } openPanel(tab); }
function renderPanel(){ document.querySelectorAll(".tabs button").forEach(function(b){ b.classList.toggle("active", b.dataset.tab === state.tab); }); clear(els.panelContent); if(state.tab === "log"){ if(!state.log.length) els.panelContent.appendChild(make("article", "info-entry", "아직 기록된 대화가 없습니다.")); state.log.forEach(function(entry){ const a = make("article", "log-entry"); a.appendChild(make("strong", "", entry.speaker)); a.appendChild(make("span", "", entry.text)); els.panelContent.appendChild(a); }); } if(state.tab === "quests"){ Object.entries(scenario.quests).forEach(function(pair){ const id = pair[0]; const q = pair[1]; const a = make("article", "info-entry"); a.appendChild(make("strong", "", q.title)); a.appendChild(make("span", "", q.steps.map(function(s, i){ return ((id === state.quest && i <= state.progress) ? "✓ " : "· ") + s; }).join("\\n"))); els.panelContent.appendChild(a); }); } if(state.tab === "characters"){ Object.entries(scenario.characters).forEach(function(pair){ const id = pair[0]; const ch = pair[1]; const a = make("article", "info-entry"); a.appendChild(make("strong", "", ch.name + " · 호감도 " + (state.affection[id] || 0))); a.appendChild(make("span", "", ch.note)); els.panelContent.appendChild(a); }); } }
function switchEditorTab(tabName){
  state.editorTab = tabName;
  renderEditor();
}
function renderEditor(){ document.querySelectorAll(".editor-tabs button").forEach(function(b){ b.classList.toggle("active", b.dataset.editorTab === state.editorTab); }); clear(els.editorBody); if(state.editorTab === "scene") renderSceneEditor(); if(state.editorTab === "branch") renderBranchEditor(); if(state.editorTab === "stats") renderStatsEditor(); if(state.editorTab === "assets") renderAssetEditor(); if(state.editorTab === "export") renderExportEditor(); }
function renderSceneEditor(){
  const node = currentNode();
  els.editorBody.appendChild(field("장면 ID", select(nodeIds(), state.nodeId, setCurrentNode)));
  const row = make("div", "button-row");
  row.appendChild(button("장면 추가", addNode));
  row.appendChild(button("다음에 삽입", insertNodeAfter));
  row.appendChild(button("복제", duplicateNode));
  row.appendChild(button("삭제", removeNode));
  row.appendChild(button("장면 ID 정리", reindexEditorSceneIds));
  els.editorBody.appendChild(row);
  els.editorBody.appendChild(draftTextField("화자", false, node.speaker || "", function(v){ setNodeField("speaker", v); }));
  els.editorBody.appendChild(draftTextField("대사", true, node.text || "", function(v){ setNodeField("text", v); }));
  const two = make("div", "two-col");
  two.appendChild(instantField("배경", select(bgIds(), node.bg || "", function(v){ setNodeField("bg", v); }, "없음")));
  two.appendChild(instantField("다음 장면", select(nodeIds(), node.next || "", function(v){ setNodeField("next", v); }, "없음")));
  els.editorBody.appendChild(two);
  const two2 = make("div", "two-col");
  two2.appendChild(instantField("퀘스트", select(questIds(), node.quest || "", function(v){ setNodeField("quest", v); }, "없음")));
  two2.appendChild(instantField("진행 단계", input(String(node.progress || 0), function(v){ setNodeField("progress", v); }, "number")));
  els.editorBody.appendChild(two2);
  els.editorBody.appendChild(make("div", "section-title", "등장 캐릭터 · 변경 즉시 저장"));
  (node.characters || []).forEach(function(ch, index){
    const r = make("div", "mini-row");
    r.appendChild(select(charIds(), ch.id, function(v){ updateNode(function(n){ n.characters[index].id = v; }); }));
    r.appendChild(select(["left", "center", "right"], ch.position || "center", function(v){ updateNode(function(n){ n.characters[index].position = v; }); }));
    r.appendChild(button("삭제", function(){ updateNode(function(n){ n.characters.splice(index, 1); }); }));
    els.editorBody.appendChild(r);
  });
  els.editorBody.appendChild(button("캐릭터 추가", function(){ updateNode(function(n){ n.characters = n.characters || []; n.characters.push({ id: charIds()[0], position: "center" }); }); }));
}
function renderBranchEditor(){
  const node = currentNode();
  els.editorBody.appendChild(make("div", "section-title", "선택지 분기"));
  if(!node.choices || !node.choices.length) els.editorBody.appendChild(make("p", "muted", "선택지가 없는 직선 진행 장면입니다."));
  (node.choices || []).forEach(function(choice, index){
    const box = make("div", "choice-editor");
    box.appendChild(draftTextField("선택지 문구", false, choice.text || "", function(v){
      updateNode(function(n){ n.choices[index].text = v; });
    }));
    box.appendChild(instantField("이동 장면", select(nodeIds(), choice.next || "", function(v){
      updateNode(function(n){ n.choices[index].next = v; });
    }, "없음")));
    box.appendChild(button("선택지 삭제", function(){
      updateNode(function(n){ n.choices.splice(index, 1); if(!n.choices.length) delete n.choices; });
    }));
    els.editorBody.appendChild(box);
  });
  els.editorBody.appendChild(button("선택지 추가", function(){
    updateNode(function(n){ n.choices = n.choices || []; n.choices.push({ text: "새 선택지", next: n.next || "" }); });
  }));
}
function renderStatsEditor(){ const node = currentNode(); els.editorBody.appendChild(make("div", "section-title", "현재 장면 효과")); if(!node.effects || !node.effects.length) els.editorBody.appendChild(make("p", "muted", "아직 적용 효과가 없습니다.")); (node.effects || []).forEach(function(effect, index){ const box = make("div", "choice-editor"); box.appendChild(make("strong", "", effect.type === "quest" ? "퀘스트 효과" : "호감도 효과")); if(effect.type === "quest"){ box.appendChild(field("퀘스트", select(questIds(), effect.quest || "", function(v){ updateNode(function(n){ n.effects[index].quest = v; }); }))); box.appendChild(field("단계", input(String(effect.step || 0), function(v){ updateNode(function(n){ n.effects[index].step = Number(v || 0); }); }, "number"))); } else { box.appendChild(field("대상", select(charIds(), effect.character || charIds()[0], function(v){ updateNode(function(n){ n.effects[index].character = v; }); }))); box.appendChild(field("증감", input(String(effect.amount || 0), function(v){ updateNode(function(n){ n.effects[index].amount = Number(v || 0); }); }, "number"))); } box.appendChild(field("표시 문구", input(effect.label || "", function(v){ updateNode(function(n){ n.effects[index].label = v; }); }))); box.appendChild(button("효과 삭제", function(){ updateNode(function(n){ n.effects.splice(index, 1); if(!n.effects.length) delete n.effects; }); })); els.editorBody.appendChild(box); }); const row = make("div", "button-row"); row.appendChild(button("호감도 효과 추가", function(){ updateNode(function(n){ n.effects = n.effects || []; n.effects.push({ type: "affection", character: charIds()[0], amount: 1, label: "호감도 +1" }); }); })); row.appendChild(button("퀘스트 효과 추가", function(){ updateNode(function(n){ n.effects = n.effects || []; n.effects.push({ type: "quest", quest: state.quest, step: state.progress, label: "퀘스트 진행" }); }); })); els.editorBody.appendChild(row); els.editorBody.appendChild(make("div", "section-title", "테스트용 현재 호감도")); charIds().forEach(function(id){ const wrap = make("label", "field range-field"); wrap.appendChild(make("span", "", scenario.characters[id].name)); const r = document.createElement("input"); r.type = "range"; r.min = 0; r.max = 10; r.value = state.affection[id] || 0; const val = make("strong", "", String(r.value)); r.addEventListener("input", function(){ state.affection[id] = Number(r.value); val.textContent = r.value; renderHud(); }); wrap.appendChild(r); wrap.appendChild(val); els.editorBody.appendChild(wrap); }); }
function renderAssetEditor(){ els.editorBody.appendChild(make("div", "section-title", "배경 이미지")); bgIds().forEach(function(id){ els.editorBody.appendChild(field(id, input(scenario.assets.backgrounds[id] || "", function(v){ scenario.assets.backgrounds[id] = v; saveDraft(); render(); }))); }); const row = make("div", "button-row"); const newBg = input("", function(){}); newBg.placeholder = "새 배경 ID"; row.appendChild(newBg); row.appendChild(button("배경 추가", function(){ const id = newBg.value.trim(); if(!id) return; scenario.assets.backgrounds[id] = "./assets/새배경.png"; saveDraft(); render(); })); els.editorBody.appendChild(row); els.editorBody.appendChild(make("div", "section-title", "캐릭터 이미지")); charIds().forEach(function(id){ els.editorBody.appendChild(field(scenario.characters[id].name, input(scenario.assets.characters[id] || "", function(v){ scenario.assets.characters[id] = v; saveDraft(); render(); }))); }); const prev = make("div", "asset-preview"); const img = document.createElement("img"); img.src = scenario.assets.backgrounds[state.background] || ""; prev.appendChild(img); els.editorBody.appendChild(prev); els.editorBody.appendChild(make("p", "muted", "이미지는 ./assets/파일명.png 또는 웹 주소로 바꿀 수 있습니다.")); }
function appendPublishControls(){
  const publishRow = make("div", "button-row");
  publishRow.appendChild(button("결과만 보기", openPublishedView));
  publishRow.appendChild(button("공유 링크 복사", copyPublishedLink));
  els.editorBody.appendChild(publishRow);
}
function renderExportEditor(){
  els.editorBody.appendChild(make("div", "section-title", "엑셀 시나리오 입력양식"));
  const excelRow = make("div", "button-row");
  excelRow.appendChild(button("엑셀 양식 내보내기", exportScenarioExcel));
  excelRow.appendChild(button("엑셀/CSV 가져오기", openScenarioImport));
  els.editorBody.appendChild(excelRow);

  const csvRow = make("div", "button-row");
  csvRow.appendChild(button("CSV 내보내기", exportScenarioCsv));
  csvRow.appendChild(button("결과만 보기", openPublishedView));
  els.editorBody.appendChild(csvRow);
  els.editorBody.appendChild(make("p", "muted", "엑셀에서 장면ID, 화자, 대사, 배경, 다음장면, 퀘스트, 진행단계를 수정한 뒤 다시 가져올 수 있습니다. 등장캐릭터는 lord:left; liddy:right, 선택지는 문구 -> 장면ID 형식으로 입력합니다."));

  const box = document.createElement("textarea");
  box.id = "exportText";
  box.rows = 16;
  box.value = JSON.stringify(scenario, null, 2);
  els.editorBody.appendChild(field("현재 편집본 JSON", box));

  const row = make("div", "button-row");
  row.appendChild(button("JSON 복사", async function(){
    await navigator.clipboard.writeText(JSON.stringify(scenario, null, 2));
    showToast("JSON을 복사했습니다.");
  }));
  row.appendChild(button("초기 데이터로 되돌리기", function(){
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }));
  els.editorBody.appendChild(row);

  const publishRow = make("div", "button-row");
  publishRow.appendChild(button("공유 링크 복사", copyPublishedLink));
  els.editorBody.appendChild(publishRow);

  els.editorBody.appendChild(make("p", "muted", "변경 사항은 브라우저에 자동 저장됩니다. 팀원에게 보여줄 때는 결과만 보기 링크를 사용하세요."));
}

const SCENARIO_COLUMNS = ["장면ID", "화자", "대사", "배경", "다음장면", "퀘스트", "진행단계", "등장캐릭터", "선택지", "효과"];
function escapeHtml(value){ return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function sceneRows(sourceScenario){
  const source = sourceScenario || reindexScenarioCopy(scenario).scenario;
  return Object.entries(source.nodes).map(function(pair){
    const id = pair[0];
    const node = pair[1];
    return {
      "장면ID": id,
      "화자": node.speaker || "",
      "대사": node.text || "",
      "배경": node.bg || "",
      "다음장면": node.next || "",
      "퀘스트": node.quest || "",
      "진행단계": typeof node.progress === "number" ? String(node.progress) : "",
      "등장캐릭터": formatCharacters(node.characters),
      "선택지": formatChoices(node.choices),
      "효과": formatEffects(node.effects)
    };
  });
}
function formatCharacters(characters){ return (characters || []).map(function(ch){ return (ch.id || "") + ":" + (ch.position || "center"); }).join("; "); }
function parseCharacters(value){
  return String(value || "").split(/;|,/).map(function(part){
    const text = part.trim();
    if(!text) return null;
    const pieces = text.split(":");
    return { id: (pieces[0] || "").trim(), position: (pieces[1] || "center").trim() || "center" };
  }).filter(function(ch){ return ch && ch.id; });
}
function formatChoices(choices){ return (choices || []).map(function(choice){ return (choice.text || "") + " -> " + (choice.next || ""); }).join("; "); }
function parseChoices(value){
  return String(value || "").split(";").map(function(part){
    const text = part.trim();
    if(!text) return null;
    const arrow = text.includes("->") ? "->" : (text.includes("=>") ? "=>" : null);
    if(!arrow) return { text: text, next: "" };
    const pieces = text.split(arrow);
    return { text: (pieces[0] || "").trim(), next: (pieces.slice(1).join(arrow) || "").trim() };
  }).filter(Boolean);
}
function formatEffects(effects){ return effects && effects.length ? JSON.stringify(effects) : ""; }
function parseEffects(value){
  const text = String(value || "").trim();
  if(!text) return [];
  try { const parsed = JSON.parse(text); return Array.isArray(parsed) ? parsed : []; }
  catch { return []; }
}
function exportScenarioExcel(){
  const rows = sceneRows();
  const head = SCENARIO_COLUMNS.map(function(col){ return "<th>" + escapeHtml(col) + "</th>"; }).join("");
  const body = rows.map(function(row){
    return "<tr>" + SCENARIO_COLUMNS.map(function(col){
      const value = String(row[col] || "").replace(/\n/g, "<br>");
      return "<td style=\"mso-number-format:'\\@'\">" + escapeHtml(value).replace(/&lt;br&gt;/g, "<br>") + "</td>";
    }).join("") + "</tr>";
  }).join("\n");
  const html = "<!doctype html><html><head><meta charset='UTF-8'></head><body><table border='1'><thead><tr>" + head + "</tr></thead><tbody>" + body + "</tbody></table></body></html>";
  downloadText("isekai-farm-scenario.xls", html, "application/vnd.ms-excel;charset=utf-8");
  showToast("엑셀 입력양식을 내보냈습니다.");
}
function exportScenarioCsv(){
  const rows = sceneRows();
  const csv = [SCENARIO_COLUMNS].concat(rows.map(function(row){ return SCENARIO_COLUMNS.map(function(col){ return row[col] || ""; }); }))
    .map(function(row){ return row.map(csvCell).join(","); }).join("\r\n");
  downloadText("isekai-farm-scenario.csv", "\ufeff" + csv, "text/csv;charset=utf-8");
  showToast("CSV를 내보냈습니다.");
}
function csvCell(value){ return '"' + String(value ?? "").replace(/"/g, '""') + '"'; }
function downloadText(filename, text, type){
  const blob = new Blob([text], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 500);
}
function openScenarioImport(){
  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = ".xls,.html,.htm,.csv,.tsv,text/html,text/csv,text/tab-separated-values";
  picker.addEventListener("change", function(){ const file = picker.files && picker.files[0]; if(file) importScenarioFile(file); });
  picker.click();
}
async function importScenarioFile(file){
  const text = await file.text();
  const lower = file.name.toLowerCase();
  const rows = lower.endsWith(".csv") ? parseDelimited(text, ",") : (lower.endsWith(".tsv") ? parseDelimited(text, "	") : parseExcelHtml(text));
  const count = applyScenarioRows(rows);
  if(!count){ showToast("가져올 장면을 찾지 못했습니다."); return; }
  saveDraft();
  state.dialoguePage = 0;
  if(!scenario.nodes[state.nodeId]) state.nodeId = scenario.start;
  render();
  showToast(String(count) + "개 장면을 가져왔습니다.");
}
function parseExcelHtml(text){
  const doc = new DOMParser().parseFromString(text, "text/html");
  const table = doc.querySelector("table");
  if(!table) return parseDelimited(text, "	");
  return Array.from(table.querySelectorAll("tr")).map(function(tr){
    return Array.from(tr.children).map(function(cell){ return cell.innerText.replace(/ /g, " ").trim(); });
  }).filter(function(row){ return row.some(Boolean); });
}
function parseDelimited(text, delimiter){
  const rows = [];
  let row = [], cell = "", inQuotes = false;
  const src = String(text || "").replace(/^\ufeff/, "");
  for(let i = 0; i < src.length; i++){
    const ch = src[i];
    if(ch === '"'){
      if(inQuotes && src[i + 1] === '"'){ cell += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if(ch === delimiter && !inQuotes){ row.push(cell); cell = ""; }
    else if((ch === "\n" || ch === "\r") && !inQuotes){
      if(ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  row.push(cell); rows.push(row);
  return rows.filter(function(r){ return r.some(function(c){ return String(c).trim(); }); });
}
function applyScenarioRows(tableRows){
  if(!tableRows || tableRows.length < 2) return 0;
  const header = tableRows[0].map(function(h){ return String(h || "").trim(); });
  const index = {};
  header.forEach(function(name, i){ index[name] = i; });
  if(index["장면ID"] == null) return 0;
  const reordered = {};
  let count = 0;
  tableRows.slice(1).forEach(function(row){
    const id = cell(row, index, "장면ID").trim();
    if(!id) return;
    const previous = scenario.nodes[id] || {};
    const node = { ...previous };
    node.speaker = cell(row, index, "화자");
    node.text = cell(row, index, "대사");
    setOptional(node, "bg", cell(row, index, "배경"));
    setOptional(node, "next", cell(row, index, "다음장면"));
    setOptional(node, "quest", cell(row, index, "퀘스트"));
    const progressText = cell(row, index, "진행단계").trim();
    if(progressText === "") delete node.progress; else node.progress = Number(progressText || 0);
    const chars = parseCharacters(cell(row, index, "등장캐릭터"));
    if(chars.length) node.characters = chars; else delete node.characters;
    const choices = parseChoices(cell(row, index, "선택지"));
    if(choices.length) node.choices = choices; else delete node.choices;
    const effects = parseEffects(cell(row, index, "효과"));
    if(effects.length) node.effects = effects; else delete node.effects;
    reordered[id] = node;
    count++;
  });
  if(!count) return 0;
  Object.keys(scenario.nodes).forEach(function(id){ if(!reordered[id]) reordered[id] = scenario.nodes[id]; });
  scenario.nodes = reordered;
  scenario.start = scenario.nodes[scenario.start] ? scenario.start : Object.keys(scenario.nodes)[0];
  return count;
}
function cell(row, index, name){ const i = index[name]; return i == null ? "" : String(row[i] || "").trim(); }
function setOptional(node, key, value){ const clean = String(value || "").trim(); if(clean) node[key] = clean; else delete node[key]; }

function makeInsertedNodeId(anchorId){
  const numeric = anchorId.match(/^(.*?\d+)([a-z])?$/i);
  if(numeric){
    const base = numeric[1];
    const currentSuffix = numeric[2] ? numeric[2].toLowerCase().charCodeAt(0) - 96 : 0;
    for(let i = currentSuffix + 1; i <= 26; i++){
      const id = base + String.fromCharCode(96 + i);
      if(!scenario.nodes[id]) return id;
    }
  }
  let i = 1;
  let id = anchorId + "_insert_" + String(i).padStart(2, "0");
  while(scenario.nodes[id]){
    i++;
    id = anchorId + "_insert_" + String(i).padStart(2, "0");
  }
  return id;
}
function insertNodeInOrder(newId, newNode, afterId){
  const reordered = {};
  Object.entries(scenario.nodes).forEach(function(pair){
    const id = pair[0];
    reordered[id] = pair[1];
    if(id === afterId) reordered[newId] = newNode;
  });
  if(!reordered[newId]) reordered[newId] = newNode;
  scenario.nodes = reordered;
}
function insertNodeAfter(){
  const node = currentNode();
  if(!node) return;
  if(node.choices && node.choices.length){
    showToast("선택지가 있는 장면은 분기 탭에서 연결을 조정해 주세요.");
    return;
  }
  const oldNext = node.next || "";
  const newId = makeInsertedNodeId(state.nodeId);
  const nextNode = {
    speaker: node.speaker || "",
    text: "새 장면입니다.",
    next: oldNext
  };
  if(node.bg) nextNode.bg = node.bg;
  if(node.quest) nextNode.quest = node.quest;
  if(typeof node.progress === "number") nextNode.progress = node.progress;
  if(node.characters) nextNode.characters = structuredClone(node.characters);
  node.next = newId;
  insertNodeInOrder(newId, nextNode, state.nodeId);
  saveDraft();
  setCurrentNode(newId);
  showToast(state.nodeId + " 장면을 삽입했습니다.");
}
function addNode(){ let i = nodeIds().length + 1; let id = "scene_" + String(i).padStart(3, "0"); while(scenario.nodes[id]){ i++; id = "scene_" + String(i).padStart(3, "0"); } scenario.nodes[id] = { speaker: "화면", text: "새 장면입니다.", next: "" }; saveDraft(); setCurrentNode(id); }
function duplicateNode(){ let id = state.nodeId + "_copy"; let i = 2; while(scenario.nodes[id]) id = state.nodeId + "_copy" + i++; scenario.nodes[id] = structuredClone(currentNode()); saveDraft(); setCurrentNode(id); }
function removeNode(){
  if(state.nodeId === scenario.start){ showToast("시작 장면은 삭제할 수 없습니다."); return; }
  const deletedId = state.nodeId;
  const fallback = scenario.nodes[deletedId]?.next || nextExistingNodeIdAfter(deletedId, scenario.nodes) || scenario.start;
  Object.values(scenario.nodes).forEach(function(node){
    if(node.next === deletedId){
      if(fallback && fallback !== deletedId && scenario.nodes[fallback]) node.next = fallback;
      else delete node.next;
    }
    (node.choices || []).forEach(function(choice){ if(choice.next === deletedId) choice.next = (fallback && fallback !== deletedId && scenario.nodes[fallback]) ? fallback : ""; });
  });
  delete scenario.nodes[deletedId];
  repairScenarioLinks(scenario);
  saveDraft();
  setCurrentNode(scenario.nodes[fallback] ? fallback : scenario.start);
  showToast(deletedId + " 삭제, 연결을 정리했습니다.");
}
function scheduleAuto(){ clearAuto(); const node = currentNode(); if(state.title || !state.auto || (visibleChoices(node).length && isLastDialoguePage(node))) return; autoTimer = window.setTimeout(next, 2200); }
function clearAuto(){ if(autoTimer) window.clearTimeout(autoTimer); autoTimer = null; }
function showToast(message){ const toast = make("div", "toast", message); document.body.appendChild(toast); requestAnimationFrame(function(){ toast.classList.add("show"); }); window.setTimeout(function(){ toast.classList.remove("show"); window.setTimeout(function(){ toast.remove(); }, 220); }, 1500); }
els.backdrop.addEventListener("load", function(){ els.backdrop.classList.add("loaded"); });
els.next.addEventListener("click", next);
if(els.start) els.start.addEventListener("click", startGame);
document.querySelector(".dialogue").addEventListener("click", function(event){ if(!event.target.closest("button")) next(); });
els.auto.addEventListener("click", function(){ state.auto = !state.auto; els.auto.classList.toggle("active", state.auto); scheduleAuto(); });
els.log.addEventListener("click", function(){ togglePanel("log"); });
els.reset.addEventListener("click", resetGame);
els.closeLog.addEventListener("click", function(event){ event.preventDefault(); event.stopPropagation(); closePanel(); });
els.playCurrent.addEventListener("click", playCurrent);
document.querySelectorAll(".tabs button").forEach(function(button){ button.addEventListener("click", function(){ state.tab = button.dataset.tab; renderPanel(); }); });
document.addEventListener("click", function(event){ const closeButton = event.target.closest("#closeLogButton"); if(closeButton){ event.preventDefault(); event.stopPropagation(); closePanel(); return; } if(els.panel.classList.contains("open") && !event.target.closest("#logPanel") && !event.target.closest("#logButton")){ closePanel(); } }, true);
document.querySelectorAll(".editor-tabs button").forEach(function(button){ button.onclick = function(){ switchEditorTab(button.dataset.editorTab); }; });
const editorTabsEl = document.querySelector(".editor-tabs");
if(editorTabsEl){ editorTabsEl.addEventListener("click", function(event){ const button = event.target.closest("button[data-editor-tab]"); if(!button) return; state.editorTab = button.dataset.editorTab; renderEditor(); }); }
window.addEventListener("keydown", function(event){
  const active = document.activeElement;
  const editing = ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(active?.tagName) || active?.isContentEditable;
  const inEditor = !!active?.closest?.(".editor");
  const stageFocused = !!active?.closest?.(".stage") || active === document.body;
  if(event.key === "Escape") closePanel();
  if(isPublishMode && !editing && !inEditor && stageFocused && (event.key === " " || event.key === "Enter")){
    event.preventDefault();
    next();
  }
  if(!editing && !inEditor && event.key.toLowerCase() === "l") togglePanel("log");
});
render();
