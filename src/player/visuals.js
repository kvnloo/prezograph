function svgElement(name, attrs = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, String(value));
  return element;
}

export function createVisual(type) {
  if (type === "network7") {
    const wrapper = document.createElement("div");
    wrapper.className = "pz-mini-network";
    const svg = svgElement("svg", { viewBox: "0 0 200 96", "aria-hidden": "true" });
    const points = [
      [18, 57, "a"], [55, 57, "b"], [91, 28, "c"], [91, 74, "d"],
      [130, 16, "e"], [140, 49, "f"], [151, 76, "g"]
    ];
    const links = [[0, 1], [1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [4, 6]];
    links.forEach(([a, b]) => svg.appendChild(svgElement("line", {
      x1: points[a][0], y1: points[a][1], x2: points[b][0], y2: points[b][1]
    })));
    points.forEach(([x, y, label]) => {
      svg.appendChild(svgElement("circle", { cx: x, cy: y, r: 5 }));
      const text = svgElement("text", { x: x - 2, y: y + 17 });
      text.textContent = label;
      svg.appendChild(text);
    });
    wrapper.appendChild(svg);
    return wrapper;
  }

  if (type === "table7") {
    const wrapper = document.createElement("div");
    wrapper.className = "pz-mini-table";
    const nodes = document.createElement("section");
    const edges = document.createElement("section");
    const nodesHeading = document.createElement("b");
    const edgesHeading = document.createElement("b");
    nodesHeading.textContent = "nodes";
    edgesHeading.textContent = "edges";
    nodes.append(nodesHeading, document.createTextNode("● a\n● b\n● c\n● d\n● e\n● f\n● g"));
    edges.append(edgesHeading, document.createTextNode("a → b\nb → c\nb → d\nc → e\nc → f\nd → g\ne → g"));
    wrapper.append(nodes, edges);
    return wrapper;
  }

  if (type === "jsonSnippet") {
    const wrapper = document.createElement("pre");
    wrapper.className = "pz-json-visual";
    wrapper.textContent = `{\n  "entity": "graph",\n  "pos": [320, 180]\n}`;
    return wrapper;
  }

  return null;
}
