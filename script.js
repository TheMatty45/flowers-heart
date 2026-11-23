const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const SIZE = 560, dpr = window.devicePixelRatio || 1;
canvas.width = SIZE * dpr; canvas.height = SIZE * dpr;
ctx.scale(dpr, dpr);

const COLORS = ['#0077b6','#0096c7','#00b4d8','#48cae4','#90e0ef','#17c3b2','#2ec4b6','#40e0d0','#7fe5d8'];

// 1) Curva del corazón (ecuación paramétrica clásica)
function heart(t) {
  return {
    x: 16 * Math.pow(Math.sin(t), 3),
    y: -(13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t))
  };
}

// 2) Puntos: contorno + capas interiores más pequeñas (relleno)
function buildPoints() {
  const pts = [], scale = SIZE / 40, cx = SIZE/2, cy = SIZE/2 + 10;
  for (let s = 1; s > 0.4; s -= 0.17) {
    const n = Math.round(46 * s);
    for (let i = 0; i < n; i++) {
      const p = heart((i / n) * Math.PI * 2);
      pts.push({ x: cx + p.x * s * scale, y: cy + p.y * s * scale,
                 r: 15 + Math.random()*7, rot: Math.random()*Math.PI,
                 petals: 5 + Math.floor(Math.random()*3),
                 color: COLORS[Math.floor(Math.random()*COLORS.length)], born: 0 });
    }
  }
  // 3) Orden aleatorio: el corazón "emerge" poco a poco
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  return pts;
}

function easeOutBack(t) { const c = 1.70158; return 1 + (c+1)*Math.pow(t-1,3) + c*Math.pow(t-1,2); }

function drawFlower(f, k) {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.rot + k * 0.5);
  ctx.scale(k, k);
  ctx.fillStyle = f.color;
  for (let i = 0; i < f.petals; i++) {
    ctx.rotate((Math.PI * 2) / f.petals);
    ctx.beginPath();
    ctx.ellipse(0, -f.r * 0.5, f.r * 0.3, f.r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.fillStyle = '#ffd54a';
  ctx.beginPath(); ctx.arc(0, 0, f.r * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

let flowers, start;
const DELAY = 45, GROW = 600; // ms entre flores / duración del crecimiento

// Monograma central: Iniciales pareja (aparece con fundido cuando ya hay flores)
function drawMonogram(alpha) {
  const cx = SIZE / 2, cy = SIZE / 2 + 8;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#0a8fa8';
  ctx.font = 'bold 46px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Initial1', cx - 52, cy);
  ctx.fillText('Initial2', cx + 52, cy);
  // corazoncito en medio, con la misma ecuación del corazón grande
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const p = heart((i / 60) * Math.PI * 2);
    const x = cx + p.x * 1.5, y = cy + 2 + p.y * 1.5;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function frame(now) {
  if (!start) start = now;
  const elapsed = now - start;
  ctx.clearRect(0, 0, SIZE, SIZE);
  flowers.forEach((f, i) => {
    const t = (elapsed - i * DELAY) / GROW;
    if (t > 0) drawFlower(f, easeOutBack(Math.min(t, 1)));
  });
  const total = flowers.length * DELAY + GROW;
  const alpha = Math.max(0, Math.min(1, (elapsed - total + 300) / 900));
  if (alpha > 0) drawMonogram(alpha);
  if (elapsed < total + 700) requestAnimationFrame(frame);
}

function play() { flowers = buildPoints(); start = null; requestAnimationFrame(frame); }
document.getElementById('again').addEventListener('click', play);
play();
