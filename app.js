paper.install(window);
paper.setup("previewCanvas");

const PX_PER_IN = 96;
const MM_PER_IN = 25.4;

const FONT_LIBRARY = {
  lilita: {
    name: "Lilita One",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/lilitaone/LilitaOne-Regular.ttf",
  },
  bowlby: {
    name: "Bowlby One SC",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/bowlbyonesc/BowlbyOneSC-Regular.ttf",
  },
  fredoka: {
    name: "Fredoka Bold",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/Fredoka%5Bwght%5D.ttf",
    variationWeight: 600,
  },
  "great-vibes": {
    name: "Great Vibes",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/greatvibes/GreatVibes-Regular.ttf",
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
};

const state = { ...DEFAULT_STATE };
const fontCache = new Map();

const ui = {
  messageInput: document.getElementById("messageInput"),
  fontSelect: document.getElementById("fontSelect"),
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
  downloadBtn: document.getElementById("downloadBtn"),
  resetAnchorsBtn: document.getElementById("resetAnchorsBtn"),
  fontStatus: document.getElementById("fontStatus"),
  connectionStatus: document.getElementById("connectionStatus"),
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
};

const scene = {
  activeFont: null,
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
  updateReadouts();
}

function clearCanvas() {
  paper.project.activeLayer.removeChildren();
}

function loadFont(fontKey) {
  const fontMeta = FONT_LIBRARY[fontKey];
  return new Promise((resolve, reject) => {
    opentype.load(fontMeta.url, (error, font) => {
      if (error) {
        reject(error);
        return;
      }

      if (
        fontMeta.variationWeight &&
        typeof font.variation?.set === "function" &&
        font.tables?.fvar?.axes?.some((axis) => axis.tag === "wght")
      ) {
        font.variation.set({ wght: fontMeta.variationWeight });
      }

      resolve(font);
    });
  });
}

async function ensureFont(fontKey) {
  if (fontCache.has(fontKey)) {
    scene.activeFont = fontCache.get(fontKey);
    setStatus(ui.fontStatus, `${FONT_LIBRARY[fontKey].name} ready`, "ok");
    return scene.activeFont;
  }

  setStatus(ui.fontStatus, `Loading ${FONT_LIBRARY[fontKey].name}...`);
  try {
    const font = await loadFont(fontKey);
    fontCache.set(fontKey, font);
    scene.activeFont = font;
    setStatus(ui.fontStatus, `${FONT_LIBRARY[fontKey].name} ready`, "ok");
    return font;
  } catch (error) {
    scene.activeFont = null;
    setStatus(ui.fontStatus, "Font load failed", "error");
    return null;
  }
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
  let working = item.clone({ insert: false });
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

  const outer = textBounds.expand(62);
  const inner = outer.expand(-thickness * 1.35);
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
      rectangle: outer.expand(18),
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

    const defaultPoint =
      index % 2 === 0
        ? new paper.Point(textBounds.right + 28, textBounds.top + 24 + index * 14)
        : new paper.Point(textBounds.left - 28, textBounds.top + 24 + index * 14);

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
    weldedShapes.push(shape.clone({ insert: false }));

    shape.fillColor = "rgba(47, 93, 125, 0.28)";
    shape.strokeColor = "#2f5d7d";
    shape.strokeWidth = 1;
    shape.data.iconIndex = index;
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
  const usableWidth = viewBounds.width * 0.78;
  const usableHeight = viewBounds.height * 0.66;
  const sourceBounds = item.bounds;
  const scale = Math.min(usableWidth / sourceBounds.width, usableHeight / sourceBounds.height);
  item.scale(scale);
  item.position = new paper.Point(viewBounds.center.x, viewBounds.center.y - 20);
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
  layer.children.forEach((child, index) => {
    child.data.kind = "icon";
    child.data.index = index;
  });
  scene.iconLayer = layer;
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
    setStatus(ui.connectionStatus, "Safe: single connected cut shape", "ok");
    return;
  }

  if (bridgesAdded > 0) {
    setStatus(ui.connectionStatus, `Auto-bridged ${bridgesAdded} floating island(s)`, "ok");
    return;
  }

  setStatus(ui.connectionStatus, `${islandCount} disconnected island(s) detected`, "warn");
}

function renderFallback(message) {
  clearCanvas();
  new paper.PointText({
    point: paper.view.center,
    content: message,
    justification: "center",
    fillColor: "#6b5341",
    fontFamily: "Avenir Next",
    fontSize: 18,
  });
}

function renderScene() {
  clearCanvas();

  const textArtwork = buildTextArtwork();
  if (!textArtwork) {
    renderFallback("Unable to build text outlines.");
    updatePhysicalSize(null);
    updateConnectionStatus(0, 0);
    return;
  }

  fitItemIntoView(textArtwork);
  const textBounds = textArtwork.bounds.clone();
  const frameArtwork = buildFrame(textBounds, state.supportThickness);
  const supports = buildSupports(textBounds);
  const snapBase = unionItems(
    [textArtwork.clone({ insert: false }), frameArtwork?.clone({ insert: false }), supports.welded?.clone({ insert: false })].filter(Boolean)
  );

  ensureIcons(textBounds);
  const iconArtwork = buildIconArtwork(snapBase);
  snapBase?.remove();

  const weldInputs = [textArtwork];
  if (frameArtwork) {
    weldInputs.push(frameArtwork);
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

  scene.artworkForExport = welded.clone({ insert: false });
  scene.silhouettePreview = welded;

  welded.fillColor = "#1d130d";
  welded.strokeColor = null;
  supports.guides.insertBelow(welded);
  scene.guideLayer = supports.guides;

  if (!state.weldSupports && supports.welded) {
    supports.welded.fillColor = "rgba(29, 19, 13, 0.24)";
    supports.welded.insertAbove(supports.guides);
  }

  drawAnchorHandles();
  drawIcons(iconArtwork.draggableIcons);
  updatePhysicalSize(scene.artworkForExport.bounds);
  updateConnectionStatus(islandCount, bridgesAdded);
  paper.view.update();
}

function buildExportSvg() {
  if (!scene.artworkForExport) {
    return null;
  }

  const exportItem = scene.artworkForExport.clone({ insert: false });
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
    setStatus(ui.connectionStatus, "Nothing to export yet", "error");
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
    scene.dragTarget = { kind: "icon", index: data.index };
    scene.dragOffset = event.point.subtract(new paper.Point(icon.x, icon.y));
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
    await ensureFont(state.fontKey);
    renderScene();
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
  bindInput(ui.iconScale, "iconScale", Number);

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
  ui.resetAnchorsBtn.addEventListener("click", resetAnchors);
  ui.downloadBtn.addEventListener("click", downloadSvg);

  window.addEventListener("resize", () => renderScene());
}

async function initialize() {
  syncControlsFromState();
  bindEvents();
  await ensureFont(state.fontKey);
  renderScene();
}

initialize();
