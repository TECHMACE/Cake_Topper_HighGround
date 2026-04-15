const bootstrapUi = {
  fontStatus: document.getElementById("fontStatus"),
  connectionStatus: document.getElementById("connectionStatus"),
  previewMeta: document.getElementById("previewMeta"),
};

function bootstrapFailure(message) {
  if (bootstrapUi.fontStatus) {
    bootstrapUi.fontStatus.textContent = "Dependency load failed";
    bootstrapUi.fontStatus.style.background = "rgba(150, 44, 32, 0.14)";
    bootstrapUi.fontStatus.style.color = "#8b1e1e";
  }
  if (bootstrapUi.connectionStatus) {
    bootstrapUi.connectionStatus.textContent = message;
    bootstrapUi.connectionStatus.classList.remove("neutral");
    bootstrapUi.connectionStatus.style.background = "rgba(150, 44, 32, 0.14)";
    bootstrapUi.connectionStatus.style.color = "#8b1e1e";
  }
  if (bootstrapUi.previewMeta) {
    bootstrapUi.previewMeta.textContent = message;
  }
}

if (!window.paper || !window.opentype) {
  bootstrapFailure(
    window.__topperDependencyError ||
      "Required browser libraries did not load. This usually means the CDN request was blocked."
  );
} else {
paper.install(window);
paper.setup("previewCanvas");

const PX_PER_IN = 96;
const MM_PER_IN = 25.4;

const FONT_LIBRARY = {
  lilita: {
    name: "Lilita One",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/lilitaone/LilitaOne-Regular.ttf",
  },
  bowlby: {
    name: "Bowlby One SC",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/bowlbyonesc/BowlbyOneSC-Regular.ttf",
  },
  fredoka: {
    name: "Fredoka Bold",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/fredoka/Fredoka%5Bwght%5D.ttf",
    variationWeight: 600,
  },
  "great-vibes": {
    name: "Great Vibes",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/greatvibes/GreatVibes-Regular.ttf",
  },
};

const DEFAULT_STATE = {
  message: "Happy\nBirthday",
  fontKey: "lilita",
  fontSize: 160,
  lineHeight: 92,
  letterSpacing: -4,
  layoutMode: "straight",
  curveAmount: 72,
  stickCount: 2,
  stickTip: "flat",
  stickLength: 150,
  supportThickness: 12,
  supportBar: true,
  frameStyle: "none",
  targetWidth: 7,
  autoBridgeIslands: true,
  weldSupports: true,
  iconScale: 40,
  icons: [],
  selectedIconIndex: null,
};

const state = { ...DEFAULT_STATE };
const fontCache = new Map();
const BUILTIN_FONT_KEYS = Object.keys(FONT_LIBRARY);

const ui = {
  previewCanvas: document.getElementById("previewCanvas"),
  messageInput: document.getElementById("messageInput"),
  fontSelect: document.getElementById("fontSelect"),
  fontUpload: document.getElementById("fontUpload"),
  layoutMode: document.getElementById("layoutMode"),
  fontSize: document.getElementById("fontSize"),
  lineHeight: document.getElementById("lineHeight"),
  letterSpacing: document.getElementById("letterSpacing"),
  curveAmount: document.getElementById("curveAmount"),
  stickCount: document.getElementById("stickCount"),
  stickTip: document.getElementById("stickTip"),
  stickLength: document.getElementById("stickLength"),
  supportThickness: document.getElementById("supportThickness"),
  supportBar: document.getElementById("supportBar"),
  frameStyle: document.getElementById("frameStyle"),
  targetWidth: document.getElementById("targetWidth"),
  autoBridgeIslands: document.getElementById("autoBridgeIslands"),
  weldSupports: document.getElementById("weldSupports"),
  iconSelect: document.getElementById("iconSelect"),
  iconScale: document.getElementById("iconScale"),
  addIconBtn: document.getElementById("addIconBtn"),
  removeIconBtn: document.getElementById("removeIconBtn"),
  clearIconsBtn: document.getElementById("clearIconsBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  resetAnchorsBtn: document.getElementById("resetAnchorsBtn"),
  fontStatus: document.getElementById("fontStatus"),
  topFontStatus: document.getElementById("topFontStatus"),
  connectionStatus: document.getElementById("connectionStatus"),
  topConnectionStatus: document.getElementById("topConnectionStatus"),
  physicalSize: document.getElementById("physicalSize"),
  physicalMetric: document.getElementById("physicalMetric"),
  fontSizeValue: document.getElementById("fontSizeValue"),
  lineHeightValue: document.getElementById("lineHeightValue"),
  letterSpacingValue: document.getElementById("letterSpacingValue"),
  curveAmountValue: document.getElementById("curveAmountValue"),
  stickLengthValue: document.getElementById("stickLengthValue"),
  supportThicknessValue: document.getElementById("supportThicknessValue"),
  targetWidthValue: document.getElementById("targetWidthValue"),
  iconScaleValue: document.getElementById("iconScaleValue"),
  previewMeta: document.getElementById("previewMeta"),
  iconSelectionStatus: document.getElementById("iconSelectionStatus"),
};

const scene = {
  activeFont: null,
  outlineFontReady: false,
  artworkForExport: null,
  silhouettePreview: null,
  guideLayer: null,
  anchorLayer: null,
  iconLayer: null,
  anchorPositions: [],
  dragTarget: null,
  dragOffset: null,
};

const tool = new paper.Tool();
let fontLoadRequestId = 0;

function setPreviewMeta(message) {
  ui.previewMeta.textContent = message;
}

function setStatusGroup(elements, message, tone) {
  elements.filter(Boolean).forEach((element) => setStatus(element, message, tone));
}

function setFontStatus(message, tone) {
  setStatusGroup([ui.fontStatus, ui.topFontStatus], message, tone);
}

function setConnectionStatus(message, tone) {
  setStatusGroup([ui.connectionStatus, ui.topConnectionStatus], message, tone);
}

function updateSelectedIconStatus() {
  if (state.selectedIconIndex === null || !state.icons[state.selectedIconIndex]) {
    ui.iconSelectionStatus.textContent = "No icon selected. Added icons will appear near the topper and can be dragged.";
    return;
  }
  const icon = state.icons[state.selectedIconIndex];
  ui.iconSelectionStatus.textContent = `Selected ${icon.type} icon at ${Math.round(icon.size)} px. Drag it, resize it with the slider, or remove it.`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatInches(value) {
  return `${value.toFixed(2)} in`;
}

function formatMm(value) {
  return `${value.toFixed(1)} mm`;
}

function setStatus(element, message, tone) {
  element.textContent = message;
  element.classList.remove("neutral");
  element.style.background = "";
  element.style.color = "";

  if (tone === "ok") {
    element.style.background = "rgba(35, 114, 61, 0.14)";
    element.style.color = "#23723d";
    return;
  }

  if (tone === "warn") {
    element.style.background = "rgba(176, 108, 18, 0.16)";
    element.style.color = "#8d5b0e";
    return;
  }

  if (tone === "error") {
    element.style.background = "rgba(150, 44, 32, 0.14)";
    element.style.color = "#8b1e1e";
    return;
  }

  element.classList.add("neutral");
}

function setDownloadEnabled(enabled, titleText = "") {
  ui.downloadBtn.disabled = !enabled;
  ui.downloadBtn.style.opacity = enabled ? "1" : "0.6";
  ui.downloadBtn.style.cursor = enabled ? "pointer" : "not-allowed";
  ui.downloadBtn.title = titleText;
}

function updateReadouts() {
  ui.fontSizeValue.textContent = `${state.fontSize} px`;
  ui.lineHeightValue.textContent = `${state.lineHeight}%`;
  ui.letterSpacingValue.textContent = `${state.letterSpacing} px`;
  ui.curveAmountValue.textContent = `${state.curveAmount} px`;
  ui.stickLengthValue.textContent = `${state.stickLength} px`;
  ui.supportThicknessValue.textContent = `${state.supportThickness} px`;
  ui.targetWidthValue.textContent = formatInches(state.targetWidth);
  ui.iconScaleValue.textContent = `${state.iconScale} px`;
}

function syncControlsFromState() {
  ui.messageInput.value = state.message;
  ui.fontSelect.value = state.fontKey;
  ui.layoutMode.value = state.layoutMode;
  ui.fontSize.value = state.fontSize;
  ui.lineHeight.value = state.lineHeight;
  ui.letterSpacing.value = state.letterSpacing;
  ui.curveAmount.value = state.curveAmount;
  ui.stickCount.value = String(state.stickCount);
  ui.stickTip.value = state.stickTip;
  ui.stickLength.value = state.stickLength;
  ui.supportThickness.value = state.supportThickness;
  ui.supportBar.value = state.supportBar ? "on" : "off";
  ui.frameStyle.value = state.frameStyle;
  ui.targetWidth.value = state.targetWidth;
  ui.autoBridgeIslands.checked = state.autoBridgeIslands;
  ui.weldSupports.checked = state.weldSupports;
  ui.iconScale.value = state.iconScale;
  setDownloadEnabled(false, "Load or upload an outline font to export SVG.");
  updateReadouts();
  updateSelectedIconStatus();
}

function clearCanvas() {
  paper.project.activeLayer.removeChildren();
}

function attachToLayer(item) {
  if (item && !item.parent) {
    paper.project.activeLayer.addChild(item);
  }
  return item;
}

function ensureCanvasSize() {
  const rect = ui.previewCanvas.getBoundingClientRect();
  const width = Math.max(Math.round(rect.width), 640);
  const height = Math.max(Math.round(rect.height), 420);

  if (ui.previewCanvas.width !== width) {
    ui.previewCanvas.width = width;
  }
  if (ui.previewCanvas.height !== height) {
    ui.previewCanvas.height = height;
  }

  if (paper.view.viewSize.width !== width || paper.view.viewSize.height !== height) {
    paper.view.viewSize = new paper.Size(width, height);
  }

  setPreviewMeta(`Canvas ${width} x ${height} px. ${scene.outlineFontReady ? "Outline font ready." : "Preview mode active."}`);
}

function withTimeout(promise, timeoutMs, message) {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

function loadFont(fontKey) {
  const fontMeta = FONT_LIBRARY[fontKey];
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", fontMeta.url, true);
    request.responseType = "arraybuffer";
    request.timeout = 12000;

    request.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }
    };

    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(`Font request failed with status ${request.status}`));
        return;
      }

      try {
        const font = opentype.parse(request.response);
        if (
          fontMeta.variationWeight &&
          typeof font.variation?.set === "function" &&
          font.tables?.fvar?.axes?.some((axis) => axis.tag === "wght")
        ) {
          font.variation.set({ wght: fontMeta.variationWeight });
        }
        resolve(font);
      } catch (error) {
        reject(error);
      }
    };

    request.onerror = () => reject(new Error("Network error while loading font"));
    request.ontimeout = () => reject(new Error("Timed out while loading font"));
    request.send();
  });
}

async function ensureFont(fontKey) {
  const requestId = ++fontLoadRequestId;
  if (fontCache.has(fontKey)) {
    scene.activeFont = fontCache.get(fontKey);
    scene.outlineFontReady = true;
    setFontStatus(`${FONT_LIBRARY[fontKey].name} ready`, "ok");
    setDownloadEnabled(true, "Download welded single-path SVG.");
    return scene.activeFont;
  }

  setFontStatus(`Loading ${FONT_LIBRARY[fontKey].name}...`, "warn");
  try {
    const font = await withTimeout(loadFont(fontKey), 3500, "Remote font load took too long");
    if (requestId !== fontLoadRequestId) {
      return scene.activeFont;
    }
    fontCache.set(fontKey, font);
    scene.activeFont = font;
    scene.outlineFontReady = true;
    setFontStatus(`${FONT_LIBRARY[fontKey].name} ready`, "ok");
    setDownloadEnabled(true, "Download welded single-path SVG.");
    return font;
  } catch (error) {
    if (requestId !== fontLoadRequestId) {
      return scene.activeFont;
    }
    scene.activeFont = null;
    scene.outlineFontReady = false;
    setFontStatus("Remote font unavailable", "warn");
    setDownloadEnabled(false, "Upload a .ttf or .otf font for export-ready outlines.");
    return null;
  }
}

function loadUploadedFont(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const font = opentype.parse(reader.result);
        resolve(font);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Unable to read selected font file"));
    reader.readAsArrayBuffer(file);
  });
}

function roundedSegment(from, to, thickness) {
  const vector = to.subtract(from);
  if (vector.length < 0.001) {
    return new paper.Path.Circle({
      center: from,
      radius: thickness / 2,
      insert: false,
    });
  }

  const normal = vector.normalize().rotate(90).multiply(thickness / 2);
  const rect = new paper.Path({
    closed: true,
    insert: false,
    segments: [from.add(normal), to.add(normal), to.subtract(normal), from.subtract(normal)],
  });
  const startCap = new paper.Path.Circle({
    center: from,
    radius: thickness / 2,
    insert: false,
  });
  const endCap = new paper.Path.Circle({
    center: to,
    radius: thickness / 2,
    insert: false,
  });
  return unionItems([rect, startCap, endCap]);
}

function flatStickShape(anchor, topPoint, width) {
  return new paper.Path.Rectangle({
    point: [anchor.x - width / 2, topPoint.y],
    size: [width, anchor.y - topPoint.y],
    radius: width / 2,
    insert: false,
  });
}

function pointedStickShape(anchor, topPoint, width) {
  return new paper.Path({
    closed: true,
    insert: false,
    segments: [
      new paper.Point(anchor.x - width / 2, topPoint.y),
      new paper.Point(anchor.x + width / 2, topPoint.y),
      new paper.Point(anchor.x + width / 2, anchor.y - width * 0.7),
      new paper.Point(anchor.x, anchor.y),
      new paper.Point(anchor.x - width / 2, anchor.y - width * 0.7),
    ],
  });
}

function roundedStickShape(anchor, topPoint, width) {
  const bodyHeight = Math.max(anchor.y - topPoint.y - width, width);
  const body = new paper.Path.Rectangle({
    point: [anchor.x - width / 2, topPoint.y],
    size: [width, bodyHeight],
    radius: width / 2,
    insert: false,
  });
  const tip = new paper.Path.Circle({
    center: new paper.Point(anchor.x, topPoint.y + bodyHeight),
    radius: width / 2,
    insert: false,
  });
  const merged = body.unite(tip, { insert: false });
  body.remove();
  tip.remove();
  return merged;
}

function stickShape(anchor, topPoint, width) {
  if (state.stickTip === "pointed") {
    return pointedStickShape(anchor, topPoint, width);
  }
  if (state.stickTip === "rounded") {
    return roundedStickShape(anchor, topPoint, width);
  }
  return flatStickShape(anchor, topPoint, width);
}

function pathFromSvg(pathData) {
  return new paper.CompoundPath({
    pathData,
    insert: false,
  });
}

function unionItems(items) {
  const filtered = items.filter(Boolean);
  if (!filtered.length) {
    return null;
  }

  let result = filtered[0];
  for (let index = 1; index < filtered.length; index += 1) {
    const next = result.unite(filtered[index], { insert: false });
    result.remove();
    filtered[index].remove();
    result = next;
  }
  return result;
}

function splitLeafPaths(item) {
  if (!item) {
    return [];
  }

  if (item instanceof paper.Path) {
    return [item];
  }

  if (item.children) {
    return item.children.flatMap((child) => splitLeafPaths(child));
  }

  return [];
}

function findExteriorPaths(item) {
  const paths = splitLeafPaths(item).filter((path) => Math.abs(path.area) > 1);
  return paths.filter((path, index) => {
    const samplePoint = path.bounds.center;
    return !paths.some((candidate, candidateIndex) => {
      if (candidateIndex === index || Math.abs(candidate.area) <= Math.abs(path.area)) {
        return false;
      }
      return candidate.contains(samplePoint);
    });
  });
}

function connectDetachedIslands(item, thickness) {
  let working = item.clone(false);
  let bridgesAdded = 0;

  while (true) {
    const exteriors = findExteriorPaths(working).sort((a, b) => Math.abs(b.area) - Math.abs(a.area));
    if (exteriors.length <= 1) {
      break;
    }

    const mainBody = exteriors[0];
    const island = exteriors[1];
    const islandCenter = island.bounds.center;
    let mainPoint = mainBody.getNearestPoint(islandCenter);
    let islandPoint = island.getNearestPoint(mainPoint);
    mainPoint = mainBody.getNearestPoint(islandPoint);

    const bridge = roundedSegment(mainPoint, islandPoint, thickness);
    const merged = working.unite(bridge, { insert: false });
    working.remove();
    bridge.remove();
    working = merged;
    bridgesAdded += 1;

    if (bridgesAdded > 12) {
      break;
    }
  }

  return { item: working, bridgesAdded };
}

function curveOffset(normalizedX) {
  const amount = state.curveAmount * (1 - normalizedX * normalizedX);
  if (state.layoutMode === "arch") {
    return -amount;
  }
  if (state.layoutMode === "valley") {
    return amount;
  }
  return 0;
}

function buildLineGlyphs(lineText, baselineY) {
  const glyphItems = [];
  const font = scene.activeFont;

  font.forEachGlyph(
    lineText,
    0,
    baselineY,
    state.fontSize,
    { kerning: true, letterSpacing: state.letterSpacing / state.fontSize },
    (glyph, x, y, glyphFontSize) => {
      const glyphPath = glyph.getPath(x, y, glyphFontSize, { kerning: true });
      if (!glyphPath.commands.length) {
        return;
      }
      glyphItems.push(pathFromSvg(glyphPath.toPathData(3)));
    }
  );

  if (!glyphItems.length) {
    return null;
  }

  const rawGroup = new paper.Group({ children: glyphItems, insert: false });
  const centerX = rawGroup.bounds.center.x;
  const width = rawGroup.bounds.width || 1;

  rawGroup.children.forEach((child) => {
    const normalizedX = clamp((child.bounds.center.x - centerX) / (width / 2 || 1), -1, 1);
    child.translate(new paper.Point(-centerX, curveOffset(normalizedX)));
  });

  const children = rawGroup.removeChildren();
  rawGroup.remove();
  return unionItems(children);
}

function buildTextArtwork() {
  if (!scene.activeFont) {
    return null;
  }

  const lines = (state.message || "Happy Birthday")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return null;
  }

  const lineItems = [];
  const lineStep = state.fontSize * (state.lineHeight / 100);
  const centerOffset = (lines.length - 1) / 2;

  lines.forEach((line, index) => {
    const baselineY = (index - centerOffset) * lineStep;
    const lineItem = buildLineGlyphs(line, baselineY);
    if (lineItem) {
      lineItems.push(lineItem);
    }
  });

  return unionItems(lineItems);
}

function ensureAnchors(bounds) {
  const count = state.stickCount;
  if (count <= 0) {
    scene.anchorPositions = [];
    return;
  }

  const anchorY = bounds.bottom + state.stickLength;
  let defaults;

  if (count === 1) {
    defaults = [{ x: bounds.center.x, y: anchorY }];
  } else {
    const margin = Math.max(bounds.width * 0.18, 28);
    defaults = [
      { x: bounds.left + margin, y: anchorY },
      { x: bounds.right - margin, y: anchorY },
    ];
  }

  if (scene.anchorPositions.length !== count) {
    scene.anchorPositions = defaults;
    return;
  }

  scene.anchorPositions = scene.anchorPositions.map((anchor, index) => ({
    x: clamp(anchor.x, bounds.left + 12, bounds.right - 12),
    y: defaults[index].y,
  }));
}

function buildFrame(textBounds, thickness) {
  if (state.frameStyle === "none") {
    return null;
  }

  const outer = new paper.Rectangle(
    textBounds.x - 62,
    textBounds.y - 62,
    textBounds.width + 124,
    textBounds.height + 124
  );
  const innerInset = thickness * 1.35;
  const inner = new paper.Rectangle(
    outer.x + innerInset,
    outer.y + innerInset,
    Math.max(outer.width - innerInset * 2, thickness * 2),
    Math.max(outer.height - innerInset * 2, thickness * 2)
  );
  const ellipse = new paper.Path.Ellipse({
    rectangle: outer,
    insert: false,
  });
  const innerEllipse = new paper.Path.Ellipse({
    rectangle: inner,
    insert: false,
  });
  const frameRing = ellipse.subtract(innerEllipse, { insert: false });
  ellipse.remove();
  innerEllipse.remove();

  const frameParts = [frameRing];

  if (state.frameStyle === "scallop") {
    const orbit = new paper.Path.Ellipse({
      rectangle: new paper.Rectangle(outer.x - 18, outer.y - 18, outer.width + 36, outer.height + 36),
      insert: false,
    });
    const scallops = [];
    const count = 18;
    for (let index = 0; index < count; index += 1) {
      const point = orbit.getPointAt((orbit.length * index) / count);
      scallops.push(
        new paper.Path.Circle({
          center: point,
          radius: thickness * 0.9,
          insert: false,
        })
      );
    }
    orbit.remove();
    frameParts.push(unionItems(scallops));
  }

  return unionItems(frameParts);
}

function iconShape(type, size) {
  if (type === "heart") {
    const left = new paper.Path.Circle({ center: [-size * 0.22, -size * 0.12], radius: size * 0.24, insert: false });
    const right = new paper.Path.Circle({ center: [size * 0.22, -size * 0.12], radius: size * 0.24, insert: false });
    const bottom = new paper.Path({
      closed: true,
      insert: false,
      segments: [
        new paper.Point(-size * 0.48, -size * 0.04),
        new paper.Point(0, size * 0.56),
        new paper.Point(size * 0.48, -size * 0.04),
      ],
    });
    return unionItems([left, right, bottom]);
  }

  if (type === "star") {
    return new paper.Path.Star({
      center: [0, 0],
      points: 5,
      radius1: size * 0.52,
      radius2: size * 0.22,
      insert: false,
    });
  }

  if (type === "crown") {
    return new paper.Path({
      closed: true,
      insert: false,
      segments: [
        new paper.Point(-size * 0.5, size * 0.34),
        new paper.Point(-size * 0.5, -size * 0.16),
        new paper.Point(-size * 0.24, 0),
        new paper.Point(0, -size * 0.42),
        new paper.Point(size * 0.24, 0),
        new paper.Point(size * 0.5, -size * 0.16),
        new paper.Point(size * 0.5, size * 0.34),
      ],
    });
  }

  if (type === "bow") {
    const left = new paper.Path.Ellipse({
      rectangle: new paper.Rectangle(-size * 0.52, -size * 0.22, size * 0.42, size * 0.3),
      insert: false,
    });
    const right = new paper.Path.Ellipse({
      rectangle: new paper.Rectangle(size * 0.1, -size * 0.22, size * 0.42, size * 0.3),
      insert: false,
    });
    const knot = new paper.Path.Circle({ center: [0, -size * 0.02], radius: size * 0.1, insert: false });
    const tailLeft = new paper.Path({
      closed: true,
      insert: false,
      segments: [
        new paper.Point(-size * 0.14, size * 0.06),
        new paper.Point(-size * 0.34, size * 0.5),
        new paper.Point(-size * 0.02, size * 0.22),
      ],
    });
    const tailRight = new paper.Path({
      closed: true,
      insert: false,
      segments: [
        new paper.Point(size * 0.14, size * 0.06),
        new paper.Point(size * 0.34, size * 0.5),
        new paper.Point(size * 0.02, size * 0.22),
      ],
    });
    return unionItems([left, right, knot, tailLeft, tailRight]);
  }

  if (type === "cross") {
    return unionItems([
      new paper.Path.Rectangle({ point: [-size * 0.1, -size * 0.5], size: [size * 0.2, size], insert: false }),
      new paper.Path.Rectangle({ point: [-size * 0.34, -size * 0.12], size: [size * 0.68, size * 0.2], insert: false }),
    ]);
  }

  if (type === "moon") {
    const outer = new paper.Path.Circle({ center: [0, 0], radius: size * 0.34, insert: false });
    const cut = new paper.Path.Circle({ center: [size * 0.16, -size * 0.04], radius: size * 0.28, insert: false });
    const moon = outer.subtract(cut, { insert: false });
    outer.remove();
    cut.remove();
    return moon;
  }

  if (type === "flower") {
    const petals = [];
    for (let index = 0; index < 6; index += 1) {
      const angle = (Math.PI * 2 * index) / 6;
      petals.push(
        new paper.Path.Circle({
          center: [Math.cos(angle) * size * 0.24, Math.sin(angle) * size * 0.24],
          radius: size * 0.17,
          insert: false,
        })
      );
    }
    const center = new paper.Path.Circle({ center: [0, 0], radius: size * 0.12, insert: false });
    return unionItems([...petals, center]);
  }

  if (type === "butterfly") {
    const leftTop = new paper.Path.Ellipse({
      rectangle: new paper.Rectangle(-size * 0.52, -size * 0.42, size * 0.32, size * 0.28),
      insert: false,
    });
    const leftBottom = new paper.Path.Ellipse({
      rectangle: new paper.Rectangle(-size * 0.46, -size * 0.08, size * 0.24, size * 0.34),
      insert: false,
    });
    const rightTop = new paper.Path.Ellipse({
      rectangle: new paper.Rectangle(size * 0.2, -size * 0.42, size * 0.32, size * 0.28),
      insert: false,
    });
    const rightBottom = new paper.Path.Ellipse({
      rectangle: new paper.Rectangle(size * 0.22, -size * 0.08, size * 0.24, size * 0.34),
      insert: false,
    });
    const body = new paper.Path.Rectangle({
      point: [-size * 0.04, -size * 0.34],
      size: [size * 0.08, size * 0.68],
      radius: size * 0.04,
      insert: false,
    });
    return unionItems([leftTop, leftBottom, rightTop, rightBottom, body]);
  }

  if (type === "diamond") {
    return new paper.Path({
      closed: true,
      insert: false,
      segments: [
        new paper.Point(0, -size * 0.46),
        new paper.Point(size * 0.4, 0),
        new paper.Point(0, size * 0.46),
        new paper.Point(-size * 0.4, 0),
      ],
    });
  }

  if (type === "lightning") {
    return new paper.Path({
      closed: true,
      insert: false,
      segments: [
        new paper.Point(-size * 0.12, -size * 0.48),
        new paper.Point(size * 0.1, -size * 0.14),
        new paper.Point(-size * 0.02, -size * 0.14),
        new paper.Point(size * 0.16, size * 0.48),
        new paper.Point(-size * 0.1, size * 0.08),
        new paper.Point(size * 0.02, size * 0.08),
      ],
    });
  }

  if (type === "ring") {
    const first = new paper.Path.Circle({ center: [-size * 0.18, 0], radius: size * 0.28, insert: false });
    const second = new paper.Path.Circle({ center: [size * 0.18, 0], radius: size * 0.28, insert: false });
    const firstInner = new paper.Path.Circle({ center: [-size * 0.18, 0], radius: size * 0.16, insert: false });
    const secondInner = new paper.Path.Circle({ center: [size * 0.18, 0], radius: size * 0.16, insert: false });
    const outer = unionItems([first, second]);
    const hole = unionItems([firstInner, secondInner]);
    const rings = outer.subtract(hole, { insert: false });
    outer.remove();
    hole.remove();
    return rings;
  }

  const pad = new paper.Path.Circle({ center: [0, size * 0.12], radius: size * 0.24, insert: false });
  const toes = [
    new paper.Path.Circle({ center: [-size * 0.28, -size * 0.18], radius: size * 0.12, insert: false }),
    new paper.Path.Circle({ center: [-size * 0.08, -size * 0.32], radius: size * 0.11, insert: false }),
    new paper.Path.Circle({ center: [size * 0.12, -size * 0.32], radius: size * 0.11, insert: false }),
    new paper.Path.Circle({ center: [size * 0.32, -size * 0.18], radius: size * 0.12, insert: false }),
  ];
  return unionItems([pad, ...toes]);
}

function ensureIcons(textBounds) {
  const bounds = paper.view.bounds;
  state.icons = state.icons.map((icon, index) => {
    if (typeof icon.x === "number" && typeof icon.y === "number") {
      return icon;
    }

    const column = index % 3;
    const row = Math.floor(index / 3);
    const defaultPoint = new paper.Point(
      textBounds.center.x + (column - 1) * 42,
      textBounds.top + 30 + row * 36
    );

    return {
      ...icon,
      x: clamp(defaultPoint.x, bounds.left + 28, bounds.right - 28),
      y: clamp(defaultPoint.y, bounds.top + 28, bounds.bottom - 28),
    };
  });
}

function buildIconArtwork(snapTarget) {
  if (!state.icons.length) {
    return { weldedIcons: null, draggableIcons: [] };
  }

  const weldedShapes = [];
  const overlayShapes = [];

  state.icons.forEach((icon, index) => {
    const shape = iconShape(icon.type, icon.size);
    const center = new paper.Point(icon.x, icon.y);
    const snappedCenter = snapIconCenter(center, snapTarget);
    state.icons[index].x = snappedCenter.x;
    state.icons[index].y = snappedCenter.y;
    shape.position = snappedCenter;
    const weldedShape = shape.clone(false);
    weldedShapes.push(weldedShape);

    if (snapTarget && !weldedShape.intersects(snapTarget)) {
      const iconPoint = weldedShape.getNearestPoint(snapTarget.bounds.center);
      const targetPoint = snapTarget.getNearestPoint(iconPoint);
      const bridge = roundedSegment(iconPoint, targetPoint, Math.max(state.supportThickness * 0.7, 7));
      weldedShapes.push(bridge);

      const bridgeGuide = roundedSegment(iconPoint, targetPoint, Math.max(state.supportThickness * 0.24, 3));
      bridgeGuide.fillColor = "rgba(47, 93, 125, 0.16)";
      bridgeGuide.strokeColor = null;
      overlayShapes.push(bridgeGuide);
    }

    shape.fillColor = state.selectedIconIndex === index ? "rgba(47, 93, 125, 0.44)" : "rgba(47, 93, 125, 0.28)";
    shape.strokeColor = state.selectedIconIndex === index ? "#173446" : "#2f5d7d";
    shape.strokeWidth = state.selectedIconIndex === index ? 2 : 1;
    overlayShapes.push(shape);
  });

  return {
    weldedIcons: unionItems(weldedShapes),
    draggableIcons: overlayShapes,
  };
}

function snapIconCenter(point, snapTarget) {
  if (!snapTarget) {
    return point;
  }

  const nearest = snapTarget.getNearestPoint(point);
  if (nearest.getDistance(point) <= 42) {
    return nearest;
  }
  return point;
}

function buildSupports(textBounds) {
  ensureAnchors(textBounds);
  const pieces = [];
  const guidePieces = [];
  const anchorTopY = textBounds.bottom - state.supportThickness * 0.35;

  scene.anchorPositions.forEach((anchor) => {
    const anchorPoint = new paper.Point(anchor.x, anchor.y);
    const topPoint = new paper.Point(anchor.x, anchorTopY);
    pieces.push(stickShape(anchorPoint, topPoint, state.supportThickness));
    guidePieces.push(
      new paper.Path.Line({
        from: anchorPoint,
        to: topPoint,
        dashArray: [8, 8],
        strokeColor: "rgba(36, 24, 15, 0.22)",
        insert: false,
      })
    );
  });

  if (state.supportBar) {
    const leftX = scene.anchorPositions.length
      ? Math.min(...scene.anchorPositions.map((anchor) => anchor.x))
      : textBounds.left + textBounds.width * 0.12;
    const rightX = scene.anchorPositions.length
      ? Math.max(...scene.anchorPositions.map((anchor) => anchor.x))
      : textBounds.right - textBounds.width * 0.12;
    const barY = textBounds.bottom + Math.max(state.stickLength * 0.34, state.supportThickness * 2);
    const bar = roundedSegment(
      new paper.Point(leftX, barY),
      new paper.Point(rightX, barY),
      state.supportThickness
    );
    pieces.push(bar);
    guidePieces.push(
      new paper.Path.Line({
        from: new paper.Point(leftX, barY),
        to: new paper.Point(rightX, barY),
        dashArray: [8, 8],
        strokeColor: "rgba(36, 24, 15, 0.18)",
        insert: false,
      })
    );
  }

  return {
    welded: unionItems(pieces),
    guides: new paper.Group({ children: guidePieces, insert: false }),
  };
}

function fitItemIntoView(item) {
  const viewBounds = paper.view.bounds;
  const usableWidth = viewBounds.width * 0.86;
  const usableHeight = viewBounds.height * 0.82;
  const sourceBounds = item.bounds;
  const scale = Math.min(usableWidth / sourceBounds.width, usableHeight / sourceBounds.height);
  item.scale(scale);
  const topPadding = viewBounds.height * 0.07;
  const scaledBounds = item.bounds;
  const targetCenterY = viewBounds.top + topPadding + scaledBounds.height / 2;
  item.position = new paper.Point(viewBounds.center.x, targetCenterY);
}

function drawAnchorHandles() {
  if (!scene.anchorPositions.length) {
    scene.anchorLayer = null;
    return;
  }

  const layer = new paper.Group();

  scene.anchorPositions.forEach((anchor, index) => {
    const center = new paper.Point(anchor.x, anchor.y);
    const halo = new paper.Path.Circle({
      center,
      radius: 16,
      fillColor: "rgba(178, 74, 47, 0.14)",
    });
    halo.data.kind = "anchor";
    halo.data.index = index;

    const handle = new paper.Path.Circle({
      center,
      radius: 8,
      fillColor: "#b24a2f",
      strokeColor: "#ffffff",
      strokeWidth: 2,
    });
    handle.data.kind = "anchor";
    handle.data.index = index;

    const label = new paper.PointText({
      point: center.add([0, -20]),
      content: scene.anchorPositions.length === 1 ? "S" : index === 0 ? "L" : "R",
      justification: "center",
      fillColor: "#6e331f",
      fontSize: 12,
      fontWeight: "bold",
    });
    label.position.x = center.x;
    label.data.kind = "anchor";
    label.data.index = index;

    layer.addChildren([halo, handle, label]);
  });

  scene.anchorLayer = layer;
}

function drawIcons(draggableIcons) {
  if (!draggableIcons.length) {
    scene.iconLayer = null;
    return;
  }

  const layer = new paper.Group({ children: draggableIcons });
  layer.children.forEach((child) => {
    if (child.strokeColor) {
      const matchIndex = state.icons.findIndex(
        (icon) => Math.abs(child.position.x - icon.x) < 2 && Math.abs(child.position.y - icon.y) < 2
      );
      if (matchIndex >= 0) {
        markIconHitTargets(child, matchIndex);
      }
    }
  });
  scene.iconLayer = layer;
}

function markIconHitTargets(item, index) {
  item.data.kind = "icon";
  item.data.index = index;
  if (item.children) {
    item.children.forEach((child) => markIconHitTargets(child, index));
  }
}

function updatePhysicalSize(bounds) {
  if (!bounds || !bounds.width || !bounds.height) {
    ui.physicalSize.textContent = "0.00 in x 0.00 in";
    ui.physicalMetric.textContent = "0.0 mm x 0.0 mm";
    return;
  }

  const scale = (state.targetWidth * PX_PER_IN) / bounds.width;
  const widthIn = (bounds.width * scale) / PX_PER_IN;
  const heightIn = (bounds.height * scale) / PX_PER_IN;
  ui.physicalSize.textContent = `${formatInches(widthIn)} x ${formatInches(heightIn)}`;
  ui.physicalMetric.textContent = `${formatMm(widthIn * MM_PER_IN)} x ${formatMm(heightIn * MM_PER_IN)}`;
}

function updateConnectionStatus(islandCount, bridgesAdded) {
  if (!islandCount) {
    setConnectionStatus("Safe: single connected cut shape", "ok");
    return;
  }

  if (bridgesAdded > 0) {
    setConnectionStatus(`Auto-bridged ${bridgesAdded} floating island(s)`, "ok");
    return;
  }

  setConnectionStatus(`${islandCount} disconnected island(s) detected`, "warn");
}

function thicknessInMillimeters(bounds, pixelThickness) {
  if (!bounds || !bounds.width) {
    return 0;
  }
  return (pixelThickness / bounds.width) * state.targetWidth * MM_PER_IN;
}

function assessCutReadiness(bounds, islandCount) {
  if (!bounds) {
    return { tone: "warn", message: "No topper geometry to assess" };
  }

  if (islandCount > 0) {
    return { tone: "warn", message: "Disconnected cut islands remain" };
  }

  const connectorMm = thicknessInMillimeters(bounds, state.supportThickness);
  if (connectorMm < 2) {
    return { tone: "warn", message: `Fragile connectors at ${connectorMm.toFixed(1)} mm` };
  }

  if (!state.stickCount && !state.supportBar) {
    return { tone: "warn", message: "No cake support enabled" };
  }

  if (connectorMm < 3) {
    return { tone: "warn", message: `Usable but light at ${connectorMm.toFixed(1)} mm` };
  }

  return { tone: "ok", message: `Cut ready at ${connectorMm.toFixed(1)} mm minimum connector width` };
}

function buildFrameConnectors(textArtwork, frameArtwork, thickness) {
  if (!textArtwork || !frameArtwork) {
    return null;
  }

  const connectorWidth = Math.max(thickness * 0.82, 8);
  const textBounds = textArtwork.bounds;
  const targets = [
    new paper.Point(textBounds.left, textBounds.center.y),
    new paper.Point(textBounds.right, textBounds.center.y),
  ];

  const connectors = targets.map((target) => {
    const textPoint = textArtwork.getNearestPoint(target);
    const framePoint = frameArtwork.getNearestPoint(textPoint);
    return roundedSegment(textPoint, framePoint, connectorWidth);
  });

  return unionItems(connectors);
}

function renderFallback(message) {
  clearCanvas();
  ensureCanvasSize();
  new paper.PointText({
    point: paper.view.center,
    content: message,
    justification: "center",
    fillColor: "#6b5341",
    fontFamily: "Avenir Next",
    fontSize: 18,
  });
}

function renderPreviewOnlyText() {
  clearCanvas();
  ensureCanvasSize();
  const lines = (state.message || "Happy Birthday")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    renderFallback("Type your topper text to start.");
    return null;
  }

  const group = new paper.Group();
  const lineStep = state.fontSize * (state.lineHeight / 100);
  const centerOffset = (lines.length - 1) / 2;

  lines.forEach((line, index) => {
    const item = new paper.PointText({
      point: new paper.Point(0, (index - centerOffset) * lineStep),
      content: line,
      justification: "center",
      fontFamily: "Georgia",
      fontWeight: "bold",
      fontSize: state.fontSize,
      fillColor: "#1d130d",
    });
    group.addChild(item);
  });

  const viewBounds = paper.view.bounds;
  const usableWidth = viewBounds.width * 0.75;
  const usableHeight = viewBounds.height * 0.5;
  const sourceBounds = group.bounds;
  const scale = Math.min(usableWidth / Math.max(sourceBounds.width, 1), usableHeight / Math.max(sourceBounds.height, 1));
  group.scale(scale);
  group.position = new paper.Point(viewBounds.center.x, viewBounds.center.y - 24);
  attachToLayer(group);
  setPreviewMeta(`Canvas ${Math.round(viewBounds.width)} x ${Math.round(viewBounds.height)} px. Showing preview text without export outlines.`);
  return group;
}

function renderScene() {
  try {
    ensureCanvasSize();
    clearCanvas();

    const textArtwork = buildTextArtwork();
    if (!textArtwork) {
      const previewGroup = renderPreviewOnlyText();
      scene.artworkForExport = null;
      scene.silhouettePreview = previewGroup;
      updatePhysicalSize(previewGroup ? previewGroup.bounds : null);
      setConnectionStatus("Preview only: upload a font for export-ready outlines", "warn");
      setPreviewMeta(
        `Canvas ${Math.round(paper.view.bounds.width)} x ${Math.round(paper.view.bounds.height)} px. Remote font unavailable, fallback preview shown.`
      );
      paper.view.update();
      paper.view.draw();
      return;
    }

    fitItemIntoView(textArtwork);
    const textBounds = textArtwork.bounds.clone();
    const frameArtwork = buildFrame(textBounds, state.supportThickness);
    const supports = buildSupports(textBounds);
    const frameConnectors = buildFrameConnectors(textArtwork, frameArtwork, state.supportThickness);
    const snapBase = unionItems(
      [textArtwork.clone(false), frameArtwork?.clone(false), frameConnectors?.clone(false), supports.welded?.clone(false)].filter(Boolean)
    );

    ensureIcons(textBounds);
    const iconArtwork = buildIconArtwork(snapBase);
    snapBase?.remove();

    const weldInputs = [textArtwork];
    if (frameArtwork) {
      weldInputs.push(frameArtwork);
    }
    if (frameConnectors) {
      weldInputs.push(frameConnectors);
    }
    if (supports.welded && state.weldSupports) {
      weldInputs.push(supports.welded);
    }
    if (iconArtwork.weldedIcons) {
      weldInputs.push(iconArtwork.weldedIcons);
    }

    let welded = unionItems(weldInputs);
    let islandCount = Math.max(findExteriorPaths(welded).length - 1, 0);
    let bridgesAdded = 0;

    if (state.autoBridgeIslands && islandCount > 0) {
      const bridged = connectDetachedIslands(welded, Math.max(state.supportThickness * 0.72, 7));
      welded.remove();
      welded = bridged.item;
      bridgesAdded = bridged.bridgesAdded;
      islandCount = Math.max(findExteriorPaths(welded).length - 1, 0);
    }

    scene.artworkForExport = welded.clone(false);
    scene.silhouettePreview = welded;

    welded.fillColor = "#1d130d";
    welded.strokeColor = null;
    attachToLayer(welded);
    attachToLayer(supports.guides);
    supports.guides.insertBelow(welded);
    scene.guideLayer = supports.guides;

    if (!state.weldSupports && supports.welded) {
      supports.welded.fillColor = "rgba(29, 19, 13, 0.24)";
      attachToLayer(supports.welded);
      supports.welded.insertAbove(supports.guides);
    }

    drawAnchorHandles();
    drawIcons(iconArtwork.draggableIcons);
    updatePhysicalSize(scene.artworkForExport.bounds);
    updateConnectionStatus(islandCount, bridgesAdded);
    const readiness = assessCutReadiness(scene.artworkForExport.bounds, islandCount);
    setConnectionStatus(`${ui.connectionStatus.textContent} • ${readiness.message}`, readiness.tone);
    setPreviewMeta(
      `Canvas ${Math.round(paper.view.bounds.width)} x ${Math.round(paper.view.bounds.height)} px. Rendered topper bounds ${Math.round(
        scene.artworkForExport.bounds.width
      )} x ${Math.round(scene.artworkForExport.bounds.height)} px.`
    );
    paper.view.update();
    paper.view.draw();
  } catch (error) {
    console.error(error);
    setConnectionStatus("Preview error", "error");
    setPreviewMeta(`Render failed: ${error.message || "Unknown error"}`);
    renderFallback("Preview failed. See status above.");
  }
}

function buildExportSvg() {
  if (!scene.artworkForExport || !scene.outlineFontReady) {
    return null;
  }

  const exportItem = scene.artworkForExport.clone(false);
  const scale = (state.targetWidth * PX_PER_IN) / exportItem.bounds.width;
  exportItem.scale(scale);
  exportItem.translate(new paper.Point(-exportItem.bounds.left + 12, -exportItem.bounds.top + 12));
  const bounds = exportItem.bounds.clone();
  const widthIn = bounds.width / PX_PER_IN;
  const heightIn = bounds.height / PX_PER_IN;
  const pathData = exportItem.pathData;
  exportItem.remove();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${widthIn.toFixed(3)}in" height="${heightIn.toFixed(3)}in" viewBox="0 0 ${bounds.width.toFixed(2)} ${bounds.height.toFixed(2)}">
  <path d="${pathData}" fill="#000000"/>
</svg>`;
}

function downloadSvg() {
  const svg = buildExportSvg();
  if (!svg) {
    setConnectionStatus("Upload a .ttf or .otf font before exporting", "warn");
    return;
  }

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(state.message || "cake-topper")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .toLowerCase() || "cake-topper"}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

function resetAnchors() {
  scene.anchorPositions = [];
  renderScene();
}

function addIcon() {
  state.icons.push({
    type: ui.iconSelect.value,
    size: state.iconScale,
  });
  state.selectedIconIndex = state.icons.length - 1;
  updateSelectedIconStatus();
  renderScene();
}

function removeSelectedIcon() {
  if (state.selectedIconIndex === null || !state.icons[state.selectedIconIndex]) {
    return;
  }
  state.icons.splice(state.selectedIconIndex, 1);
  state.selectedIconIndex = state.icons.length ? Math.max(0, state.selectedIconIndex - 1) : null;
  updateSelectedIconStatus();
  renderScene();
}

function clearIcons() {
  state.icons = [];
  state.selectedIconIndex = null;
  updateSelectedIconStatus();
  renderScene();
}

function hitTargetData(eventPoint) {
  const hitResult = paper.project.hitTest(eventPoint, {
    fill: true,
    stroke: true,
    tolerance: 12,
  });
  return hitResult?.item?.data || null;
}

function dragAnchor(index, point) {
  if (!scene.artworkForExport || !scene.anchorPositions[index]) {
    return;
  }

  const bounds = scene.artworkForExport.bounds;
  scene.anchorPositions[index].x = clamp(Math.round(point.x / 10) * 10, bounds.left + 8, bounds.right - 8);
  renderScene();
}

function dragIcon(index, point) {
  if (!state.icons[index]) {
    return;
  }

  const adjusted = point.subtract(scene.dragOffset || new paper.Point(0, 0));
  state.icons[index].x = adjusted.x;
  state.icons[index].y = adjusted.y;
  renderScene();
}

tool.onMouseDown = (event) => {
  const data = hitTargetData(event.point);
  if (!data) {
    scene.dragTarget = null;
    return;
  }

  if (data.kind === "anchor") {
    scene.dragTarget = { kind: "anchor", index: data.index };
    return;
  }

  if (data.kind === "icon" && state.icons[data.index]) {
    const icon = state.icons[data.index];
    state.selectedIconIndex = data.index;
    state.iconScale = icon.size;
    ui.iconScale.value = icon.size;
    updateReadouts();
    updateSelectedIconStatus();
    scene.dragTarget = { kind: "icon", index: data.index };
    scene.dragOffset = event.point.subtract(new paper.Point(icon.x, icon.y));
    renderScene();
  }
};

tool.onMouseDrag = (event) => {
  if (!scene.dragTarget) {
    return;
  }

  if (scene.dragTarget.kind === "anchor") {
    dragAnchor(scene.dragTarget.index, event.point);
    return;
  }

  if (scene.dragTarget.kind === "icon") {
    dragIcon(scene.dragTarget.index, event.point);
  }
};

tool.onMouseUp = () => {
  scene.dragTarget = null;
  scene.dragOffset = null;
};

window.addEventListener("error", (event) => {
  setConnectionStatus("Preview error", "error");
});

function bindInput(element, stateKey, transformer = Number) {
  element.addEventListener("input", () => {
    state[stateKey] = transformer(element.value);
    updateReadouts();
    renderScene();
  });
}

function bindEvents() {
  ui.messageInput.addEventListener("input", () => {
    state.message = ui.messageInput.value;
    renderScene();
  });

  ui.fontSelect.addEventListener("change", async () => {
    state.fontKey = ui.fontSelect.value;
    scene.activeFont = null;
    scene.outlineFontReady = false;
    renderScene();
    await ensureFont(state.fontKey);
    renderScene();
  });

  ui.fontUpload.addEventListener("change", async () => {
    const [file] = ui.fontUpload.files || [];
    if (!file) {
      return;
    }

    try {
      const font = await loadUploadedFont(file);
      const customKey = `uploaded:${file.name}`;
      fontCache.set(customKey, font);
      scene.activeFont = font;
      scene.outlineFontReady = true;
      state.fontKey = BUILTIN_FONT_KEYS.includes(state.fontKey) ? state.fontKey : customKey;
      setFontStatus(`${file.name} ready`, "ok");
      setDownloadEnabled(true, "Download welded single-path SVG.");
      renderScene();
    } catch (error) {
      scene.activeFont = null;
      scene.outlineFontReady = false;
      setFontStatus("Uploaded font could not be parsed", "error");
      setDownloadEnabled(false, "Upload a valid .ttf or .otf font.");
      renderScene();
    }
  });

  ui.layoutMode.addEventListener("change", () => {
    state.layoutMode = ui.layoutMode.value;
    renderScene();
  });

  bindInput(ui.fontSize, "fontSize");
  bindInput(ui.lineHeight, "lineHeight");
  bindInput(ui.letterSpacing, "letterSpacing");
  bindInput(ui.curveAmount, "curveAmount");
  bindInput(ui.stickLength, "stickLength");
  bindInput(ui.supportThickness, "supportThickness");
  bindInput(ui.targetWidth, "targetWidth", Number);
  ui.iconScale.addEventListener("input", () => {
    state.iconScale = Number(ui.iconScale.value);
    if (state.selectedIconIndex !== null && state.icons[state.selectedIconIndex]) {
      state.icons[state.selectedIconIndex].size = state.iconScale;
    }
    updateReadouts();
    updateSelectedIconStatus();
    renderScene();
  });

  ui.stickCount.addEventListener("change", () => {
    state.stickCount = Number(ui.stickCount.value);
    scene.anchorPositions = [];
    renderScene();
  });

  ui.stickTip.addEventListener("change", () => {
    state.stickTip = ui.stickTip.value;
    renderScene();
  });

  ui.supportBar.addEventListener("change", () => {
    state.supportBar = ui.supportBar.value === "on";
    renderScene();
  });

  ui.frameStyle.addEventListener("change", () => {
    state.frameStyle = ui.frameStyle.value;
    renderScene();
  });

  ui.autoBridgeIslands.addEventListener("change", () => {
    state.autoBridgeIslands = ui.autoBridgeIslands.checked;
    renderScene();
  });

  ui.weldSupports.addEventListener("change", () => {
    state.weldSupports = ui.weldSupports.checked;
    renderScene();
  });

  ui.addIconBtn.addEventListener("click", addIcon);
  ui.removeIconBtn.addEventListener("click", removeSelectedIcon);
  ui.clearIconsBtn.addEventListener("click", clearIcons);
  ui.resetAnchorsBtn.addEventListener("click", resetAnchors);
  ui.downloadBtn.addEventListener("click", downloadSvg);

  window.addEventListener("resize", () => {
    ensureCanvasSize();
    renderScene();
  });
}

async function initialize() {
  syncControlsFromState();
  bindEvents();
  ensureCanvasSize();
  renderScene();
  await ensureFont(state.fontKey);
  renderScene();
}

initialize();
}
