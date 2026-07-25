import { formatIssues, validateDeck } from "../core/schema.js";
import { serializeDeck } from "../core/compile.js";
import { LAYOUT_SCHEMA } from "../player/player.js";

export function attachEditor(player) {
  const panel = player.panel;
  const sliders = panel.querySelector(".pz-sliders");
  const sceneName = panel.querySelector(".pz-panel-scene");
  const fileInput = panel.querySelector(".pz-file-input");
  const modal = player.shell.querySelector(".pz-modal");
  const textarea = modal.querySelector("textarea");
  const modalError = modal.querySelector(".pz-modal-error");
  const undoStack = [];
  const redoStack = [];
  let editStartSnapshot = null;
  let sliderStartSnapshot = null;

  function snapshot() {
    return serializeDeck(player.compiled);
  }

  function restore(serialized, message) {
    const state = { sceneId: player.currentScene()?.id, beatIndex: player.beatIndex };
    player.loadDeck(JSON.parse(serialized));
    const sceneIndex = player.compiled.scenes.findIndex((scene) => scene.id === state.sceneId);
    if (sceneIndex >= 0) player.goScene(sceneIndex, {
      beat: Math.min(state.beatIndex, player.compiled.scenes[sceneIndex].beats.length - 1),
      snap: true
    });
    player.setEditorOpen(true);
    player.toast(message);
  }

  function commit(previous, label) {
    if (!previous || previous === snapshot()) return;
    undoStack.push(previous);
    redoStack.length = 0;
    updateButtons();
    player.toast(`${label} saved`);
  }

  function updateButtons() {
    panel.querySelector('[data-editor-action="undo"]').disabled = undoStack.length === 0;
    panel.querySelector('[data-editor-action="redo"]').disabled = redoStack.length === 0;
  }

  function refresh() {
    const scene = player.currentScene();
    sceneName.textContent = player.overview ? "overview — choose a scene to edit" : `scene: ${scene.id}`;
    sliders.replaceChildren();
    if (player.overview) return;
    for (const [key, min, max, step, label] of LAYOUT_SCHEMA) {
      const row = document.createElement("div");
      row.className = "pz-slider";
      const labelElement = document.createElement("label");
      const text = document.createElement("span");
      const output = document.createElement("output");
      const input = document.createElement("input");
      text.textContent = label;
      output.textContent = String(scene.layout[key]);
      input.type = "range";
      input.min = String(min);
      input.max = String(max);
      input.step = String(step);
      input.value = String(scene.layout[key]);
      input.addEventListener("pointerdown", () => {
        sliderStartSnapshot = snapshot();
      });
      input.addEventListener("input", () => {
        const value = Number(input.value);
        scene.layout[key] = value;
        const deckScene = player.compiled.deck.scenes.find((candidate) => candidate.id === scene.id);
        deckScene.layout = { ...(deckScene.layout ?? {}), [key]: value };
        output.textContent = input.value;
        player.fitCurrent();
      });
      input.addEventListener("change", () => {
        commit(sliderStartSnapshot, label);
        sliderStartSnapshot = null;
      });
      labelElement.append(text, output);
      row.append(labelElement, input);
      sliders.appendChild(row);
    }
    updateButtons();
  }

  player.addEventListener("scenechange", refresh);
  player.addEventListener("editormode", refresh);
  player.addEventListener("editstart", () => {
    editStartSnapshot = snapshot();
  });
  player.addEventListener("editcommit", () => {
    commit(editStartSnapshot, "position");
    editStartSnapshot = null;
  });
  player.addEventListener("deckchange", refresh);

  panel.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-editor-action]")?.dataset.editorAction;
    if (!action) return;
    if (action === "undo" && undoStack.length) {
      redoStack.push(snapshot());
      restore(undoStack.pop(), "Undid last edit");
    } else if (action === "redo" && redoStack.length) {
      undoStack.push(snapshot());
      restore(redoStack.pop(), "Redid edit");
    } else if (action === "fit") {
      player.freeCamera = false;
      player.fitCurrent({ snap: player.reducedMotion });
      player.toast("Scene fitted");
    } else if (action === "copy") {
      try {
        await navigator.clipboard.writeText(snapshot());
        player.toast("Deck JSON copied");
      } catch {
        openModal();
      }
    } else if (action === "view") {
      openModal();
    } else if (action === "load") {
      fileInput.click();
    } else if (action === "download") {
      const blob = new Blob([snapshot()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${player.compiled.meta.slug ?? "deck"}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      player.toast("Deck downloaded");
    }
  });

  function openModal() {
    textarea.value = snapshot();
    modalError.textContent = "";
    modal.hidden = false;
    textarea.focus();
  }

  function closeModal() {
    modal.hidden = true;
    modalError.textContent = "";
    player.controls.edit.focus();
  }

  modal.querySelector('[data-modal-action="close"]').addEventListener("click", closeModal);
  modal.querySelector('[data-modal-action="apply"]').addEventListener("click", () => {
    try {
      const deck = JSON.parse(textarea.value);
      const result = validateDeck(deck);
      if (!result.valid) {
        modalError.textContent = formatIssues(result.issues);
        return;
      }
      undoStack.push(snapshot());
      redoStack.length = 0;
      player.loadDeck(deck);
      player.setEditorOpen(true);
      modal.hidden = true;
      player.toast("Validated deck loaded");
    } catch (error) {
      modalError.textContent = `JSON parse error: ${error.message}`;
    }
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) {
      player.toast("Deck rejected: file exceeds 5 MB");
      return;
    }
    try {
      const deck = JSON.parse(await file.text());
      const result = validateDeck(deck);
      if (!result.valid) throw new Error(formatIssues(result.issues));
      undoStack.push(snapshot());
      redoStack.length = 0;
      player.loadDeck(deck);
      player.setEditorOpen(true);
      player.toast(`Loaded ${file.name}`);
    } catch (error) {
      textarea.value = "";
      modalError.textContent = error.message;
      modal.hidden = false;
    } finally {
      fileInput.value = "";
    }
  });

  updateButtons();
  refresh();
  return { refresh };
}
