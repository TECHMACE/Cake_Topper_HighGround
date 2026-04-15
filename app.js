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
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/fredoka/static/Fredoka-Bold.ttf",
  },
  "great-vibes": {
    name: "Great Vibes",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/greatvibes/GreatVibes-Regular.ttf",
  },
  allura: {
    name: "Allura",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/allura/Allura-Regular.ttf",
  },
  anton: {
    name: "Anton",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/anton/Anton-Regular.ttf",
  },
  "dancing-script": {
    name: "Dancing Script",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/dancingscript/DancingScript-Regular.ttf",
  },
  "luckiest-guy": {
    name: "Luckiest Guy",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/luckiestguy/LuckiestGuy-Regular.ttf",
  },
  lobster: {
    name: "Lobster",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/lobster/Lobster-Regular.ttf",
  },
  parisienne: {
    name: "Parisienne",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/parisienne/Parisienne-Regular.ttf",
  },
  "passion-one": {
    name: "Passion One Bold",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/passionone/PassionOne-Bold.ttf",
  },
  pacifico: {
    name: "Pacifico",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/pacifico/Pacifico-Regular.ttf",
  },
  sacramento: {
    name: "Sacramento",
    url: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/sacramento/Sacramento-Regular.ttf",
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
  framePadding: 62,
  frameLift: 0,
  anchorSpread: 18,
  targetWidth: 7,
  previewZoom: 100,
  gridMode: "inch",
  autoBridgeIslands: true,
  autoFitCutting: true,
  weldSupports: true,
  iconScale: 40,
  icons: [],
  selectedIconIndex: null,
  viewOffsetX: 0,
  viewOffsetY: 0,
  hoverPoint: null,
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
  anchorSpread: document.getElementById("anchorSpread"),
  supportBar: document.getElementById("supportBar"),
  frameStyle: document.getElementById("frameStyle"),
  framePadding: document.getElementById("framePadding"),
  frameLift: document.getElementById("frameLift"),
  targetWidth: document.getElementById("targetWidth"),
  previewZoom: document.getElementById("previewZoom"),
  gridMode: document.getElementById("gridMode"),
  autoBridgeIslands: document.getElementById("autoBridgeIslands"),
  autoFitCutting: document.getElementById("autoFitCutting"),
  weldSupports: document.getElementById("weldSupports"),
  iconSelect: document.getElementById("iconSelect"),
  iconScale: document.getElementById("iconScale"),
  addIconBtn: document.getElementById("addIconBtn"),
  autoFitBtn: document.getElementById("autoFitBtn"),
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
  anchorSpreadValue: document.getElementById("anchorSpreadValue"),
  framePaddingValue: document.getElementById("framePaddingValue"),
  frameLiftValue: document.getElementById("frameLiftValue"),
  targetWidthValue: document.getElementById("targetWidthValue"),
  previewZoomValue: document.getElementById("previewZoomValue"),
  iconScaleValue: document.getElementById("iconScaleValue"),
  previewMeta: document.getElementById("previewMeta"),
  iconSelectionStatus: document.getElementById("iconSelectionStatus"),
  connectionDetail: document.getElementById("connectionDetail"),
};

const scene = {
  activeFont: null,
  outlineFontReady: false,
  artworkForExport: null,
  silhouettePreview: null,
  guideLayer: null,
  anchorLayer: null,
  iconLayer: null,
  selectionLayer: null,
  hoverLayer: null,
  gridLayer: null,
  anchorPositions: [],
  dragTarget: null,
  dragOffset: null,
  dragViewOrigin: null,
  lastSuccessfulFontKey: null,
};

const tool = new paper.Tool();
let fontLoadRequestId = 0;
let renderQueued = false;
const unavailableFontKeys = new Set();
const SCRIPT_FONT_KEYS = new Set(["great-vibes", "allura", "dancing-script", "parisienne", "pacifico", "sacramento", "lobster"]);

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
  const shortMessage = message.split(" • ")[0];
  setStatusGroup([ui.connectionStatus, ui.topConnectionStatus], shortMessage, tone);
  if (ui.connectionDetail) {
    ui.connectionDetail.textContent = message;
  }
}

function updateSelectedIconStatus() {
  if (state.selectedIconIndex === null || !state.icons[state.selectedIconIndex]) {
    ui.iconSelectionStatus.textContent = "No icon selected. Added icons will appear near the topper and can be dragged. Drag empty preview space to pan.";
    return;
  }
  const icon = state.icons[state.selectedIconIndex];
  ui.iconSelectionStatus.textContent = `Selected ${icon.type} icon at ${Math.round(icon.size)} px. The blue highlighted shape is active. Drag it, resize it, or remove it.`;
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

function setFontOptionAvailability(fontKey, available) {
  const option = ui.fontSelect.querySelector(`option[value="${fontKey}"]`);
  if (!option) {
    return;
  }
  option.disabled = !available;
  option.textContent = available ? FONT_LIBRARY[fontKey].name : `${FONT_LIBRARY[fontKey].name} (unavailable)`;
}

function firstAvailableFontKey(preferredKeys = []) {
  const ordered = [...preferredKeys, ...BUILTIN_FONT_KEYS.filter((key) => !preferredKeys.includes(key))];
  return ordered.find((key) => !unavailableFontKeys.has(key)) || null;
}

function updateReadouts() {
  ui.fontSizeValue.textContent = `${state.fontSize} px`;
  ui.lineHeightValue.textContent = `${state.lineHeight}%`;
  ui.letterSpacingValue.textContent = `${state.letterSpacing} px`;
  ui.curveAmountValue.textContent = `${state.curveAmount} px`;
  ui.stickLengthValue.textContent = `${state.stickLength} px`;
  ui.supportThicknessValue.textContent = `${state.supportThickness} px`;
  ui.anchorSpreadValue.textContent = `${state.anchorSpread}%`;
  ui.framePaddingValue.textContent = `${state.framePadding} px`;
  ui.frameLiftValue.textContent = `${state.frameLift} px`;
  ui.targetWidthValue.textContent = formatInches(state.targetWidth);
  ui.previewZoomValue.textContent = `${state.previewZoom}%`;
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
  ui.anchorSpread.value = state.anchorSpread;
  ui.supportBar.value = state.supportBar ? "on" : "off";
  ui.frameStyle.value = state.frameStyle;
  ui.framePadding.value = state.framePadding;
  ui.frameLift.value = state.frameLift;
  ui.targetWidth.value = state.targetWidth;
  ui.previewZoom.value = state.previewZoom;
  ui.gridMode.value = state.gridMode;
  ui.autoBridgeIslands.checked = state.autoBridgeIslands;
  ui.autoFitCutting.checked = state.autoFitCutting;
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

function previewPixelsPerInch() {
  const viewBounds = paper.view.bounds;
  const baseWidthScale = (viewBounds.width * 0.74) / 12;
  const baseHeightScale = (viewBounds.height * 0.72) / 8;
  return Math.max(Math.min(baseWidthScale, baseHeightScale), 28) * (state.previewZoom / 100);
}

function drawScaleGrid(itemBounds) {
  if (state.gridMode === "off" || !itemBounds || !itemBounds.width || !itemBounds.height) {
    scene.gridLayer = null;
    return;
  }

  const inchStep = state.gridMode === "half-inch" ? 0.5 : 1;
  const pxPerInch = previewPixelsPerInch();
  const spacing = pxPerInch * inchStep;
  if (!Number.isFinite(spacing) || spacing < 18) {
    scene.gridLayer = null;
    return;
  }

  const bounds = paper.view.bounds;
  const lines = [];
  const labels = [];

  const startX = itemBounds.left - (Math.floor((itemBounds.left - bounds.left) / spacing) + 1) * spacing;
  for (let x = startX; x <= bounds.right + spacing; x += spacing) {
    lines.push(
      new paper.Path.Line({
        from: new paper.Point(x, bounds.top),
        to: new paper.Point(x, bounds.bottom),
        strokeColor: "rgba(36, 24, 15, 0.08)",
        strokeWidth: 1,
      })
    );
  }

  const startY = itemBounds.top - (Math.floor((itemBounds.top - bounds.top) / spacing) + 1) * spacing;
  for (let y = startY; y <= bounds.bottom + spacing; y += spacing) {
    lines.push(
      new paper.Path.Line({
        from: new paper.Point(bounds.left, y),
        to: new paper.Point(bounds.right, y),
        strokeColor: "rgba(36, 24, 15, 0.08)",
        strokeWidth: 1,
      })
    );
  }

  for (let index = 0; index <= state.targetWidth; index += inchStep) {
    const x = itemBounds.left + pxPerInch * index;
    if (x > bounds.right) {
      break;
    }
    labels.push(
      new paper.PointText({
        point: new paper.Point(x + 4, bounds.top + 18),
        content: `${index}${inchStep === 1 ? '"' : ""}`,
        fillColor: "#8b6d50",
        fontSize: 11,
      })
    );
  }

  const layer = new paper.Group({ children: [...lines, ...labels] });
  scene.gridLayer = layer;
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
    scene.lastSuccessfulFontKey = fontKey;
    unavailableFontKeys.delete(fontKey);
    setFontOptionAvailability(fontKey, true);
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
    scene.lastSuccessfulFontKey = fontKey;
    unavailableFontKeys.delete(fontKey);
    setFontOptionAvailability(fontKey, true);
    setFontStatus(`${FONT_LIBRARY[fontKey].name} ready`, "ok");
    setDownloadEnabled(true, "Download welded single-path SVG.");
    return font;
  } catch (error) {
    if (requestId !== fontLoadRequestId) {
      return scene.activeFont;
    }
    const fallbackKey =
      scene.lastSuccessfulFontKey && fontCache.has(scene.lastSuccessfulFontKey) ? scene.lastSuccessfulFontKey : null;
    unavailableFontKeys.add(fontKey);
    setFontOptionAvailability(fontKey, false);
    if (fallbackKey) {
      scene.activeFont = fontCache.get(fallbackKey);
      scene.outlineFontReady = true;
      state.fontKey = fallbackKey;
      ui.fontSelect.value = fallbackKey;
      setFontStatus(`${FONT_LIBRARY[fontKey].name} unavailable, using ${FONT_LIBRARY[fallbackKey].name}`, "warn");
      setDownloadEnabled(true, "Download welded single-path SVG.");
      return scene.activeFont;
    }
    const replacementKey = firstAvailableFontKey(["lilita", "anton", "lobster", "great-vibes"]);
    if (replacementKey && replacementKey !== fontKey) {
      state.fontKey = replacementKey;
      ui.fontSelect.value = replacementKey;
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

function candidateBridgeTargets(path) {
  const { left, right, top, bottom, center, width, height } = path.bounds;
  return [
    center,
    new paper.Point(center.x, bottom),
    new paper.Point(center.x, bottom - height * 0.18),
    new paper.Point(left, center.y),
    new paper.Point(right, center.y),
    new paper.Point(left + width * 0.22, bottom),
    new paper.Point(right - width * 0.22, bottom),
    new paper.Point(center.x, top + height * 0.62),
  ];
}

function pickBridgePair(pathA, pathB, options = {}) {
  let bestPair = null;

  candidateBridgeTargets(pathA).forEach((target) => {
    const pointA = pathA.getNearestPoint(target);
    const pointB = pathB.getNearestPoint(pointA);
    const correctedA = pathA.getNearestPoint(pointB);
    const distance = correctedA.getDistance(pointB);
    const lowerBias = options.preferLower ? (pathA.bounds.bottom - (correctedA.y + pointB.y) / 2) * 0.18 : 0;
    const verticalBias = Math.abs(correctedA.y - pointB.y) * (options.preferLower ? 0.04 : 0.08);
    const score = distance + lowerBias + verticalBias;

    if (!bestPair || score < bestPair.score) {
      bestPair = {
        score,
        pointA: correctedA,
        pointB,
      };
    }
  });

  return bestPair;
}

function chooseIslandBridge(exteriors, options = {}) {
  let best = null;

  for (let firstIndex = 0; firstIndex < exteriors.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < exteriors.length; secondIndex += 1) {
      const pair = pickBridgePair(exteriors[firstIndex], exteriors[secondIndex], options);
      if (!pair) {
        continue;
      }
      if (!best || pair.score < best.score) {
        best = pair;
      }
    }
  }

  return best;
}

function connectDetachedIslands(item, thickness, options = {}) {
  let working = item.clone(false);
  let bridgesAdded = 0;
  let lastBridgeThickness = 0;

  while (true) {
    const exteriors = findExteriorPaths(working).sort((a, b) => Math.abs(b.area) - Math.abs(a.area));
    if (exteriors.length <= 1) {
      break;
    }

    const nextBridge = chooseIslandBridge(exteriors, options);
    if (!nextBridge) {
      break;
    }
    const bridgeThickness =
      typeof options.bridgeThickness === "function" ? options.bridgeThickness(nextBridge, bridgesAdded) : thickness;
    const bridge = roundedSegment(nextBridge.pointA, nextBridge.pointB, bridgeThickness);
    const merged = working.unite(bridge, { insert: false });
    working.remove();
    bridge.remove();
    working = merged;
    bridgesAdded += 1;
    lastBridgeThickness = bridgeThickness;

    if (bridgesAdded > (options.maxBridges || 12)) {
      break;
    }
  }

  return { item: working, bridgesAdded, lastBridgeThickness };
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

  const mergedLines = unionItems(lineItems);
  if (!mergedLines) {
    return null;
  }

  const textBridgeThickness = Math.max(state.supportThickness * 0.95, state.fontSize * 0.08, 10);
  const bridgedText = connectDetachedIslands(mergedLines, textBridgeThickness, {
    preferLower: true,
    maxBridges: 18,
    bridgeThickness: (bridgeChoice) => {
      const distance = bridgeChoice.pointA.getDistance(bridgeChoice.pointB);
      return Math.max(textBridgeThickness, Math.min(distance * 0.85, textBridgeThickness * 1.7));
    },
  });
  mergedLines.remove();
  return bridgedText.item;
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
    const margin = Math.max(bounds.width * (state.anchorSpread / 100), 28);
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
    x:
      count === 1
        ? clamp(anchor.x, bounds.center.x - bounds.width * 0.18, bounds.center.x + bounds.width * 0.18)
        : clamp(anchor.x, bounds.left + 12, bounds.right - 12),
    y: defaults[index].y,
  }));
}

function preferredSupportAttachPoint(attachmentTarget, anchorPoint, textBounds) {
  if (!attachmentTarget) {
    return new paper.Point(anchorPoint.x, textBounds.bottom - state.supportThickness * 0.35);
  }

  const offsets = [0, -textBounds.width * 0.06, textBounds.width * 0.06, -textBounds.width * 0.12, textBounds.width * 0.12];
  let bestPoint = null;
  let bestScore = Number.POSITIVE_INFINITY;

  offsets.forEach((offsetX) => {
    const probe = new paper.Point(anchorPoint.x + offsetX, textBounds.bottom + state.supportThickness * 0.8);
    const targetPoint = attachmentTarget.getNearestPoint(probe);
    const horizontalBias = Math.abs(targetPoint.x - anchorPoint.x) * 0.55;
    const hiddenBias = (textBounds.bottom - targetPoint.y) * 0.18;
    const score = probe.getDistance(targetPoint) + horizontalBias + hiddenBias;
    if (!bestPoint || score < bestScore) {
      bestPoint = targetPoint;
      bestScore = score;
    }
  });

  return bestPoint || new paper.Point(anchorPoint.x, textBounds.bottom - state.supportThickness * 0.35);
}

function buildFrame(textBounds, thickness) {
  if (state.frameStyle === "none") {
    return null;
  }

  const padding = state.framePadding;
  const lift = state.frameLift;
  const outer = new paper.Rectangle(
    textBounds.x - padding,
    textBounds.y - padding + lift,
    textBounds.width + padding * 2,
    textBounds.height + padding * 2
  );
  const innerInset = thickness * 1.35;
  const inner = new paper.Rectangle(
    outer.x + innerInset,
    outer.y + innerInset,
    Math.max(outer.width - innerInset * 2, thickness * 2),
    Math.max(outer.height - innerInset * 2, thickness * 2)
  );
  const frameParts = [];

  let outerShape;
  let innerShape;

  if (state.frameStyle === "rounded-square") {
    outerShape = new paper.Path.Rectangle({
      rectangle: outer,
      radius: Math.min(outer.width, outer.height) * 0.18,
      insert: false,
    });
    innerShape = new paper.Path.Rectangle({
      rectangle: inner,
      radius: Math.min(inner.width, inner.height) * 0.18,
      insert: false,
    });
  } else {
    const ellipseRect =
      state.frameStyle === "oval"
        ? new paper.Rectangle(outer.x - padding * 0.18, outer.y, outer.width + padding * 0.36, outer.height)
        : outer;
    const innerEllipseRect =
      state.frameStyle === "oval"
        ? new paper.Rectangle(inner.x - padding * 0.14, inner.y, inner.width + padding * 0.28, inner.height)
        : inner;
    outerShape = new paper.Path.Ellipse({
      rectangle: ellipseRect,
      insert: false,
    });
    innerShape = new paper.Path.Ellipse({
      rectangle: innerEllipseRect,
      insert: false,
    });
  }

  const frameRing = outerShape.subtract(innerShape, { insert: false });
  outerShape.remove();
  innerShape.remove();
  frameParts.push(frameRing);

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

function buildSupports(textBounds, attachmentTarget) {
  ensureAnchors(textBounds);
  const pieces = [];
  const guidePieces = [];
  const jointRadius = Math.max(state.supportThickness * 0.52, 5.5);
  const barY = state.supportBar
    ? textBounds.bottom + Math.max(state.stickLength * 0.34, state.supportThickness * 2.1)
    : null;

  scene.anchorPositions.forEach((anchor) => {
    const anchorPoint = new paper.Point(anchor.x, anchor.y);
    const topPoint = preferredSupportAttachPoint(attachmentTarget, anchorPoint, textBounds);
    pieces.push(stickShape(anchorPoint, topPoint, state.supportThickness));
    if (barY !== null) {
      pieces.push(
        new paper.Path.Circle({
          center: new paper.Point(anchor.x, barY),
          radius: jointRadius,
          insert: false,
        })
      );
    }
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
    const bar = roundedSegment(
      new paper.Point(leftX - state.supportThickness * 0.2, barY),
      new paper.Point(rightX + state.supportThickness * 0.2, barY),
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

function applyAutoFitAdjustments() {
  if (!state.autoFitCutting) {
    return;
  }

  const lines = (state.message || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);
  const shortestLine = lines.reduce((min, line) => Math.min(min, line.length), longestLine || 0);
  const profileRatio = shortestLine ? longestLine / shortestLine : 1;
  const isScriptFont = SCRIPT_FONT_KEYS.has(state.fontKey);

  if (lines.length > 1) {
    const minLineHeight = isScriptFont ? 94 : 84;
    const maxOverlapSpacing = isScriptFont ? -2 : -8;
    state.lineHeight = Math.max(state.lineHeight, minLineHeight);
    state.letterSpacing = Math.max(state.letterSpacing, maxOverlapSpacing);
    if (profileRatio > 1.55 && state.layoutMode === "straight") {
      state.layoutMode = "arch";
      ui.layoutMode.value = state.layoutMode;
    }
    if (state.layoutMode !== "straight") {
      const desiredCurve = isScriptFont ? 54 : 72;
      state.curveAmount = Math.min(Math.max(state.curveAmount, desiredCurve), desiredCurve + 26);
      ui.curveAmount.value = state.curveAmount;
    }
    ui.lineHeight.value = state.lineHeight;
    ui.letterSpacing.value = state.letterSpacing;
  } else if (lines.length === 1) {
    state.lineHeight = Math.max(state.lineHeight, isScriptFont ? 96 : 88);
    if (state.layoutMode !== "straight") {
      state.curveAmount = Math.min(state.curveAmount, isScriptFont ? 68 : 90);
      ui.curveAmount.value = state.curveAmount;
    }
    ui.lineHeight.value = state.lineHeight;
  }

  if (state.stickCount === 1) {
    scene.anchorPositions = scene.anchorPositions.map((anchor) => ({
      ...anchor,
      x: anchor.x + (paper.view.center.x - anchor.x) * 0.35,
    }));
  }

  if (state.stickCount === 2) {
    state.supportBar = true;
    ui.supportBar.value = "on";
    if (state.supportThickness < 12) {
      state.supportThickness = 12;
      ui.supportThickness.value = state.supportThickness;
    }
    if (state.anchorSpread < 14) {
      state.anchorSpread = 14;
      ui.anchorSpread.value = state.anchorSpread;
    }
  }

  if (state.stickCount > 0 && state.supportThickness < 10) {
    state.supportThickness = 10;
    ui.supportThickness.value = state.supportThickness;
  }

  if (state.frameStyle !== "none") {
    const minPadding = isScriptFont ? 52 : 46;
    if (state.framePadding < minPadding) {
      state.framePadding = minPadding;
      ui.framePadding.value = state.framePadding;
    }
  }

  updateReadouts();
}

function fitItemIntoView(item) {
  const viewBounds = paper.view.bounds;
  const sourceBounds = item.bounds;
  const desiredWidth = Math.max(state.targetWidth * previewPixelsPerInch(), 120);
  const maxHeight = viewBounds.height * 0.84;
  const widthScale = desiredWidth / Math.max(sourceBounds.width, 1);
  const heightScale = maxHeight / Math.max(sourceBounds.height, 1);
  const scale = Math.min(widthScale, heightScale);
  item.scale(scale);
  const topPadding = viewBounds.height * 0.07;
  const scaledBounds = item.bounds;
  const targetCenterY = viewBounds.top + topPadding + scaledBounds.height / 2 + state.viewOffsetY;
  item.position = new paper.Point(viewBounds.center.x + state.viewOffsetX, targetCenterY);
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
      radius: 10,
      fillColor: "rgba(178, 74, 47, 0.14)",
    });
    halo.data.kind = "anchor";
    halo.data.index = index;

    const handle = new paper.Path.Circle({
      center,
      radius: 5,
      fillColor: "#b24a2f",
      strokeColor: "#ffffff",
      strokeWidth: 2,
    });
    handle.data.kind = "anchor";
    handle.data.index = index;

    const label = new paper.PointText({
      point: center.add([0, -14]),
      content: scene.anchorPositions.length === 1 ? "S" : index === 0 ? "L" : "R",
      justification: "center",
      fillColor: "#6e331f",
      fontSize: 10,
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

function drawSelectionOverlay() {
  if (state.selectedIconIndex === null || !scene.iconLayer) {
    scene.selectionLayer = null;
    return;
  }

  const selectedItems = scene.iconLayer.children.filter((child) => child.data?.kind === "icon" && child.data?.index === state.selectedIconIndex);
  if (!selectedItems.length) {
    scene.selectionLayer = null;
    return;
  }

  const bounds = selectedItems.reduce((acc, item) => (acc ? acc.unite(item.bounds) : item.bounds.clone()), null);
  if (!bounds) {
    scene.selectionLayer = null;
    return;
  }

  const padding = 8;
  const ring = new paper.Path.Rectangle({
    rectangle: new paper.Rectangle(bounds.x - padding, bounds.y - padding, bounds.width + padding * 2, bounds.height + padding * 2),
    radius: 10,
    strokeColor: "#2f5d7d",
    strokeWidth: 2,
    dashArray: [10, 6],
    fillColor: "rgba(47, 93, 125, 0.05)",
  });
  const label = new paper.PointText({
    point: new paper.Point(bounds.left, bounds.top - 10),
    content: "Selected",
    fillColor: "#2f5d7d",
    fontSize: 11,
    fontWeight: "bold",
  });
  scene.selectionLayer = new paper.Group({ children: [ring, label] });
}

function drawHoverOverlay() {
  const hitResult = paper.project.hitTest(state.hoverPoint || paper.view.center, {
    fill: true,
    stroke: true,
    tolerance: 12,
  });
  const data = hitResult?.item?.data || null;
  ui.previewCanvas.style.cursor = data ? "grab" : "default";

  if (!data) {
    scene.hoverLayer = null;
    return;
  }

  let bounds = null;
  if (data.kind === "icon" && scene.iconLayer) {
    const items = scene.iconLayer.children.filter((child) => child.data?.kind === "icon" && child.data?.index === data.index);
    bounds = items.reduce((acc, item) => (acc ? acc.unite(item.bounds) : item.bounds.clone()), null);
  }

  if (data.kind === "anchor" && scene.anchorLayer) {
    const items = scene.anchorLayer.children.filter((child) => child.data?.kind === "anchor" && child.data?.index === data.index);
    bounds = items.reduce((acc, item) => (acc ? acc.unite(item.bounds) : item.bounds.clone()), null);
  }

  if (!bounds) {
    scene.hoverLayer = null;
    return;
  }

  const glow = new paper.Path.Rectangle({
    rectangle: new paper.Rectangle(bounds.x - 6, bounds.y - 6, bounds.width + 12, bounds.height + 12),
    radius: 10,
    strokeColor: "rgba(255, 164, 82, 0.95)",
    strokeWidth: 2,
    dashArray: [6, 4],
    fillColor: "rgba(255, 164, 82, 0.08)",
  });
  scene.hoverLayer = glow;
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
    new paper.Point(textBounds.center.x, textBounds.top),
    new paper.Point(textBounds.center.x, textBounds.bottom),
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

function performRenderScene() {
  try {
    ensureCanvasSize();
    clearCanvas();

    applyAutoFitAdjustments();
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
    drawScaleGrid(textArtwork.bounds);
    const textBounds = textArtwork.bounds.clone();
    const frameArtwork = buildFrame(textBounds, state.supportThickness);
    const supportAttachmentTarget = unionItems([textArtwork.clone(false), frameArtwork?.clone(false)].filter(Boolean));
    const supports = buildSupports(textBounds, supportAttachmentTarget);
    supportAttachmentTarget?.remove();
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
    if (scene.gridLayer) {
      attachToLayer(scene.gridLayer);
    }
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
    drawSelectionOverlay();
    drawHoverOverlay();
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

function renderScene() {
  if (renderQueued) {
    return;
  }
  renderQueued = true;
  window.requestAnimationFrame(() => {
    renderQueued = false;
    performRenderScene();
  });
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

function autoFitNow() {
  state.autoFitCutting = true;
  ui.autoFitCutting.checked = true;
  applyAutoFitAdjustments();
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
  const clampedX =
    scene.anchorPositions.length === 1
      ? clamp(
          Math.round(point.x / 10) * 10,
          bounds.center.x - bounds.width * 0.18,
          bounds.center.x + bounds.width * 0.18
        )
      : clamp(Math.round(point.x / 10) * 10, bounds.left + 8, bounds.right - 8);
  scene.anchorPositions[index].x = clampedX;
  if (scene.anchorPositions.length === 2) {
    const left = Math.min(scene.anchorPositions[0].x, scene.anchorPositions[1].x);
    const right = Math.max(scene.anchorPositions[0].x, scene.anchorPositions[1].x);
    const inferredSpread = ((left - bounds.left) / Math.max(bounds.width, 1)) * 100;
    state.anchorSpread = Math.round(clamp(inferredSpread, 8, 34));
    ui.anchorSpread.value = state.anchorSpread;
    updateReadouts();
  }
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
  state.hoverPoint = event.point;
  const data = hitTargetData(event.point);
  if (!data) {
    state.selectedIconIndex = null;
    updateSelectedIconStatus();
    scene.dragTarget = { kind: "pan" };
    scene.dragViewOrigin = new paper.Point(state.viewOffsetX, state.viewOffsetY);
    ui.previewCanvas.style.cursor = "grabbing";
    renderScene();
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
  state.hoverPoint = event.point;
  if (!scene.dragTarget) {
    return;
  }

  if (scene.dragTarget.kind === "pan") {
    const origin = scene.dragViewOrigin || new paper.Point(state.viewOffsetX, state.viewOffsetY);
    state.viewOffsetX = origin.x + event.delta.x;
    state.viewOffsetY = origin.y + event.delta.y;
    renderScene();
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
  scene.dragViewOrigin = null;
  ui.previewCanvas.style.cursor = "default";
};

tool.onMouseMove = (event) => {
  state.hoverPoint = event.point;
  if (!scene.dragTarget) {
    renderScene();
  }
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
  bindInput(ui.anchorSpread, "anchorSpread");
  bindInput(ui.framePadding, "framePadding");
  bindInput(ui.frameLift, "frameLift");
  bindInput(ui.targetWidth, "targetWidth", Number);
  bindInput(ui.previewZoom, "previewZoom", Number);
  ui.gridMode.addEventListener("change", () => {
    state.gridMode = ui.gridMode.value;
    renderScene();
  });
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

  ui.autoFitCutting.addEventListener("change", () => {
    state.autoFitCutting = ui.autoFitCutting.checked;
    renderScene();
  });

  ui.weldSupports.addEventListener("change", () => {
    state.weldSupports = ui.weldSupports.checked;
    renderScene();
  });

  ui.autoFitBtn.addEventListener("click", autoFitNow);
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
