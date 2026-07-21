import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';

// Load games
const gamesPath = path.join(process.cwd(), 'src', 'games.json');
const coversDir = path.join(process.cwd(), 'public', 'covers');

if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

const games = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

// Utilities for colors and gradients
const categories = {
  'Featured Classics': { bg1: '#8E2DE2', bg2: '#4A00E0', text: '#FFFFFF' },
  'Capcom Universe': { bg1: '#FF416C', bg2: '#FF4B2B', text: '#FFFFFF' },
  'Anime & Manga': { bg1: '#f12711', bg2: '#f5af19', text: '#FFFFFF' },
  'Horror & Fantasy': { bg1: '#000000', bg2: '#434343', text: '#FFFFFF' },
  'Beats of Rage Originals': { bg1: '#11998e', bg2: '#38ef7d', text: '#FFFFFF' },
  'Arcade Brawlers': { bg1: '#FDFC47', bg2: '#24FE41', text: '#000000' },
  'Community Creations': { bg1: '#3a7bd5', bg2: '#3a6073', text: '#FFFFFF' }
};

const drawCover = (game) => {
  const width = 400;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const theme = categories[game.category] || categories['Community Creations'];

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, theme.bg1);
  grad.addColorStop(1, theme.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Border/Overlay style
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Draw Title Text
  ctx.fillStyle = theme.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Word wrap logic
  const words = game.title.split(' ');
  let line = '';
  const lines = [];
  ctx.font = 'bold 48px sans-serif';

  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > width - 40 && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // Draw lines
  let y = height / 2 - (lines.length * 60) / 2 + 30;
  for (const l of lines) {
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(l.trim(), width / 2 + 4, y + 4);
    
    // text
    ctx.fillStyle = theme.text;
    ctx.fillText(l.trim(), width / 2, y);
    y += 60;
  }

  // Draw 'OpenBOR' at the bottom
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('OPENBOR FAN ARCHIVE', width / 2, height - 50);

  // Save to file
  const outPath = path.join(coversDir, `${game.id}.jpg`);
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  fs.writeFileSync(outPath, buffer);
};

let count = 0;
for (const game of games) {
  try {
    drawCover(game);
    count++;
  } catch (err) {
    console.error(`Failed to generate cover for ${game.title}:`, err.message);
  }
}

console.log(`Successfully generated ${count} cover images!`);
