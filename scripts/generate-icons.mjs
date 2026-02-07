import sharp from 'sharp';

const sizes = [192, 512];

async function generateIcons() {
  for (const size of sizes) {
    await sharp('./public/image.png')
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(`./public/icon-${size}.png`);

    console.log(`Generated icon-${size}.png`);
  }
}

generateIcons().catch(console.error);
