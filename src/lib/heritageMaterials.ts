import * as THREE from 'three';

// Procedural Canvas Texture Generator for Heritage Sandstone & Carvings
class HeritageMaterialFactory {
  private cache: Map<string, THREE.CanvasTexture> = new Map();

  // 1. High-Resolution Sandstone Albedo & Bump Texture
  getSandstoneTexture(epoch: number = 0): THREE.CanvasTexture {
    const key = `sandstone_epoch_${epoch}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Base stone color: Dhrangadhra golden sandstone
    let baseR = 212, baseG = 165, baseB = 116; // Warm golden sandstone
    if (epoch === 1) { // 1300 CE: slightly more aged / dry
      baseR = 200; baseG = 155; baseB = 108;
    } else if (epoch === 2) { // 1890 CE: weathered, darker, damp
      baseR = 170; baseG = 145; baseB = 115;
    } else if (epoch === 3) { // 2026 CE: cleaned & preserved
      baseR = 218; baseG = 175; baseB = 125;
    }

    ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
    ctx.fillRect(0, 0, 1024, 1024);

    // Fine mineral grain
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 35;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.8));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.6));
    }
    ctx.putImageData(imgData, 0, 0);

    // Horizontal sedimentary bedding planes
    ctx.lineWidth = 1.5;
    for (let y = 16; y < 1024; y += 32) {
      ctx.strokeStyle = `rgba(130, 95, 60, ${0.15 + Math.random() * 0.15})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < 1024; x += 64) {
        ctx.lineTo(x + Math.random() * 20, y + (Math.random() - 0.5) * 8);
      }
      ctx.stroke();
    }

    // Ashlar masonry block joints
    ctx.strokeStyle = 'rgba(70, 50, 30, 0.45)';
    ctx.lineWidth = 2.5;
    const blockH = 64;
    for (let y = 0; y < 1024; y += blockH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();

      const offset = (Math.floor(y / blockH) % 2) * 64;
      for (let x = offset; x < 1024; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + blockH);
        ctx.stroke();
      }
    }

    // Epoch-specific overlays:
    if (epoch === 2) {
      // 1890 CE: Moss, lichen patches and moisture staining
      ctx.fillStyle = 'rgba(45, 65, 30, 0.35)';
      for (let i = 0; i < 40; i++) {
        const mx = Math.random() * 1024;
        const my = 500 + Math.random() * 524;
        const r = 20 + Math.random() * 60;
        ctx.beginPath();
        ctx.arc(mx, my, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    this.cache.set(key, texture);
    return texture;
  }

  // 2. Ornate Carved Frieze Relief Texture (Solanki floral & geometric band)
  getFriezeTexture(): THREE.CanvasTexture {
    const key = 'frieze_texture';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Stone base
    ctx.fillStyle = '#C89B67';
    ctx.fillRect(0, 0, 512, 128);

    // Carved molding borders
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(0, 0, 512, 8);
    ctx.fillRect(0, 120, 512, 8);
    ctx.fillStyle = '#E5C294';
    ctx.fillRect(0, 8, 512, 4);
    ctx.fillRect(0, 116, 512, 4);

    // Repeated Lotus Petals & Diamond Chevrons
    for (let x = 16; x < 512; x += 48) {
      // Lotus petal
      ctx.beginPath();
      ctx.moveTo(x, 64);
      ctx.bezierCurveTo(x + 12, 20, x + 24, 20, x + 24, 64);
      ctx.bezierCurveTo(x + 24, 108, x + 12, 108, x, 64);
      ctx.fillStyle = '#6E451F';
      ctx.fill();
      ctx.strokeStyle = '#F3D8B0';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner jewel highlight
      ctx.beginPath();
      ctx.arc(x + 12, 64, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFDE9E';
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 1);
    this.cache.set(key, texture);
    return texture;
  }

  // 3. Pierced Stone Jali Latticework Texture (Alpha mask)
  getJaliTexture(): THREE.CanvasTexture {
    const key = 'jali_texture';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Solid stone frame
    ctx.fillStyle = '#B88B57';
    ctx.fillRect(0, 0, 256, 256);

    // Cutout geometric star & octagonal perforations (black = cutout)
    ctx.fillStyle = '#1A1410';
    for (let y = 16; y < 256; y += 32) {
      for (let x = 16; x < 256; x += 32) {
        // Octagonal piercing
        ctx.beginPath();
        const r = 9;
        for (let a = 0; a < 8; a++) {
          const angle = (a / 8) * Math.PI * 2 + Math.PI / 8;
          const px = x + Math.cos(angle) * r;
          const py = y + Math.sin(angle) * r;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    this.cache.set(key, texture);
    return texture;
  }
}

export const heritageMaterials = new HeritageMaterialFactory();

