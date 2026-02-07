import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

const sizes = [192, 512];

async function generateIcons() {
  for (const size of sizes) {
    const svgPath = `./public/icon-${size}.svg`;
    const pngPath = `./public/icon-${size}.png`;

    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#7C3AED';
    ctx.fillRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#7C3AED';
    ctx.fill();

    const scale = size / 192;
    const centerX = size / 2;
    const centerY = size / 2;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 46 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 8 * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 21 * scale);
    ctx.lineTo(centerX, centerY + 34 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 34 * scale);
    ctx.lineTo(centerX + 24 * scale, centerY + 9 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 34 * scale);
    ctx.lineTo(centerX - 24 * scale, centerY + 9 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - 20 * scale, centerY + 19 * scale);
    ctx.lineTo(centerX + 20 * scale, centerY + 19 * scale);
    ctx.stroke();

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(pngPath, buffer);
    console.log(`Generated ${pngPath}`);
  }
}

generateIcons().catch(console.error);
