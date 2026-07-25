import { PrezographPlayer } from "./player/player.js";
import { attachEditor } from "./editor/editor.js";
import { formatIssues } from "./core/schema.js";

const app = document.querySelector("#app");

async function loadInitialDeck() {
  if (globalThis.PREZOGRAPH_DECK) return globalThis.PREZOGRAPH_DECK;
  const params = new URLSearchParams(location.search);
  const requested = params.get("deck") ?? "./examples/graphs-are-awesome/deck.json";
  const url = new URL(requested, location.href);
  if (url.origin !== location.origin) throw new Error("Deck URLs must use the same origin");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load deck: ${response.status} ${response.statusText}`);
  return response.json();
}

try {
  const deck = await loadInitialDeck();
  const player = new PrezographPlayer(app, deck);
  attachEditor(player);
  globalThis.prezograph = player;
} catch (error) {
  const heading = document.createElement("h1");
  heading.textContent = "Prezograph could not load this deck";
  const message = document.createElement("pre");
  message.textContent = error.issues ? formatIssues(error.issues) : error.message;
  app.className = "pz-fatal";
  app.replaceChildren(heading, message);
}
