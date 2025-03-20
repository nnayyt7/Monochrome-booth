document.addEventListener('DOMContentLoaded', () => {
  const photoCanvas = document.getElementById('photoCanvas');
  const ctx = photoCanvas.getContext('2d');
  const colorOptions = document.querySelectorAll('.color-option');
  const downloadBtn = document.getElementById('downloadBtn');
  const effectOptions = document.querySelectorAll('.effect-option');
  const previewElement = document.querySelector('.preview');

  // Ukuran canvas yang lebih sesuai untuk format portrait/Instagram Story (9:16)
  photoCanvas.width = 320;
  photoCanvas.height = 570;

  // Konfigurasi default
  let frameColor = 'black';
  let filterEffect = 'none';
  let loadedImages = 0;
  let imageObjects = [];

  // Mapping gradient untuk masing-masing warna
  const gradients = {
    black: { start: "#000000", end: "#1a1a1a" },
    white: { start: "#ffffff", end: "#f0f0f0" },
    gray: { start: "#555555", end: "#888888" },
    darkbrown: { start: "#3E2723", end: "#5D4037" },
    lightbrown: { start: "#A1887F", end: "#D7CCC8" }
  };

  // Ambil foto dari sessionStorage
  const storedPhotos = JSON.parse(sessionStorage.getItem('photoArray'));

  // Tambahkan class selected ke opsi warna default
  document.querySelector('.color-option.black').classList.add('selected');

  // Fungsi untuk meningkatkan kualitas gambar
  function enhanceImageQuality() {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  // Fungsi untuk menerapkan efek vintage (atau efek lainnya)
  function applyVintageEffect(effect) {
    if (effect === 'none') return;
    const imageData = ctx.getImageData(0, 0, photoCanvas.width, photoCanvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
      if (effect === 'sepia') {
        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      } else if (effect === 'grayscale') {
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        data[i] = data[i + 1] = data[i + 2] = gray;
      } else if (effect === 'highcontrast') {
        data[i] = r > 127 ? 255 : 0;
        data[i + 1] = g > 127 ? 255 : 0;
        data[i + 2] = b > 127 ? 255 : 0;
      } else if (effect === 'vintage') {
        data[i] = Math.min(255, (r * 0.7) + 40);
        data[i + 1] = Math.min(255, (g * 0.7) + 20);
        data[i + 2] = Math.min(255, (b * 0.7));
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // Fungsi menghitung ukuran gambar agar sesuai dengan area yang dialokasikan
  function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth * ratio, height: srcHeight * ratio };
  }

  // Fungsi untuk mendapatkan posisi agar foto berada di tengah area yang dialokasikan
  function getPhotoPosition(photoWidth, photoHeight, areaWidth, areaHeight) {
    const x = (areaWidth - photoWidth) / 2;
    const y = (areaHeight - photoHeight) / 2;
    return { x, y };
  }

  // Fungsi untuk menggambar foto pada canvas
  function drawPhotos() {
    // Bersihkan canvas
    ctx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
    const photoAreaHeight = photoCanvas.height / 3;

    // Gambar frame dengan efek gradasi jika tersedia
    if (gradients[frameColor]) {
      const grad = ctx.createLinearGradient(0, 0, 0, photoCanvas.height);
      grad.addColorStop(0, gradients[frameColor].start);
      grad.addColorStop(1, gradients[frameColor].end);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = frameColor;
    }
    ctx.fillRect(0, 0, photoCanvas.width, photoCanvas.height);

    enhanceImageQuality();

    if (imageObjects.length === 3) {
      imageObjects.forEach((img, index) => {
        const yOffset = index * photoAreaHeight;
        const dimensions = calculateAspectRatioFit(
          img.width,
          img.height,
          photoCanvas.width - 60,  // Lebar maksimum (dengan margin)
          photoAreaHeight - 40     // Tinggi maksimum (dengan margin)
        );
        const position = getPhotoPosition(dimensions.width, dimensions.height, photoCanvas.width, photoAreaHeight);
        ctx.drawImage(img, position.x, yOffset + position.y, dimensions.width, dimensions.height);
      });

      // Gambar garis pemisah antar foto (menggunakan warna solid saja)
      ctx.fillStyle = frameColor;
      ctx.fillRect(0, photoAreaHeight - 2, photoCanvas.width, 4);
      ctx.fillRect(0, photoAreaHeight * 2 - 2, photoCanvas.width, 4);

      drawPerforations();
      applyVintageEffect(filterEffect);

      // Tambahkan watermark "photobooth"
      ctx.font = '21px Courier New';
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center';
      ctx.fillText('photobooth', photoCanvas.width / 2, photoCanvas.height - 6);
    }
  }

  // Fungsi menggambar perforasi (lubang-lubang di pinggir film)
  function drawPerforations() {
    const holeSize = 8;
    const spacing = 35;
    ctx.fillStyle = 'black';
    for (let y = spacing; y < photoCanvas.height; y += spacing) {
      ctx.beginPath();
      ctx.arc(15, y, holeSize, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let y = spacing; y < photoCanvas.height; y += spacing) {
      ctx.beginPath();
      ctx.arc(photoCanvas.width - 15, y, holeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Load foto dari sessionStorage
  if (storedPhotos && storedPhotos.length === 3) {
    storedPhotos.forEach((photo, index) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = photo;
      img.onload = () => {
        imageObjects[index] = img;
        loadedImages++;
        if (loadedImages === storedPhotos.length) {
          drawPhotos();
        }
      };
      img.onerror = () => {
        console.error('Error loading image');
        alert('Error loading one or more photos. Please try again.');
      };
    });
  } else {
    alert('No photos found. Please take photos first.');
    window.location.href = 'photo.html';
  }

  // Gabungkan event listener untuk opsi warna frame
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Hapus class 'selected' dari semua opsi
      colorOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');

      // Perbarui variabel frameColor berdasarkan data-color
      frameColor = option.dataset.color;

      // Perbarui kelas di elemen preview (sesuai CSS: .frame-black, .frame-white, dll.)
      previewElement.classList.remove('frame-black', 'frame-white', 'frame-gray', 'frame-darkbrown', 'frame-lightbrown');
      previewElement.classList.add('frame-' + option.dataset.color);

      drawPhotos();
    });
  });

  // Event listener untuk opsi efek (jika ada)
  if (effectOptions) {
    effectOptions.forEach(option => {
      option.addEventListener('click', () => {
        const selectedEffect = document.querySelector('.effect-option.selected');
        if (selectedEffect) {
          selectedEffect.classList.remove('selected');
        }
        option.classList.add('selected');
        filterEffect = option.dataset.effect;
        drawPhotos();
      });
    });
  }

  // Event listener untuk tombol download
  downloadBtn.addEventListener('click', () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = photoCanvas.width;
    tempCanvas.height = photoCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(photoCanvas, 0, 0);
    const dateStr = new Date().toLocaleDateString();
    tempCtx.font = '15px Courier New';
    tempCtx.fillStyle = 'red';
    tempCtx.textAlign = 'center';
    tempCtx.fillText(`taken on ${dateStr}`, photoCanvas.width / 2, photoCanvas.height - 25);
    const link = document.createElement('a');
    link.download = `retro-photobooth-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  });
});

downloadBtn.addEventListener('click', () => {
  alert('Photo downloaded successfully!');
  // Redirect to thanks.html after download
  window.location.href = 'thanks.html';
});

