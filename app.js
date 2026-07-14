const STORAGE_KEY = "farmVillageScenarioDraftV4";
const PLAYER_NAME_KEY = "farmVillagePlayerName";
const TERRITORY_NAME_KEY = "farmVillageTerritoryName";
const REVIEW_CHECKPOINT_KEY = "farmVillageReviewCheckpointV1";
const originalScenario = window.FARM_VILLAGE_SCENARIO;
const publishedScenario = loadPublishedScenario();
const draftScenario = publishedScenario || loadDraft();
const scenario = repairScenarioLinks(migrateAllClearBranches(migrateDiningRoute(normalizeScenarioNames(migrateAssetPaths(draftScenario ? mergeScenarioDraft(structuredClone(originalScenario), draftScenario) : structuredClone(originalScenario))))));
const state = { nodeId: scenario.start, background: "field", quest: "intro", progress: 0, affection: {}, flags: {}, log: [], auto: false, tab: "log", editorTab: "scene", title: true, titleStageMenu: false, dialoguePage: 0, appliedEffects: new Set(), characters: [], playerName: loadPlayerName(), territoryName: loadTerritoryName(), storyAnalysis: null, fileSaveStatus: "idle", fileSaveMessage: "" };
const els = {
  backdrop: document.getElementById("backdrop"), backdropFill: document.getElementById("backdropFill"), characters: document.getElementById("characterLayer"), questTitle: document.getElementById("questTitle"), questProgress: document.getElementById("questProgress"), affection: document.getElementById("affectionPanel"),
  speaker: document.getElementById("speaker"), line: document.getElementById("line"), choices: document.getElementById("choices"), next: document.getElementById("nextButton"), auto: document.getElementById("autoButton"), log: document.getElementById("logButton"), reset: document.getElementById("resetButton"),
  panel: document.getElementById("logPanel"), closeLog: document.getElementById("closeLogButton"), panelContent: document.getElementById("panelContent"), editorBody: document.getElementById("editorBody"), playCurrent: document.getElementById("playCurrentButton"), saveFile: document.getElementById("saveFileButton"), headerSaveStatus: document.getElementById("headerSaveStatus"),
  titleScreen: document.getElementById("titleScreen"), titleArt: document.getElementById("titleArt"), start: document.getElementById("startButton"), stageSelect: document.getElementById("stageSelectButton"), stagePanel: document.getElementById("stageSelectPanel"), stageList: document.getElementById("stageSelectList"), stageBack: document.getElementById("stageBackButton"), dialogue: document.querySelector(".dialogue")
};
const isPublishMode = new URLSearchParams(window.location.search).has("publish") || window.location.hash.includes("publish");
document.body.classList.toggle("publish-mode", isPublishMode);
const APP_VERSION = "20260713h";
const assetVersion = new URLSearchParams(window.location.search).get("v") || APP_VERSION;
let autoTimer = null;
function assetUrl(src){
  const value = String(src || "").trim();
  if(!value || value.startsWith("data:") || value.startsWith("blob:")) return value;
  const joiner = value.includes("?") ? "&" : "?";
  return value + joiner + "v=" + encodeURIComponent(assetVersion);
}
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
  if(Array.isArray(copy.reviewStages)){
    copy.reviewStages.forEach(function(stage){
      if(stage.nodeId && idMap[stage.nodeId]) stage.nodeId = idMap[stage.nodeId];
      if(Array.isArray(stage.appliedEffects)){
        stage.appliedEffects = stage.appliedEffects.map(function(key){
          const text = String(key || "");
          const colon = text.indexOf(":");
          if(colon < 0) return text;
          const oldId = text.slice(0, colon);
          return (idMap[oldId] || oldId) + text.slice(colon);
        });
      }
    });
  }
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
  showToast("공유 링크를 복사했습니다.");
}
function normalizeSpeakerName(name){
  const value = String(name || "").trim();
  if(!value) return "";
  return value.replace(/^로드(?=$|\s|\()/, "주인공");
}
function loadPlayerName(){
  try { return localStorage.getItem(PLAYER_NAME_KEY) || ""; }
  catch { return ""; }
}
function savePlayerName(value){
  state.playerName = String(value || "").trim();
  try { if(state.playerName) localStorage.setItem(PLAYER_NAME_KEY, state.playerName); }
  catch {}
}
function clearPlayerName(){
  state.playerName = "";
  try { localStorage.removeItem(PLAYER_NAME_KEY); }
  catch {}
}
function loadTerritoryName(){
  try { return localStorage.getItem(TERRITORY_NAME_KEY) || ""; }
  catch { return ""; }
}
function saveTerritoryName(value){
  state.territoryName = String(value || "").trim();
  try { if(state.territoryName) localStorage.setItem(TERRITORY_NAME_KEY, state.territoryName); }
  catch {}
}
function clearTerritoryName(){
  state.territoryName = "";
  try { localStorage.removeItem(TERRITORY_NAME_KEY); }
  catch {}
}
function isMainCharacterSpeaker(speaker){
  return normalizeSpeakerName(speaker).startsWith("주인공");
}
function displaySpeakerName(speaker){
  const normalized = normalizeSpeakerName(speaker);
  if(!normalized) return "";
  if(state.playerName && normalized.startsWith("주인공")) return normalized.replace(/^주인공/, state.playerName);
  return normalized;
}
function displayLineText(text){
  const name = state.playerName || "주인공";
  const territory = state.territoryName || "영지";
  return String(text || "")
    .replace(/{player}/g, name)
    .replace(/{name}/g, name)
    .replace(/\[영지이름\]/g, territory)
    .replace(/\[\s*\]/g, territory)
    .replace(/{territory}/g, territory)
    .replace(/{territoryName}/g, territory);
}
function isNameInputNode(node){
  return !!node && (node.nameInput || (state.nodeId === scenario.start && isMainCharacterSpeaker(node.speaker)));
}
function isTerritoryInputNode(node){
  return !!node && !!node.territoryInput;
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
function autoChoiceFlag(choice){
  const base = choice.hideIfFlag || choice.next || choice.text || "choice";
  return "done_" + String(base).toLowerCase().replace(/[^a-z0-9가-힣]+/g, "_").replace(/^_+|_+$/g, "");
}
function findNodeIdInScenario(target, id){
  if(!id || !target?.nodes) return "";
  if(target.nodes[id]) return id;
  const lower = String(id).toLowerCase();
  return Object.keys(target.nodes).find(function(nodeId){ return nodeId.toLowerCase() === lower; }) || "";
}
function ensureChoiceCompletion(target, choice){
  if(!choice || choice.reset || choice.action || !choice.next) return;
  const targetId = findNodeIdInScenario(target, choice.next) || choice.next;
  const targetNode = target?.nodes?.[targetId];
  if(!targetNode) return;
  if(!choice.hideIfFlag) choice.hideIfFlag = autoChoiceFlag(choice);
  ensureEffect(targetNode, { type: "flag", key: choice.hideIfFlag, value: true });
}
function migrateAllClearBranches(target){
  Object.values(target?.nodes || {}).forEach(function(node){
    if(!node?.autoNextWhenChoicesDone || !node.choices) return;
    node.choices.forEach(function(choice){ ensureChoiceCompletion(target, choice); });
  });
  return target;
}
function migrateDiningRoute(target){
  const nodes = target?.nodes || {};
  if(nodes.scene_003b) nodes.scene_003b.territoryInput = true;
  if(nodes.intro_001) nodes.intro_001.bg = "field";
  if(nodes.dining_003){
    nodes.dining_003.next = "food_problem";
    nodes.dining_003.autoNextWhenChoicesDone = true;
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
    './assets/bg-field.png': './assets/bg-isometric-farm.png',
    './assets/bg-storage': './assets/bg-storage.png',
    'assets/bg-storage': './assets/bg-storage.png',
    'bg-storage': './assets/bg-storage.png'
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
    if(!target.assets.backgrounds.bg) target.assets.backgrounds.bg = "./assets/bg-wall.png";
    target.assets.backgrounds.bg_2 = "./assets/bg-storage.png";
    if(!target.assets.backgrounds.cleanwell) target.assets.backgrounds.cleanwell = "./assets/bg-cleanwell.png";
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
let scenarioFileSaveTimer = null;
function canSaveScenarioFile(){
  return !isPublishMode && (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost");
}
function fileSaveTitle(status){
  if(status === "pending") return "파일 저장 중";
  if(status === "saved") return "파일 저장 완료";
  if(status === "local-only") return "브라우저 저장만 됨";
  if(status === "error") return "파일 저장 실패";
  return canSaveScenarioFile() ? "파일 저장 대기" : "브라우저 저장";
}
function defaultFileSaveMessage(){
  if(!canSaveScenarioFile()) return "GitHub 공개 화면에서는 파일 저장을 하지 않습니다.";
  return "저장하면 RedBound\\data\\scenario.js에 바로 반영됩니다.";
}
function syncHeaderFileSaveStatus(){
  if(!els.headerSaveStatus) return;
  const status = state.fileSaveStatus || "idle";
  els.headerSaveStatus.className = "header-save-status " + status;
  els.headerSaveStatus.textContent = fileSaveTitle(status);
  if(els.saveFile){
    els.saveFile.disabled = status === "pending" || isPublishMode;
    els.saveFile.title = canSaveScenarioFile()
      ? "현재 에디터 내용을 data/scenario.js 파일에 바로 저장"
      : "파일 저장은 127.0.0.1:4185 로 연 에디터에서만 가능합니다.";
  }
}
function syncFileSaveStatusView(){
  const box = document.getElementById("fileSaveStatus");
  const status = state.fileSaveStatus || "idle";
  syncHeaderFileSaveStatus();
  if(!box) return;
  const title = box.querySelector("strong");
  const message = box.querySelector("span");
  box.className = "file-save-status " + status;
  if(title) title.textContent = fileSaveTitle(status);
  if(message) message.textContent = state.fileSaveMessage || defaultFileSaveMessage();
}
function setFileSaveState(status, message){
  state.fileSaveStatus = status || "idle";
  state.fileSaveMessage = message || "";
  syncFileSaveStatusView();
}
function scheduleScenarioFileSave(){
  if(!canSaveScenarioFile()) return;
  window.clearTimeout(scenarioFileSaveTimer);
  setFileSaveState("pending", "파일 저장 준비 중입니다.");
  scenarioFileSaveTimer = window.setTimeout(saveScenarioFileToDisk, 450);
}
async function saveScenarioFileToDisk(){
  if(!canSaveScenarioFile()) return;
  try {
    setFileSaveState("pending", "RedBound\\data\\scenario.js에 저장 중입니다.");
    const res = await fetch("./api/save-scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: scenario })
    });
    const payload = await res.json().catch(function(){ return {}; });
    if(!res.ok || !payload.ok) throw new Error(payload.error || res.statusText || "save failed");
    setFileSaveState("saved", "파일에 저장됐습니다. 이제 RedBound 폴더를 GitHub에 올리면 이 내용이 반영됩니다.");
    showToast("파일 저장 완료", 2200);
  } catch (error) {
    const detail = error && error.message ? " (" + error.message + ")" : "";
    setFileSaveState("local-only", "현재 서버가 파일 저장을 받지 못했습니다. server.js로 연 4185 주소에서 저장해야 파일에 반영됩니다." + detail);
  }
}
async function saveScenarioNow(){
  window.clearTimeout(scenarioFileSaveTimer);
  scenarioFileSaveTimer = null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenario));
  if(!canSaveScenarioFile()){
    setFileSaveState("local-only", "브라우저에는 저장됐지만 파일에는 쓰지 못했습니다. 127.0.0.1:4185 에디터에서 저장해 주세요.");
    showToast("브라우저 저장만 됨", 2200);
    return;
  }
  await saveScenarioFileToDisk();
}
function saveDraft(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenario));
  scheduleScenarioFileSave();
}
function currentNode(){ return scenario.nodes[state.nodeId]; }
function nodeIds(){ return Object.keys(scenario.nodes); }
function nodeLabel(id){
  const node = scenario.nodes[id];
  if(!node) return id;
  const marks = [];
  if(node.choices && node.choices.length) marks.push("분기");
  if(node.autoNextWhenChoicesDone) marks.push("올클리어");
  const markText = marks.length ? " (" + marks.join("/") + ")" : "";
  const memo = String(node.memo || "").trim();
  const memoText = memo ? " - " + (memo.length > 24 ? memo.slice(0, 24) + "..." : memo) : "";
  return id + markText + memoText;
}
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
function plainInput(value, placeholder){ const el = document.createElement("input"); el.type = "text"; el.value = value || ""; if(placeholder) el.placeholder = placeholder; return el; }
function plainTextarea(value, placeholder, rows){ const el = document.createElement("textarea"); el.rows = rows || 4; el.value = value || ""; if(placeholder) el.placeholder = placeholder; return el; }
function cleanId(value, fallback){
  const base = String(value || "").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  return base || fallback;
}
function uniqueKey(collection, base){
  let id = base;
  let index = 2;
  while(collection[id]) id = base + "_" + index++;
  return id;
}
function stepLines(value){ return String(value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").map(function(line){ return line.trim(); }).filter(Boolean); }
function draftTextField(labelText, multiline, value, onApply){
  const wrap = make("div", "field apply-field");
  const isDialogueText = labelText === "대사";
  const label = make("span", "", labelText);
  const control = document.createElement(multiline ? "textarea" : "input");
  if(multiline) control.rows = 7;
  else control.type = "text";
  if(isDialogueText){
    wrap.classList.add("dialogue-script-field");
    control.classList.add("dialogue-script-input");
    control.rows = 5;
  }
  control.value = value || "";
  const preview = isDialogueText ? make("div", "dialogue-page-preview") : null;
  function refreshDialoguePreview(){
    if(!preview) return;
    const pages = dialoguePages(control.value);
    preview.textContent = pages.map(function(page, index){ return String(index + 1) + " / " + String(pages.length) + "\n" + page; }).join("\n\n");
  }
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
    refreshDialoguePreview();
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
  if(preview){
    refreshDialoguePreview();
    wrap.appendChild(preview);
  }
  wrap.appendChild(actions);
  return wrap;
}
function select(values, selected, onChange, emptyLabel, labeler){ const el = document.createElement("select"); if(emptyLabel !== undefined){ const opt = document.createElement("option"); opt.value = ""; opt.textContent = emptyLabel; el.appendChild(opt); } values.forEach(function(v){ const opt = document.createElement("option"); opt.value = v; opt.textContent = labeler ? labeler(v) : v; opt.selected = v === selected; const targetNode = scenario.nodes?.[v]; if(targetNode?.choices?.length) opt.className = targetNode.autoNextWhenChoicesDone ? "option-all-clear" : "option-branch"; el.appendChild(opt); }); el.addEventListener("change", function(){ onChange(el.value); }); return el; }
function button(text, onClick){ const el = document.createElement("button"); el.type = "button"; el.textContent = text; el.addEventListener("click", onClick); return el; }
function updateNode(mutator){ mutator(currentNode()); state.storyAnalysis = null; repairScenarioLinks(scenario); saveDraft(); closePanel(); // force-start-closed
render(); }
function setNodeField(fieldName, value){ updateNode(function(node){ if(value === "" && ["bg", "quest", "next"].includes(fieldName)) delete node[fieldName]; else if(fieldName === "progress") node[fieldName] = Number(value || 0); else if(fieldName === "next") node[fieldName] = findNodeIdLoose(value) || value; else if(fieldName === "speaker") node[fieldName] = normalizeSpeakerName(value); else node[fieldName] = value; }); }
function setCurrentNode(id){ state.nodeId = id; state.dialoguePage = 0; playCurrent(); }
function reindexEditorSceneIds(){
  const currentId = state.nodeId;
  const result = reindexScenarioCopy(scenario);
  scenario.nodes = result.scenario.nodes;
  scenario.start = result.scenario.start;
  scenario.reviewStages = result.scenario.reviewStages || reviewStages();
  state.nodeId = result.idMap[currentId] || scenario.start;
  state.dialoguePage = 0;
  repairScenarioLinks(scenario);
  saveDraft();
  closePanel();
  render();
  showToast("장면 ID를 scene_001부터 정리했습니다.");
}
function nodeStoryLinks(id){
  const node = scenario.nodes[id];
  if(!node) return [];
  const links = [];
  (node.choices || []).forEach(function(choice, index){
    if(choice.next) links.push({ from: id, to: choice.next, type: "선택지", label: choice.text || "선택지 " + String(index + 1) });
  });
  if(node.next) links.push({ from: id, to: node.next, type: "다음", label: "next" });
  return links;
}
function analyzeStoryGraph(){
  const nodes = scenario.nodes || {};
  const allIds = Object.keys(nodes);
  const visited = new Set();
  const order = [];
  const missing = [];
  const loops = [];
  const seenLoops = new Set();
  const maxSteps = Math.max(2000, allIds.length * 30);
  let steps = 0;
  const stack = [{ id: scenario.start, path: [] }];
  while(stack.length && steps < maxSteps){
    steps++;
    const item = stack.pop();
    const id = findNodeIdLoose(item.id) || item.id;
    if(!nodes[id]) continue;
    const loopStart = item.path.indexOf(id);
    if(loopStart >= 0){
      const label = item.path.slice(loopStart).concat(id).join(" -> ");
      if(!seenLoops.has(label)){ seenLoops.add(label); loops.push({ path: label }); }
      continue;
    }
    if(visited.has(id)) continue;
    visited.add(id);
    order.push(id);
    const nextPath = item.path.concat(id);
    nodeStoryLinks(id).slice().reverse().forEach(function(link){
      const targetId = findNodeIdLoose(link.to);
      if(!targetId) missing.push(link);
      else if(nextPath.includes(targetId)){
        const label = nextPath.slice(nextPath.indexOf(targetId)).concat(targetId).join(" -> ");
        if(!seenLoops.has(label)){ seenLoops.add(label); loops.push({ path: label }); }
      } else if(!visited.has(targetId)) stack.push({ id: targetId, path: nextPath });
    });
  }
  if(steps >= maxSteps) loops.push({ path: "검사 한도 초과: 연결 구조를 확인해 주세요" });
  const unreachable = allIds.filter(function(id){ return !visited.has(id); });
  const terminal = allIds.filter(function(id){
    const node = nodes[id];
    const hasChoiceMove = (node.choices || []).some(function(choice){ return choice.next || choice.action || choice.reset; });
    return !node.next && !hasChoiceMove;
  });
  return { order: order, unreachable: unreachable, missing: missing, loops: loops, terminal: terminal };
}
function storyItemLabel(id){ return nodeLabel(id); }
function appendStoryList(parent, title, items, formatter, limit){
  const wrap = make("div", "story-list");
  wrap.appendChild(make("strong", "", title + " " + String(items.length)));
  if(!items.length){
    wrap.appendChild(make("span", "muted", "없음"));
  } else {
    const list = make("div", "story-list-items");
    items.slice(0, limit || 12).forEach(function(item){ list.appendChild(make("span", "story-pill", formatter(item))); });
    if(items.length > (limit || 12)) list.appendChild(make("span", "story-pill muted-pill", "+" + String(items.length - (limit || 12))));
    wrap.appendChild(list);
  }
  parent.appendChild(wrap);
}
function reorderNodesByStoryOrder(){
  const analysis = analyzeStoryGraph();
  const currentId = state.nodeId;
  const reordered = {};
  analysis.order.concat(analysis.unreachable).forEach(function(id){ if(scenario.nodes[id]) reordered[id] = scenario.nodes[id]; });
  scenario.nodes = reordered;
  state.nodeId = scenario.nodes[currentId] ? currentId : scenario.start;
  state.dialoguePage = 0;
  saveDraft();
  state.storyAnalysis = analyzeStoryGraph();
  closePanel();
  render();
  showToast("스토리 순서로 장면 목록을 정렬했습니다.");
}
function runStoryAnalysis(){
  state.storyAnalysis = analyzeStoryGraph();
  renderEditor();
}
function renderStoryStructureTools(){
  const box = make("div", "choice-editor manager-card story-tools");
  box.appendChild(make("strong", "", "스토리 구조 검사"));
  const analysis = state.storyAnalysis;
  if(!analysis){
    box.appendChild(make("p", "muted", "검사를 실행하면 도달 불가 장면, 끊긴 연결, 종료 장면, 루프 의심 구간과 스토리 순서 미리보기를 보여줍니다."));
    const firstRow = make("div", "button-row");
    firstRow.appendChild(button("스토리 검사 실행", runStoryAnalysis));
    box.appendChild(firstRow);
    els.editorBody.appendChild(box);
    return;
  }
  box.appendChild(make("p", "muted", "도달 가능 " + String(analysis.order.length) + "/" + String(nodeIds().length) + " · 도달 불가 " + String(analysis.unreachable.length) + " · 끊긴 연결 " + String(analysis.missing.length) + " · 종료 장면 " + String(analysis.terminal.length) + " · 루프 의심 " + String(analysis.loops.length)));
  appendStoryList(box, "스토리 순서", analysis.order, storyItemLabel, 18);
  appendStoryList(box, "도달 불가", analysis.unreachable, storyItemLabel, 10);
  appendStoryList(box, "끊긴 연결", analysis.missing, function(link){ return link.from + " -> " + link.to + " (" + link.type + ")"; }, 8);
  appendStoryList(box, "종료 장면", analysis.terminal, storyItemLabel, 8);
  appendStoryList(box, "루프 의심", analysis.loops, function(loop){ return loop.path; }, 6);
  const row = make("div", "button-row");
  row.appendChild(button("다시 검사", runStoryAnalysis));
  row.appendChild(button("스토리 순서로 목록 정렬", reorderNodesByStoryOrder));
  box.appendChild(row);
  box.appendChild(make("p", "muted", "정렬은 장면 목록 순서만 바꾸고 ID와 연결은 바꾸지 않습니다. 필요하면 정렬 후 장면 ID 정리를 따로 실행하세요."));
  els.editorBody.appendChild(box);
}
function render(){ const node = currentNode(); if(!node) return; if(node.bg) state.background = node.bg; if(node.quest) state.quest = node.quest; if(typeof node.progress === "number") state.progress = node.progress; if(node.characters) state.characters = structuredClone(node.characters); renderBackground(); renderTitleScreen(); renderCharacters(); renderDialogue(node); if(!state.title) applyEffects(node); renderHud(); renderPanel(); if(!isPublishMode) renderEditor(); scheduleAuto(); }
function renderBackground(){
  const bg = assetUrl(scenario.assets.backgrounds[state.background] || "");
  if(els.backdropFill && els.backdropFill.getAttribute("src") !== bg) els.backdropFill.src = bg;
  if(els.backdrop.getAttribute("src") !== bg){
    els.backdrop.classList.remove("loaded");
    els.backdrop.src = bg;
  }
}
function renderTitleScreen(){
  document.body.classList.toggle("title-active", !!state.title);
  if(els.titleScreen) els.titleScreen.hidden = !state.title;
  const titleSrc = assetUrl(scenario.titleImage || "");
  if(els.titleArt && titleSrc && els.titleArt.getAttribute("src") !== titleSrc) els.titleArt.src = titleSrc;
  renderTitleStageList();
}
function renderTitleStageList(){
  const stages = reviewStages();
  if(els.stageSelect){
    els.stageSelect.hidden = !stages.length;
    els.stageSelect.disabled = !stages.length;
  }
  if(els.stagePanel) els.stagePanel.hidden = !(state.title && state.titleStageMenu);
  if(!els.stageList) return;
  clear(els.stageList);
  if(!stages.length){
    els.stageList.appendChild(make("p", "muted", "저장된 검수 스테이지가 없습니다."));
    return;
  }
  stages.forEach(function(stage, index){
    const item = make("button", "stage-select-item");
    item.type = "button";
    item.appendChild(make("strong", "", reviewStageTitle(stage, index)));
    item.appendChild(make("span", "", reviewStageSummary(stage)));
    item.addEventListener("click", function(){ restoreReviewStageById(stage.id); });
    els.stageList.appendChild(item);
  });
}
function resetRuntime(toTitle){
  clearAuto();
  clearPlayerName();
  clearTerritoryName();
  state.nodeId = scenario.start;
  state.background = "field";
  state.quest = "intro";
  state.progress = 0;
  state.affection = {};
  state.flags = {};
  state.log = [];
  state.auto = false;
  state.title = !!toTitle;
  state.titleStageMenu = false;
  state.dialoguePage = 0;
  state.appliedEffects = new Set();
  state.characters = [];
}
function startGame(){ resetRuntime(false); closePanel(); render(); }
function renderCharacters(){ clear(els.characters); const activeId = speakerCharacterId(currentNode()?.speaker); const hasFocus = state.characters.length > 1 && state.characters.some(function(item){ return item.id === activeId; }); state.characters.forEach(function(item){ const src = assetUrl(scenario.assets.characters[item.id]); if(!src) return; const img = make("img", "character " + (item.position || "center")); if(hasFocus) img.classList.add(item.id === activeId ? "is-speaking" : "is-dimmed"); img.src = src; img.alt = scenario.characters[item.id]?.name || item.id; els.characters.appendChild(img); }); }
function dialogueLineCapacity(){
  const lineEl = els?.line;
  const width = Math.max(180, lineEl?.clientWidth || document.querySelector(".dialogue")?.clientWidth || 360);
  const style = lineEl ? window.getComputedStyle(lineEl) : null;
  const fontSize = parseFloat(style?.fontSize || "18") || 18;
  return Math.max(10, Math.floor(width / (fontSize * 1.02)));
}
function wrapDialogueLine(line, capacity){
  const text = String(line || "").trim();
  if(!text) return [];
  const chunks = [];
  let rest = text;
  while(rest.length > capacity){
    let cut = -1;
    const punctuation = [". ", "? ", "! ", ", ", ".", "?", "!", ",", "。", "？", "！", "、", " "];
    punctuation.forEach(function(mark){
      const found = rest.lastIndexOf(mark, capacity);
      if(found > Math.floor(capacity * 0.45)) cut = Math.max(cut, found + mark.length);
    });
    if(cut <= 0) cut = capacity;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if(rest) chunks.push(rest);
  return chunks;
}
function dialoguePages(text){
  const normalized = String(text || "").replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const logicalLines = normalized.split("\n").map(function(line){ return line.trim(); }).filter(Boolean);
  if(!logicalLines.length) return [""];
  const capacity = dialogueLineCapacity();
  const visualLines = [];
  logicalLines.forEach(function(line){
    wrapDialogueLine(line, capacity).forEach(function(chunk){ visualLines.push(chunk); });
  });
  const pages = [];
  for(let i = 0; i < visualLines.length; i += 3) pages.push(visualLines.slice(i, i + 3).join("\n"));
  return pages;
}
function isLastDialoguePage(node){
  const pages = dialoguePages(displayLineText(node?.text || ""));
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
function choiceHubIsComplete(node){
  return !!(node?.autoNextWhenChoicesDone && node.next && (node.choices || []).length && !visibleChoices(node).length);
}
function shouldAutoAdvanceChoicesDone(node){
  return !!(choiceHubIsComplete(node) && isLastDialoguePage(node));
}
function resolveCompletedChoiceHub(id){
  let targetId = findNodeIdLoose(id);
  const visited = new Set();
  while(targetId && !visited.has(targetId)){
    visited.add(targetId);
    const target = scenario.nodes[targetId];
    if(!choiceHubIsComplete(target)) break;
    const nextId = findNodeIdLoose(target.next);
    if(!nextId) break;
    targetId = nextId;
  }
  return targetId;
}
function renderDialogue(node){
  const pages = dialoguePages(displayLineText(node.text || ""));
  if(state.dialoguePage >= pages.length) state.dialoguePage = Math.max(0, pages.length - 1);
  const isLastPage = state.dialoguePage >= pages.length - 1;
  els.speaker.textContent = displaySpeakerName(node.speaker) || "";
  els.line.textContent = pages[state.dialoguePage] || "";
  els.line.dataset.page = pages.length > 1 ? String(state.dialoguePage + 1) + " / " + String(pages.length) : "";
  els.next.classList.toggle("has-more-lines", !isLastPage);
  els.next.title = isLastPage ? "다음 장면" : "다음 대사";
  clear(els.choices);
  const choices = visibleChoices(node);
  const hasChoices = isLastPage && choices.length > 0;
  const hasNameEntry = isLastPage && (isNameInputNode(node) || isTerritoryInputNode(node));
  if(els.dialogue){
    els.dialogue.classList.toggle("has-visible-choices", hasChoices);
    els.dialogue.classList.toggle("has-name-entry", hasNameEntry);
  }
  if(!isLastPage) return;
  if(isNameInputNode(node)) renderNameInput();
  if(isTerritoryInputNode(node)) renderTerritoryNameInput();
  choices.forEach(function(choice){ const c = make("button", "choice", choice.text || "선택지"); c.type = "button"; c.addEventListener("click", function(){ selectChoice(choice); }); els.choices.appendChild(c); });
}
function renderNameInput(){
  const wrap = make("div", "name-entry");
  const inputEl = document.createElement("input");
  inputEl.type = "text";
  inputEl.maxLength = 12;
  inputEl.placeholder = "이름 입력";
  inputEl.value = state.playerName || "";
  const apply = button(state.playerName ? "이름 변경" : "이름 정하기", function(){
    const clean = inputEl.value.trim();
    if(!clean){ showToast("이름을 입력해 주세요."); inputEl.focus(); return; }
    savePlayerName(clean);
    showToast(clean + " 이름을 기억했습니다.");
    render();
  });
  inputEl.addEventListener("keydown", function(event){
    if(event.key === "Enter"){
      event.preventDefault();
      apply.click();
    }
  });
  wrap.appendChild(inputEl);
  wrap.appendChild(apply);
  els.choices.appendChild(wrap);
}
function renderTerritoryNameInput(){
  const wrap = make("div", "name-entry territory-entry");
  const inputEl = document.createElement("input");
  inputEl.type = "text";
  inputEl.maxLength = 16;
  inputEl.placeholder = "영지 이름 입력";
  inputEl.value = state.territoryName || "";
  const apply = button(state.territoryName ? "영지 이름 변경" : "영지 이름 정하기", function(){
    const clean = inputEl.value.trim();
    if(!clean){ showToast("영지 이름을 입력해 주세요."); inputEl.focus(); return; }
    saveTerritoryName(clean);
    showToast(clean + " 영지 이름을 기억했습니다.");
    render();
  });
  inputEl.addEventListener("keydown", function(event){
    if(event.key === "Enter"){
      event.preventDefault();
      apply.click();
    }
  });
  wrap.appendChild(inputEl);
  wrap.appendChild(apply);
  els.choices.appendChild(wrap);
}
function renderHud(){ const quest = scenario.quests[state.quest]; els.questTitle.textContent = quest ? quest.title : "-"; const max = Math.max(((quest && quest.steps) ? quest.steps.length : 1) - 1, 1); els.questProgress.style.width = Math.min(100, (state.progress / max) * 100) + "%"; clear(els.affection); Object.entries(scenario.characters).forEach(function(pair){ const id = pair[0]; const ch = pair[1]; const item = make("div", "affection-item"); item.appendChild(make("span", "", ch.name)); item.appendChild(make("strong", "", String(state.affection[id] || 0))); els.affection.appendChild(item); }); }
function applyEffects(node){ if(!node.effects) return; const key = state.nodeId + ":" + JSON.stringify(node.effects); if(state.appliedEffects.has(key)) return; state.appliedEffects.add(key); node.effects.forEach(function(effect){ if(effect.type === "affection"){ state.affection[effect.character] = (state.affection[effect.character] || 0) + Number(effect.amount || 0); showToast(effect.label || "호감도 변경"); } if(effect.type === "quest"){ state.quest = effect.quest || state.quest; state.progress = Number(effect.step || 0); showToast(effect.label || "퀘스트 진행 변경"); } if(effect.type === "flag"){ state.flags[effect.key] = effect.value !== false; } }); }
function next(){
  if(state.title){ startGame(); return; }
  const node = currentNode();
  if(!node) return;
  const pages = dialoguePages(displayLineText(node.text || ""));
  if(state.dialoguePage < pages.length - 1){
    state.dialoguePage += 1;
    render();
    return;
  }
  if(isNameInputNode(node) && !state.playerName){
    const nameInput = els.choices.querySelector(".name-entry input");
    const clean = nameInput ? nameInput.value.trim() : "";
    if(clean){
      savePlayerName(clean);
      showToast(clean + " 이름을 기억했습니다.");
      render();
      return;
    }
    showToast("이름을 입력해 주세요.");
    if(nameInput) nameInput.focus();
    return;
  }
  if(isTerritoryInputNode(node) && !state.territoryName){
    const territoryInput = els.choices.querySelector(".territory-entry input");
    const clean = territoryInput ? territoryInput.value.trim() : "";
    if(clean){
      saveTerritoryName(clean);
      showToast(clean + " 영지 이름을 기억했습니다.");
      render();
      return;
    }
    showToast("영지 이름을 입력해 주세요.");
    if(territoryInput) territoryInput.focus();
    return;
  }
  if(visibleChoices(node).length) return;
  if(node.next) goTo(node.next);
}
function goTo(id){
  const foundId = findNodeIdLoose(id);
  if(!foundId){
    showToast("이동할 장면을 찾을 수 없습니다: " + id);
    repairScenarioLinks(scenario);
    saveDraft();
    render();
    return;
  }
  const targetId = resolveCompletedChoiceHub(foundId) || foundId;
  const node = currentNode();
  if(node) state.log.push({ speaker: displaySpeakerName(node.speaker) || "", text: displayLineText(node.text || "") });
  state.nodeId = targetId;
  state.dialoguePage = 0;
  render();
}
function selectChoice(choice){ clearAuto(); if(!isLastDialoguePage(currentNode())) return; if(choice.reset){ resetGame(); return; } if(choice.action === "openLog"){ openPanel("log"); return; } if(choice.next) goTo(choice.next); }
function resetGame(){ resetRuntime(true); render(); }
function playCurrent(){ const node = currentNode(); state.title = false; state.titleStageMenu = false; state.dialoguePage = 0; state.background = node.bg || state.background; state.quest = node.quest || state.quest; state.progress = typeof node.progress === "number" ? node.progress : state.progress; state.characters = structuredClone(node.characters || []); state.appliedEffects = new Set(); render(); }
function openPanel(tab){ state.tab = tab || state.tab; els.panel.style.display = "block"; els.panel.style.visibility = "visible"; els.panel.style.pointerEvents = "auto"; els.panel.classList.add("open"); renderPanel(); }
function closePanel(){ if(els.panel){ els.panel.classList.remove("open"); els.panel.style.display = "none"; els.panel.style.visibility = "hidden"; els.panel.style.pointerEvents = "none"; } }
function togglePanel(tab){ if(els.panel.classList.contains("open") && (!tab || state.tab === tab)){ closePanel(); return; } openPanel(tab); }
function renderPanel(){
  document.querySelectorAll(".tabs button").forEach(function(b){ b.classList.toggle("active", b.dataset.tab === state.tab); });
  clear(els.panelContent);
  if(state.tab === "log"){
    if(!state.log.length) els.panelContent.appendChild(make("article", "info-entry", "아직 기록된 대화가 없습니다."));
    state.log.forEach(function(entry){ const a = make("article", "log-entry"); a.appendChild(make("strong", "", entry.speaker)); a.appendChild(make("span", "", entry.text)); els.panelContent.appendChild(a); });
  }
  if(state.tab === "quests"){
    Object.entries(scenario.quests).forEach(function(pair){
      const id = pair[0]; const q = pair[1];
      const a = make("article", "info-entry");
      a.appendChild(make("strong", "", q.title));
      a.appendChild(make("span", "", (q.steps || []).map(function(s, i){ return ((id === state.quest && i <= state.progress) ? "✓ " : "· ") + s; }).join("\n")));
      els.panelContent.appendChild(a);
    });
  }
  if(state.tab === "characters"){
    Object.entries(scenario.characters).forEach(function(pair){
      const id = pair[0]; const ch = pair[1];
      const a = make("article", "info-entry");
      a.appendChild(make("strong", "", ch.name + " · 호감도 " + (state.affection[id] || 0)));
      a.appendChild(make("span", "", ch.note));
      els.panelContent.appendChild(a);
    });
  }
}
function switchEditorTab(tabName){
  state.editorTab = tabName;
  renderEditor();
}
function renderUploadSyncStatus(){
  const className = "upload-sync " + (state.uploadSyncBusy ? "busy" : (state.uploadDirty ? "dirty" : "synced"));
  const text = make("div", "");
  const title = state.uploadSyncBusy ? "업로드 폴더 갱신 중..." : (state.uploadDirty ? "업로드 폴더 갱신 필요" : "업로드 폴더 최신");
  const message = state.uploadSyncMessage || (state.uploadSyncBusy ? "파일을 쓰는 중입니다. 잠시만 기다려 주세요." : (state.uploadDirty ? "GitHub에 올리기 전에 한 번 갱신해 주세요." : "마지막 갱신 이후 추가 수정이 없습니다."));
  const box = make("div", className);
  text.appendChild(make("strong", "", title));
  text.appendChild(make("span", "", message));
  box.appendChild(text);
  if(state.uploadDirty || state.uploadSyncBusy){
    const syncButton = button(state.uploadSyncBusy ? "진행 중" : "갱신", updateGithubUploadFolder);
    syncButton.disabled = state.uploadSyncBusy;
    box.appendChild(syncButton);
  }
  els.editorBody.appendChild(box);
}
function renderFileSaveStatus(){
  if(isPublishMode) return;
  const box = make("div", "file-save-status idle");
  box.id = "fileSaveStatus";
  const text = make("div", "");
  text.appendChild(make("strong", "", ""));
  text.appendChild(make("span", "", ""));
  box.appendChild(text);
  els.editorBody.appendChild(box);
  syncFileSaveStatusView();
}
function renderEditor(){
  document.querySelectorAll(".editor-tabs button").forEach(function(b){ b.classList.toggle("active", b.dataset.editorTab === state.editorTab); });
  clear(els.editorBody);
  renderFileSaveStatus();
  if(state.editorTab === "scene") renderSceneEditor();
  if(state.editorTab === "branch") renderBranchEditor();
  if(state.editorTab === "stats") renderStatsEditor();
  if(state.editorTab === "assets") renderAssetEditor();
  if(state.editorTab === "export") renderExportEditor();
}
function reviewStages(){
  if(!Array.isArray(scenario.reviewStages)) scenario.reviewStages = [];
  return scenario.reviewStages;
}
function migrateLegacyReviewCheckpoint(){
  if(reviewStages().length) return;
  try {
    const raw = localStorage.getItem(REVIEW_CHECKPOINT_KEY);
    if(!raw) return;
    const saved = JSON.parse(raw);
    if(!saved || !saved.nodeId) return;
    reviewStages().push({
      id: nextReviewStageId(),
      title: "이전 검수 포인트",
      memo: "이전 단일 검수 포인트에서 가져옴",
      createdAt: new Date().toISOString(),
      ...saved,
      log: []
    });
    localStorage.removeItem(REVIEW_CHECKPOINT_KEY);
    saveDraft(false);
  } catch {}
}
function nextReviewStageId(){
  let index = reviewStages().length + 1;
  let id = "stage_" + String(index).padStart(3, "0");
  const used = new Set(reviewStages().map(function(stage){ return stage.id; }));
  while(used.has(id)){
    index++;
    id = "stage_" + String(index).padStart(3, "0");
  }
  return id;
}
function reviewStageTitle(stage, index){
  return String(stage?.title || "스테이지 " + String((index || 0) + 1).padStart(2, "0")).trim();
}
function reviewStageSummary(stage){
  if(!stage) return "";
  const quest = scenario.quests[stage.quest];
  const questText = quest ? quest.title : (stage.quest || "-");
  const flagCount = Object.keys(stage.flags || {}).length;
  return "시작: " + (stage.nodeId || "-") + " / 퀘스트: " + questText + " / 완료 플래그 " + flagCount + "개";
}
function defaultReviewStageTitle(){
  const quest = scenario.quests[state.quest];
  const node = currentNode();
  const label = String(node?.memo || quest?.title || state.quest || state.nodeId).trim();
  return String(reviewStages().length + 1).padStart(2, "0") + ". " + label;
}
function reviewCheckpointSnapshot(){
  return {
    nodeId: state.nodeId,
    background: state.background,
    quest: state.quest,
    progress: state.progress,
    affection: structuredClone(state.affection || {}),
    flags: structuredClone(state.flags || {}),
    log: [],
    auto: false,
    title: false,
    dialoguePage: state.dialoguePage,
    appliedEffects: Array.from(state.appliedEffects || []),
    characters: structuredClone(state.characters || []),
    playerName: state.playerName || "",
    territoryName: state.territoryName || ""
  };
}
function saveReviewStage(title){
  const snapshot = reviewCheckpointSnapshot();
  const stage = {
    id: nextReviewStageId(),
    title: String(title || "").trim() || defaultReviewStageTitle(),
    memo: currentNode()?.memo || "",
    createdAt: new Date().toISOString(),
    ...snapshot
  };
  reviewStages().push(stage);
  saveDraft();
  showToast("검수 스테이지를 저장했습니다: " + stage.title);
  renderEditor();
  renderTitleScreen();
}
function updateReviewStage(index){
  const stages = reviewStages();
  const old = stages[index];
  if(!old) return;
  stages[index] = {
    ...old,
    ...reviewCheckpointSnapshot(),
    title: old.title || defaultReviewStageTitle(),
    memo: currentNode()?.memo || old.memo || "",
    updatedAt: new Date().toISOString()
  };
  saveDraft();
  showToast("검수 스테이지를 현재 위치로 갱신했습니다.");
  renderEditor();
  renderTitleScreen();
}
function restoreReviewStage(saved){
  if(!saved){ showToast("선택한 검수 스테이지를 찾을 수 없습니다."); return; }
  const nodeId = findNodeIdLoose(saved.nodeId);
  if(!nodeId){ showToast("검수 스테이지 장면을 찾을 수 없습니다: " + saved.nodeId); return; }
  state.nodeId = nodeId;
  state.background = saved.background || "field";
  state.quest = saved.quest || "intro";
  state.progress = Number(saved.progress || 0);
  state.affection = structuredClone(saved.affection || {});
  state.flags = structuredClone(saved.flags || {});
  state.log = structuredClone(saved.log || []);
  state.auto = false;
  state.title = false;
  state.titleStageMenu = false;
  state.dialoguePage = Number(saved.dialoguePage || 0);
  state.appliedEffects = new Set(saved.appliedEffects || []);
  state.characters = structuredClone(saved.characters || []);
  if(saved.playerName) savePlayerName(saved.playerName); else clearPlayerName();
  if(saved.territoryName) saveTerritoryName(saved.territoryName); else clearTerritoryName();
  closePanel();
  showToast("검수 스테이지부터 시작합니다: " + (saved.title || nodeId));
  render();
}
function restoreReviewStageById(id){
  const stage = reviewStages().find(function(item){ return item.id === id; });
  restoreReviewStage(stage);
}
function deleteReviewStage(index){
  const stages = reviewStages();
  if(!stages[index]) return;
  const removed = stages.splice(index, 1)[0];
  saveDraft();
  showToast("검수 스테이지를 삭제했습니다: " + reviewStageTitle(removed, index));
  renderEditor();
  renderTitleScreen();
}
function renderReviewCheckpointControls(){
  const box = make("div", "choice-editor manager-card review-checkpoint");
  box.appendChild(make("strong", "", "검수 스테이지"));
  box.appendChild(make("p", "muted", "팀원에게 공유할 시작 지점을 여러 개 저장합니다. 저장된 스테이지는 퍼블리싱 첫 화면의 스테이지 선택에 표시됩니다."));
  const createRow = make("div", "button-row stage-create-row");
  const titleInput = plainInput(defaultReviewStageTitle(), "스테이지 이름");
  createRow.appendChild(titleInput);
  createRow.appendChild(button("현재 지점을 스테이지로 저장", function(){ saveReviewStage(titleInput.value); }));
  box.appendChild(createRow);
  const stages = reviewStages();
  if(!stages.length){
    box.appendChild(make("p", "muted", "아직 저장된 검수 스테이지가 없습니다."));
  }
  stages.forEach(function(stage, index){
    const item = make("div", "review-stage-item");
    item.appendChild(draftTextField("스테이지 이름", false, reviewStageTitle(stage, index), function(v){
      stage.title = String(v || "").trim() || reviewStageTitle(stage, index);
      saveDraft();
      renderEditor();
      renderTitleScreen();
    }));
    item.appendChild(make("p", "muted", reviewStageSummary(stage)));
    const row = make("div", "button-row");
    row.appendChild(button("여기부터 시작", function(){ restoreReviewStage(stage); }));
    row.appendChild(button("현재 위치로 갱신", function(){ updateReviewStage(index); }));
    row.appendChild(button("삭제", function(){ deleteReviewStage(index); }));
    item.appendChild(row);
    box.appendChild(item);
  });
  els.editorBody.appendChild(box);
}
function renderSceneEditor(){
  const node = currentNode();
  renderReviewCheckpointControls();
  renderStoryStructureTools();
  els.editorBody.appendChild(field("장면 ID", select(nodeIds(), state.nodeId, setCurrentNode, undefined, nodeLabel)));
  els.editorBody.appendChild(draftTextField("장면 메모", false, node.memo || "", function(v){ setNodeField("memo", v.trim()); }));
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
  two.appendChild(instantField("다음 장면", select(nodeIds(), node.next || "", function(v){ setNodeField("next", v); }, "없음", nodeLabel)));
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
function choiceMode(choice){ return choice.reset ? "reset" : (choice.action || ""); }
function choiceActionSelect(selected, onChange){
  const el = document.createElement("select");
  [
    { value: "", label: "일반 이동" },
    { value: "openLog", label: "대화 로그 열기" },
    { value: "reset", label: "처음부터 다시 보기" }
  ].forEach(function(item){
    const opt = document.createElement("option");
    opt.value = item.value;
    opt.textContent = item.label;
    opt.selected = item.value === selected;
    el.appendChild(opt);
  });
  el.addEventListener("change", function(){ onChange(el.value); });
  return el;
}
function choiceCompleteSelect(selected, onChange){
  const el = document.createElement("select");
  [
    { value: "stay", label: "일반 분기" },
    { value: "auto", label: "남은 선택지 없으면 다음 장면으로" }
  ].forEach(function(item){
    const opt = document.createElement("option");
    opt.value = item.value;
    opt.textContent = item.label;
    opt.selected = item.value === selected;
    el.appendChild(opt);
  });
  el.addEventListener("change", function(){ onChange(el.value); });
  return el;
}
function applyChoiceMode(choice, mode){
  delete choice.action;
  delete choice.reset;
  if(mode === "openLog"){
    choice.action = "openLog";
    delete choice.next;
  } else if(mode === "reset"){
    choice.reset = true;
    delete choice.next;
  } else if(choice.next == null){
    choice.next = "";
  }
}
function renderBranchEditor(){
  const node = currentNode();
  els.editorBody.appendChild(make("div", "section-title", "선택지 분기"));
  els.editorBody.appendChild(make("p", "muted", "선택지는 일반 이동 외에도 대화 로그 열기, 처음부터 다시 보기 같은 특수 동작을 줄 수 있습니다."));
  els.editorBody.appendChild(instantField("분기 완료 후", choiceCompleteSelect(node.autoNextWhenChoicesDone ? "auto" : "stay", function(v){
    updateNode(function(n){
      if(v === "auto"){
        n.autoNextWhenChoicesDone = true;
        (n.choices || []).forEach(function(choice){ ensureChoiceCompletion(scenario, choice); });
      } else delete n.autoNextWhenChoicesDone;
    });
  })));
  els.editorBody.appendChild(make("p", "muted", node.autoNextWhenChoicesDone ? "모든 선택지를 완료하고 이 장면으로 돌아오면 다음 장면으로 바로 이어집니다." : "일반 분기처럼 선택지 장면을 그대로 표시합니다."));
  if(!node.choices || !node.choices.length) els.editorBody.appendChild(make("p", "muted", "선택지가 없는 직선 진행 장면입니다."));
  (node.choices || []).forEach(function(choice, index){
    const box = make("div", "choice-editor");
    box.appendChild(draftTextField("선택지 문구", false, choice.text || "", function(v){
      updateNode(function(n){ n.choices[index].text = v; });
    }));
    box.appendChild(instantField("동작", choiceActionSelect(choiceMode(choice), function(v){
      updateNode(function(n){ applyChoiceMode(n.choices[index], v); });
    })));
    if(!choice.reset && choice.action !== "openLog"){
      box.appendChild(instantField("이동 장면", select(nodeIds(), choice.next || "", function(v){
        updateNode(function(n){
          n.choices[index].next = v;
          if(n.autoNextWhenChoicesDone) ensureChoiceCompletion(scenario, n.choices[index]);
        });
      }, "없음", nodeLabel)));
      box.appendChild(draftTextField("선택 후 숨김 플래그", false, choice.hideIfFlag || "", function(v){
        updateNode(function(n){
          const clean = v.trim();
          if(clean){
            n.choices[index].hideIfFlag = clean;
            ensureChoiceCompletion(scenario, n.choices[index]);
          } else delete n.choices[index].hideIfFlag;
        });
      }));
      const choiceSceneRow = make("div", "button-row");
      choiceSceneRow.appendChild(button(choice.next ? "이 선택지 앞에 장면 삽입" : "이 선택지에 새 장면 연결", function(){
        insertChoiceNode(index);
      }));
      box.appendChild(choiceSceneRow);
    } else {
      box.appendChild(make("p", "muted", choice.reset ? "선택하면 게임을 처음부터 다시 시작합니다." : "선택하면 대화 로그 패널을 엽니다."));
    }
    const orderRow = make("div", "button-row");
    orderRow.appendChild(button("위로", function(){
      if(index <= 0) return;
      updateNode(function(n){ const moved = n.choices.splice(index, 1)[0]; n.choices.splice(index - 1, 0, moved); });
    }));
    orderRow.appendChild(button("아래로", function(){
      updateNode(function(n){ if(index >= n.choices.length - 1) return; const moved = n.choices.splice(index, 1)[0]; n.choices.splice(index + 1, 0, moved); });
    }));
    orderRow.appendChild(button("선택지 삭제", function(){
      updateNode(function(n){ n.choices.splice(index, 1); if(!n.choices.length) delete n.choices; });
    }));
    box.appendChild(orderRow);
    els.editorBody.appendChild(box);
  });
  const branchRow = make("div", "button-row");
  branchRow.appendChild(button("선택지 추가", function(){
    updateNode(function(n){
      n.choices = n.choices || [];
      const choice = { text: "새 선택지", next: n.next || "" };
      n.choices.push(choice);
      if(n.autoNextWhenChoicesDone) ensureChoiceCompletion(scenario, choice);
    });
  }));
  branchRow.appendChild(button("분기 장면 추가", addBranchNode));
  els.editorBody.appendChild(branchRow);
}
function renderStatsEditor(){
  const node = currentNode();
  els.editorBody.appendChild(make("div", "section-title", "현재 장면 효과"));
  if(!node.effects || !node.effects.length) els.editorBody.appendChild(make("p", "muted", "아직 적용 효과가 없습니다."));
  (node.effects || []).forEach(function(effect, index){
    const box = make("div", "choice-editor");
    box.appendChild(make("strong", "", effect.type === "quest" ? "퀘스트 효과" : "호감도 효과"));
    if(effect.type === "quest"){
      box.appendChild(field("퀘스트", select(questIds(), effect.quest || "", function(v){ updateNode(function(n){ n.effects[index].quest = v; }); })));
      box.appendChild(field("단계", input(String(effect.step || 0), function(v){ updateNode(function(n){ n.effects[index].step = Number(v || 0); }); }, "number")));
    } else {
      box.appendChild(field("대상", select(charIds(), effect.character || charIds()[0], function(v){ updateNode(function(n){ n.effects[index].character = v; }); })));
      box.appendChild(field("증감", input(String(effect.amount || 0), function(v){ updateNode(function(n){ n.effects[index].amount = Number(v || 0); }); }, "number")));
    }
    box.appendChild(field("표시 문구", input(effect.label || "", function(v){ updateNode(function(n){ n.effects[index].label = v; }); })));
    box.appendChild(button("효과 삭제", function(){ updateNode(function(n){ n.effects.splice(index, 1); if(!n.effects.length) delete n.effects; }); }));
    els.editorBody.appendChild(box);
  });
  const row = make("div", "button-row");
  row.appendChild(button("호감도 효과 추가", function(){ updateNode(function(n){ n.effects = n.effects || []; n.effects.push({ type: "affection", character: charIds()[0], amount: 1, label: "호감도 +1" }); }); }));
  row.appendChild(button("퀘스트 효과 추가", function(){ updateNode(function(n){ n.effects = n.effects || []; n.effects.push({ type: "quest", quest: state.quest || questIds()[0], step: state.progress, label: "퀘스트 진행" }); }); }));
  els.editorBody.appendChild(row);

  els.editorBody.appendChild(make("div", "section-title", "퀘스트 관리"));
  els.editorBody.appendChild(make("p", "muted", "퀘스트는 제목과 단계 목록으로 구성됩니다. 장면 탭에서 현재 퀘스트와 진행 단계를 선택하면 HUD와 퀘스트 로그에 표시됩니다."));
  Object.entries(scenario.quests).forEach(function(pair){
    const id = pair[0]; const quest = pair[1];
    const box = make("div", "choice-editor manager-card");
    box.appendChild(make("strong", "", id + " · " + quest.title));
    box.appendChild(draftTextField("퀘스트 제목", false, quest.title || "", function(v){ scenario.quests[id].title = v.trim() || id; saveDraft(); render(); }));
    box.appendChild(draftTextField("단계 목록", true, (quest.steps || []).join("\n"), function(v){ scenario.quests[id].steps = stepLines(v); saveDraft(); render(); }));
    box.appendChild(button("퀘스트 삭제", function(){ deleteQuest(id); }));
    els.editorBody.appendChild(box);
  });
  const addBox = make("div", "choice-editor manager-card");
  addBox.appendChild(make("strong", "", "새 퀘스트 추가"));
  const qId = plainInput("", "quest_id");
  const qTitle = plainInput("", "퀘스트 제목");
  const qSteps = plainTextarea("", "단계를 한 줄에 하나씩 입력", 4);
  addBox.appendChild(field("퀘스트 ID", qId));
  addBox.appendChild(field("제목", qTitle));
  addBox.appendChild(field("단계", qSteps));
  addBox.appendChild(button("퀘스트 추가", function(){ addQuest(qId.value, qTitle.value, qSteps.value); }));
  els.editorBody.appendChild(addBox);

  els.editorBody.appendChild(make("div", "section-title", "테스트용 현재 호감도"));
  charIds().forEach(function(id){
    const wrap = make("label", "field range-field");
    wrap.appendChild(make("span", "", scenario.characters[id].name));
    const r = document.createElement("input"); r.type = "range"; r.min = 0; r.max = 10; r.value = state.affection[id] || 0;
    const val = make("strong", "", String(r.value));
    r.addEventListener("input", function(){ state.affection[id] = Number(r.value); val.textContent = r.value; renderHud(); });
    wrap.appendChild(r); wrap.appendChild(val); els.editorBody.appendChild(wrap);
  });
}
function renderAssetEditor(){
  els.editorBody.appendChild(make("div", "section-title", "배경 이미지"));
  bgIds().forEach(function(id){ els.editorBody.appendChild(field(id, input(scenario.assets.backgrounds[id] || "", function(v){ scenario.assets.backgrounds[id] = v; saveDraft(); render(); }))); });
  const row = make("div", "button-row");
  const newBg = input("", function(){}); newBg.placeholder = "새 배경 ID";
  row.appendChild(newBg);
  row.appendChild(button("배경 추가", function(){ const id = cleanId(newBg.value, "bg"); if(!id) return; scenario.assets.backgrounds[uniqueKey(scenario.assets.backgrounds, id)] = "./assets/새배경.png"; saveDraft(); render(); }));
  els.editorBody.appendChild(row);

  els.editorBody.appendChild(make("div", "section-title", "인물 관리"));
  els.editorBody.appendChild(make("p", "muted", "인물은 이름, 설명, 이미지 경로로 구성됩니다. 장면 탭의 등장 캐릭터와 수치 탭의 호감도 효과에서 사용됩니다."));
  charIds().forEach(function(id){
    const character = scenario.characters[id];
    const box = make("div", "choice-editor manager-card");
    box.appendChild(make("strong", "", id + " · " + (character.name || id)));
    box.appendChild(draftTextField("인물 이름", false, character.name || "", function(v){ scenario.characters[id].name = v.trim() || id; saveDraft(); render(); }));
    box.appendChild(draftTextField("인물 설명", true, character.note || "", function(v){ scenario.characters[id].note = v; saveDraft(); render(); }));
    box.appendChild(field("이미지", input(scenario.assets.characters[id] || "", function(v){ scenario.assets.characters[id] = v; saveDraft(); render(); })));
    box.appendChild(button("인물 삭제", function(){ deleteCharacter(id); }));
    els.editorBody.appendChild(box);
  });
  const addBox = make("div", "choice-editor manager-card");
  addBox.appendChild(make("strong", "", "새 인물 추가"));
  const cId = plainInput("", "character_id");
  const cName = plainInput("", "이름");
  const cNote = plainTextarea("", "설명", 3);
  const cImage = plainInput("", "./assets/char-name.png");
  addBox.appendChild(field("인물 ID", cId));
  addBox.appendChild(field("이름", cName));
  addBox.appendChild(field("설명", cNote));
  addBox.appendChild(field("이미지", cImage));
  addBox.appendChild(button("인물 추가", function(){ addCharacter(cId.value, cName.value, cNote.value, cImage.value); }));
  els.editorBody.appendChild(addBox);

  const prev = make("div", "asset-preview");
  const img = document.createElement("img"); img.src = assetUrl(scenario.assets.backgrounds[state.background] || ""); prev.appendChild(img);
  els.editorBody.appendChild(prev);
  els.editorBody.appendChild(make("p", "muted", "이미지는 ./assets/파일명.png 또는 웹 주소로 바꿀 수 있습니다."));
}
function addQuest(rawId, title, steps){
  const id = uniqueKey(scenario.quests, cleanId(rawId || title, "quest"));
  scenario.quests[id] = { title: String(title || id).trim() || id, steps: stepLines(steps) };
  if(!scenario.quests[id].steps.length) scenario.quests[id].steps = ["새 단계"];
  saveDraft(); render(); showToast("퀘스트를 추가했습니다: " + id);
}
function deleteQuest(id){
  const inUse = Object.values(scenario.nodes).some(function(node){ return node.quest === id || (node.effects || []).some(function(effect){ return effect.quest === id; }); });
  if(inUse){ showToast("사용 중인 퀘스트는 삭제할 수 없습니다."); return; }
  delete scenario.quests[id];
  if(state.quest === id) state.quest = questIds()[0] || "";
  saveDraft(); render(); showToast("퀘스트를 삭제했습니다.");
}
function addCharacter(rawId, name, note, image){
  const id = uniqueKey(scenario.characters, cleanId(rawId || name, "character"));
  scenario.characters[id] = { name: String(name || id).trim() || id, note: String(note || "") };
  scenario.assets.characters[id] = String(image || "./assets/char-" + id + ".png").trim();
  saveDraft(); render(); showToast("인물을 추가했습니다: " + id);
}
function deleteCharacter(id){
  const inUse = Object.values(scenario.nodes).some(function(node){
    return (node.characters || []).some(function(ch){ return ch.id === id; }) || (node.effects || []).some(function(effect){ return effect.character === id; });
  });
  if(inUse){ showToast("사용 중인 인물은 삭제할 수 없습니다."); return; }
  delete scenario.characters[id];
  delete scenario.assets.characters[id];
  delete state.affection[id];
  saveDraft(); render(); showToast("인물을 삭제했습니다.");
}
function appendPublishControls(){
  const publishRow = make("div", "button-row");
  publishRow.appendChild(button("결과만 보기", openPublishedView));
  publishRow.appendChild(button("공유 링크 복사", copyPublishedLink));
  els.editorBody.appendChild(publishRow);
}
function scenarioJsText(){
  return "window.FARM_VILLAGE_SCENARIO = " + JSON.stringify(scenario, null, 2) + ";\n";
}
function exportScenarioJs(){
  downloadText("scenario.js", scenarioJsText(), "text/javascript;charset=utf-8");
  showToast("GitHub용 scenario.js를 다운로드했습니다.");
}
async function fetchFreshText(path){
  const res = await fetch(path + (path.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(APP_VERSION), { cache: "reload" });
  if(!res.ok) throw new Error(path + " 파일을 읽지 못했습니다.");
  return res.text();
}
async function writeTextHandle(dirHandle, filename, text){
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(text);
  await writable.close();
}
async function writeBlobHandle(dirHandle, filename, blob){
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}
function bundleAssetSources(){
  const sources = new Set();
  if(scenario.titleImage) sources.add(scenario.titleImage);
  Object.values(scenario.assets?.backgrounds || {}).forEach(function(src){ if(src) sources.add(src); });
  Object.values(scenario.assets?.characters || {}).forEach(function(src){ if(src) sources.add(src); });
  return Array.from(sources);
}
function localAssetFilename(src){
  try {
    const url = new URL(src, window.location.href);
    const parts = url.pathname.split("/");
    const assetsIndex = parts.lastIndexOf("assets");
    if(assetsIndex < 0) return "";
    return decodeURIComponent(parts[parts.length - 1] || "");
  } catch {
    return "";
  }
}
async function writeBundleAssets(rootHandle){
  const assetsHandle = await rootHandle.getDirectoryHandle("assets", { create: true });
  const missing = [];
  let count = 0;
  const sources = bundleAssetSources();
  for(let index = 0; index < sources.length; index++){
    const src = sources[index];
    const filename = localAssetFilename(src);
    if(!filename) continue;
    try {
      state.uploadSyncMessage = "이미지 복사 중: " + filename + " (" + String(index + 1) + "/" + String(sources.length) + ")";
      renderEditor();
      const res = await fetch(assetUrl(src), { cache: "reload" });
      if(!res.ok) throw new Error("missing");
      await writeBlobHandle(assetsHandle, filename, await res.blob());
      count++;
    } catch {
      missing.push(filename);
    }
  }
  return { count: count, missing: missing };
}
async function updateGithubUploadFolder(){
  if(!window.showDirectoryPicker){
    exportScenarioJs();
    state.uploadSyncMessage = "이 브라우저에서는 폴더 직접 갱신이 안 되어 scenario.js만 다운로드했습니다.";
    renderEditor();
    showToast("이 브라우저에서는 폴더 직접 갱신이 안 되어 scenario.js만 다운로드했습니다.");
    return;
  }
  try {
    const rootHandle = await window.showDirectoryPicker({ id: "isekai-farm-github-pages-upload", mode: "readwrite" });
    setUploadSyncState({ busy: true, message: "기본 파일을 갱신하는 중입니다." });
    const dataHandle = await rootHandle.getDirectoryHandle("data", { create: true });
    state.uploadSyncMessage = "index.html을 갱신하는 중입니다.";
    renderEditor();
    await writeTextHandle(rootHandle, "index.html", await fetchFreshText("./index.html"));
    state.uploadSyncMessage = "app.js를 갱신하는 중입니다.";
    renderEditor();
    await writeTextHandle(rootHandle, "app.js", await fetchFreshText("./app.js"));
    state.uploadSyncMessage = "styles.css를 갱신하는 중입니다.";
    renderEditor();
    await writeTextHandle(rootHandle, "styles.css", await fetchFreshText("./styles.css"));
    state.uploadSyncMessage = "scenario.js를 갱신하는 중입니다.";
    renderEditor();
    await writeTextHandle(dataHandle, "scenario.js", scenarioJsText());
    const assetResult = await writeBundleAssets(rootHandle);
    const suffix = assetResult.missing.length ? " 이미지 " + assetResult.missing.length + "개는 확인이 필요합니다." : " 이미지 " + assetResult.count + "개 포함.";
    setUploadSyncState({ dirty: false, busy: false, message: "갱신 완료. GitHub 업로드 폴더를 최신으로 맞췄습니다. " + suffix });
    showToast("갱신 완료. GitHub 업로드 폴더를 최신으로 맞췄습니다. " + suffix, 3800);
  } catch (error) {
    if(error && error.name === "AbortError"){
      setUploadSyncState({ busy: false, dirty: true, message: "폴더 선택이 완료되지 않았습니다. 상위 RedBound 폴더에서 github-pages-upload를 한 번 선택한 뒤 '폴더 선택'을 눌러 주세요." });
      return;
    }
    const detail = error && error.message ? " (" + error.message + ")" : "";
    setUploadSyncState({ busy: false, dirty: true, message: "갱신 실패. 폴더 선택이나 권한을 다시 확인해 주세요." + detail });
    showToast("갱신 실패. 폴더 선택이나 권한을 다시 확인해 주세요.", 4200);
  }
}
function crc32(bytes){
  if(!crc32.table){
    crc32.table = Array.from({ length: 256 }, function(_, n){
      let c = n;
      for(let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      return c >>> 0;
    });
  }
  let crc = 0xffffffff;
  for(let i = 0; i < bytes.length; i++) crc = crc32.table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function push16(out, value){ out.push(value & 255, (value >>> 8) & 255); }
function push32(out, value){ out.push(value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255); }
function concatBytes(parts){
  const size = parts.reduce(function(total, part){ return total + part.length; }, 0);
  const result = new Uint8Array(size);
  let offset = 0;
  parts.forEach(function(part){ result.set(part, offset); offset += part.length; });
  return result;
}
function zipTimestamp(){
  const now = new Date();
  return {
    time: (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2),
    date: ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()
  };
}
function makeZipBlob(files){
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  const stamp = zipTimestamp();
  files.forEach(function(file){
    const nameBytes = encoder.encode(file.path.replace(/\\/g, "/"));
    const data = file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data);
    const checksum = crc32(data);
    const local = [];
    push32(local, 0x04034b50);
    push16(local, 20);
    push16(local, 0x0800);
    push16(local, 0);
    push16(local, stamp.time);
    push16(local, stamp.date);
    push32(local, checksum);
    push32(local, data.length);
    push32(local, data.length);
    push16(local, nameBytes.length);
    push16(local, 0);
    const localBytes = concatBytes([new Uint8Array(local), nameBytes, data]);
    chunks.push(localBytes);

    const header = [];
    push32(header, 0x02014b50);
    push16(header, 20);
    push16(header, 20);
    push16(header, 0x0800);
    push16(header, 0);
    push16(header, stamp.time);
    push16(header, stamp.date);
    push32(header, checksum);
    push32(header, data.length);
    push32(header, data.length);
    push16(header, nameBytes.length);
    push16(header, 0);
    push16(header, 0);
    push16(header, 0);
    push16(header, 0);
    push32(header, 0);
    push32(header, offset);
    central.push(concatBytes([new Uint8Array(header), nameBytes]));
    offset += localBytes.length;
  });
  const centralStart = offset;
  central.forEach(function(part){ chunks.push(part); offset += part.length; });
  const end = [];
  push32(end, 0x06054b50);
  push16(end, 0);
  push16(end, 0);
  push16(end, files.length);
  push16(end, files.length);
  push32(end, offset - centralStart);
  push32(end, centralStart);
  push16(end, 0);
  chunks.push(new Uint8Array(end));
  return new Blob(chunks, { type: "application/zip" });
}
function downloadBlob(filename, blob){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 500);
}
async function downloadGithubUploadZip(){
  try {
    setUploadSyncState({ busy: true, message: "GitHub 업로드 ZIP을 만드는 중입니다." });
    const encoder = new TextEncoder();
    const files = [
      { path: "index.html", data: encoder.encode(await fetchFreshText("./index.html")) },
      { path: "app.js", data: encoder.encode(await fetchFreshText("./app.js")) },
      { path: "styles.css", data: encoder.encode(await fetchFreshText("./styles.css")) },
      { path: "data/scenario.js", data: encoder.encode(scenarioJsText()) }
    ];
    const missing = [];
    const sources = bundleAssetSources();
    for(let index = 0; index < sources.length; index++){
      const src = sources[index];
      const filename = localAssetFilename(src);
      if(!filename) continue;
      try {
        state.uploadSyncMessage = "ZIP에 이미지 담는 중: " + filename + " (" + String(index + 1) + "/" + String(sources.length) + ")";
        renderEditor();
        const res = await fetch(assetUrl(src), { cache: "reload" });
        if(!res.ok) throw new Error("missing");
        files.push({ path: "assets/" + filename, data: new Uint8Array(await res.arrayBuffer()) });
      } catch {
        missing.push(filename);
      }
    }
    downloadBlob("github-pages-upload.zip", makeZipBlob(files));
    const suffix = missing.length ? " 이미지 " + missing.length + "개는 확인이 필요합니다." : " 이미지 " + String(files.length - 4) + "개 포함.";
    setUploadSyncState({ busy: false, dirty: true, message: "ZIP 다운로드 완료. 압축을 풀어 GitHub에 올려 주세요. " + suffix });
    showToast("ZIP 다운로드 완료. 압축을 풀어 GitHub에 올려 주세요.", 4200);
  } catch (error) {
    const detail = error && error.message ? " (" + error.message + ")" : "";
    setUploadSyncState({ busy: false, dirty: true, message: "ZIP 다운로드 실패. 다시 시도해 주세요." + detail });
    showToast("ZIP 다운로드 실패. 다시 시도해 주세요.", 4200);
  }
}
function renderExportEditor(){
  els.editorBody.appendChild(make("div", "section-title", "미리보기 / 공유"));
  const previewRow = make("div", "button-row");
  previewRow.appendChild(button("결과만 보기", openPublishedView));
  previewRow.appendChild(button("공유 링크 복사", copyPublishedLink));
  els.editorBody.appendChild(previewRow);

  els.editorBody.appendChild(make("div", "section-title", "엑셀 / CSV"));
  const excelRow = make("div", "button-row");
  excelRow.appendChild(button("엑셀 양식 내보내기", exportScenarioExcel));
  excelRow.appendChild(button("엑셀/CSV 가져오기", openScenarioImport));
  els.editorBody.appendChild(excelRow);

  const csvRow = make("div", "button-row");
  csvRow.appendChild(button("CSV 내보내기", exportScenarioCsv));
  els.editorBody.appendChild(csvRow);
  els.editorBody.appendChild(make("p", "muted", "엑셀에서 장면ID, 화자, 대사, 배경, 다음장면, 퀘스트, 진행단계, 분기완료를 수정한 뒤 다시 가져올 수 있습니다. 등장캐릭터는 lord:left; liddy:right, 선택지는 문구 -> 장면ID 형식으로 입력합니다. 올클리어 분기는 분기완료에 auto를 입력합니다."));

  els.editorBody.appendChild(make("div", "section-title", "GitHub 업로드"));
  els.editorBody.appendChild(make("p", "muted upload-guide", "상단에 파일 저장 완료가 보이면 RedBound 폴더가 최신입니다.\nGitHub에는 index.html, app.js, styles.css, data 폴더, assets 폴더를 올리면 됩니다."));
}

const SCENARIO_COLUMNS = ["장면ID", "메모", "화자", "대사", "배경", "다음장면", "퀘스트", "진행단계", "등장캐릭터", "선택지", "분기완료", "효과"];
function escapeHtml(value){ return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function sceneRows(sourceScenario){
  const source = sourceScenario || reindexScenarioCopy(scenario).scenario;
  return Object.entries(source.nodes).map(function(pair){
    const id = pair[0];
    const node = pair[1];
    return {
      "장면ID": id,
      "메모": node.memo || "",
      "화자": node.speaker || "",
      "대사": node.text || "",
      "배경": node.bg || "",
      "다음장면": node.next || "",
      "퀘스트": node.quest || "",
      "진행단계": typeof node.progress === "number" ? String(node.progress) : "",
      "등장캐릭터": formatCharacters(node.characters),
      "선택지": formatChoices(node.choices),
      "분기완료": node.autoNextWhenChoicesDone ? "auto" : "",
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
function formatChoiceTarget(choice){
  if(choice.reset) return "@reset";
  if(choice.action) return "@" + choice.action;
  return choice.next || "";
}
function parseChoiceTarget(text, target){
  const clean = String(target || "").trim();
  const lower = clean.replace(/^@/, "").toLowerCase();
  if(lower === "reset" || lower === "??") return { text: text, reset: true };
  if(lower === "openlog" || lower === "log" || lower === "????" || lower === "action:openlog") return { text: text, action: "openLog" };
  return { text: text, next: clean };
}
function formatChoices(choices){ return (choices || []).map(function(choice){ return (choice.text || "") + " -> " + formatChoiceTarget(choice); }).join("; "); }
function parseChoices(value){
  return String(value || "").split(";").map(function(part){
    const text = part.trim();
    if(!text) return null;
    const arrow = text.includes("->") ? "->" : (text.includes("=>") ? "=>" : null);
    if(!arrow) return { text: text, next: "" };
    const pieces = text.split(arrow);
    return parseChoiceTarget((pieces[0] || "").trim(), pieces.slice(1).join(arrow));
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
    setOptional(node, "memo", cell(row, index, "메모"));
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
    const completion = cell(row, index, "분기완료").toLowerCase();
    if(completion === "auto" || completion === "all" || completion === "올클리어") node.autoNextWhenChoicesDone = true;
    else delete node.autoNextWhenChoicesDone;
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
function nextSequentialSceneId(){
  let i = nodeIds().length + 1;
  let id = "scene_" + String(i).padStart(3, "0");
  while(scenario.nodes[id]){
    i++;
    id = "scene_" + String(i).padStart(3, "0");
  }
  return id;
}
function makeContinuationNode(fromNode, nextId){
  const node = {
    speaker: fromNode?.speaker || "화면",
    text: "새 장면입니다."
  };
  if(nextId) node.next = nextId;
  if(fromNode?.bg) node.bg = fromNode.bg;
  if(fromNode?.quest) node.quest = fromNode.quest;
  if(typeof fromNode?.progress === "number") node.progress = fromNode.progress;
  if(fromNode?.characters) node.characters = structuredClone(fromNode.characters);
  return node;
}
function addNode(){
  const previousId = state.nodeId;
  const previousNode = currentNode();
  if(previousNode && previousNode.choices && previousNode.choices.length){
    showToast("선택지가 있는 장면은 분기 탭의 선택지 추가를 사용해 주세요.");
    return;
  }
  const oldNext = previousNode?.next || "";
  const newId = nextSequentialSceneId();
  scenario.nodes[newId] = makeContinuationNode(previousNode, oldNext);
  if(previousNode) previousNode.next = newId;
  saveDraft();
  setCurrentNode(newId);
  showToast(previousId + " -> " + newId + (oldNext ? " -> " + oldNext : "") + " 흐름으로 연결했습니다.");
}
function insertChoiceNode(choiceIndex){
  const node = currentNode();
  if(!node || !node.choices || !node.choices[choiceIndex]) return;
  const choice = node.choices[choiceIndex];
  if(choice.reset || choice.action === "openLog"){
    showToast("특수 동작 선택지는 장면을 연결하지 않습니다.");
    return;
  }
  const oldNext = choice.next || "";
  const newId = nextSequentialSceneId();
  scenario.nodes[newId] = makeContinuationNode(node, oldNext);
  choice.next = newId;
  if(node.autoNextWhenChoicesDone) ensureChoiceCompletion(scenario, choice);
  saveDraft();
  state.editorTab = "scene";
  setCurrentNode(newId);
  showToast((choice.text || "선택지") + " -> " + newId + (oldNext ? " -> " + oldNext : "") + " 흐름으로 연결했습니다.");
}
function addBranchNode(){
  const node = currentNode();
  if(!node) return;
  const newId = nextSequentialSceneId();
  scenario.nodes[newId] = makeContinuationNode(node, node.next || "");
  node.choices = node.choices || [];
  const choice = { text: "새 분기", next: newId };
  node.choices.push(choice);
  if(node.autoNextWhenChoicesDone) ensureChoiceCompletion(scenario, choice);
  saveDraft();
  state.editorTab = "branch";
  setCurrentNode(newId);
  showToast("새 분기 선택지와 " + newId + " 장면을 만들었습니다.");
}
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
function showToast(message, duration){ const toast = make("div", "toast", message); document.body.appendChild(toast); requestAnimationFrame(function(){ toast.classList.add("show"); }); window.setTimeout(function(){ toast.classList.remove("show"); window.setTimeout(function(){ toast.remove(); }, 220); }, duration || 1500); }
els.backdrop.addEventListener("load", function(){ els.backdrop.classList.add("loaded"); });
els.next.addEventListener("click", next);
if(els.start) els.start.addEventListener("click", startGame);
if(els.stageSelect) els.stageSelect.addEventListener("click", function(){ state.titleStageMenu = true; renderTitleScreen(); });
if(els.stageBack) els.stageBack.addEventListener("click", function(){ state.titleStageMenu = false; renderTitleScreen(); });
document.querySelector(".dialogue").addEventListener("click", function(event){
  const interactive = event.target.closest("button, input, textarea, select, label, .name-entry, .choice");
  if(interactive) return;
  next();
});
els.auto.addEventListener("click", function(){ state.auto = !state.auto; els.auto.classList.toggle("active", state.auto); scheduleAuto(); });
els.log.addEventListener("click", function(){ togglePanel("log"); });
els.reset.addEventListener("click", resetGame);
els.closeLog.addEventListener("click", function(event){ event.preventDefault(); event.stopPropagation(); closePanel(); });
els.playCurrent.addEventListener("click", playCurrent);
if(els.saveFile) els.saveFile.addEventListener("click", saveScenarioNow);
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
migrateLegacyReviewCheckpoint();
if(draftScenario && !publishedScenario) saveDraft(false);
render();
