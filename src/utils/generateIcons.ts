import fs from 'fs';
import path from 'path';

// Simple canvas to generate basic icons
const canvas = document.createElement('canvas');
const sizes = [16, 48, 128];

sizes.forEach(size => {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Draw a simple colored square with 'AI' text
    ctx.fillStyle = '#4285f4';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = 'white';
    ctx.font = `${size/2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AI', size/2, size/2);
    
    // Convert to PNG
    const buffer = canvas.toDataURL('image/png');
    fs.writeFileSync(
      path.join(__dirname, `../../public/icons/icon${size}.png`),
      buffer.split(',')[1],
      'base64'
    );
  }
}); 