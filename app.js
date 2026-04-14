paper.install(window);
paper.setup('previewCanvas');

let shape = null;

function render() {
  if (shape) shape.remove();
  const text = document.getElementById('message').value || 'Happy Birthday';

  const pt = new paper.PointText({
    point: [80, 180],
    content: text,
    fontFamily: 'Arial',
    fontSize: 72,
    fillColor: 'black'
  });

  shape = pt.toPath();
  pt.remove();
  paper.view.update();
}

function downloadSvg() {
  if (!shape) return;
  const d = shape.pathData;
  const b = shape.bounds;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${b.width} ${b.height}">
  <path d="${d}" fill="none" stroke="black" stroke-width="1"/>
</svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'topper.svg';
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('message').addEventListener('input', render);
document.getElementById('downloadBtn').addEventListener('click', downloadSvg);
window.addEventListener('resize', render);

render();
