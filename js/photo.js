document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const blackScreen = document.getElementById('blackScreen');
    const countdownText = document.getElementById('countdownText');
    const progressCounter = document.getElementById('progressCounter');
    const startBtn = document.getElementById('startBtn');
    const invertBtn = document.getElementById('invertBtn');
    const doneBtn = document.getElementById('doneBtn');
    const flash = document.getElementById('flash');
    const photoContainer = document.getElementById('photoContainer');
  
    const bnwFilter = document.getElementById('bnwFilterId');
    const sepiaFilter = document.getElementById('sepiaFilterId');
    const normalFilter = document.getElementById('normalFilterId');
  
    let images = [];
    let invertBtnState = false;
    let currentFilter = "none";
  
    async function startCamera() {
      try {
        const constraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
          setTimeout(() => {
            blackScreen.style.opacity = 0;
            setTimeout(() => blackScreen.style.display = 'none', 1000);
          }, 500);
        };
      } catch (err) {
        console.error("Camera Access Denied", err);
        alert("Please enable camera permissions in your browser settings.");
      }
    }
  
    if (bnwFilter) {
      bnwFilter.addEventListener('click', () => {
        currentFilter = "grayscale(100%)";
        video.style.filter = currentFilter;
      });
    }
  
    if (sepiaFilter) {
      sepiaFilter.addEventListener('click', () => {
        currentFilter = "sepia(100%)";
        video.style.filter = currentFilter;
      });
    }
  
    if (normalFilter) {
      normalFilter.addEventListener('click', () => {
        currentFilter = "none";
        video.style.filter = currentFilter;
      });
    }
  
    if (invertBtn) {
      invertBtn.addEventListener('click', () => {
        invertBtnState = !invertBtnState;
        cameraInvertSwitch();
      });
    }
  
    function cameraInvertSwitch() {
      const scaleValue = invertBtnState ? '-1' : '1';
      photoContainer.style.transform = `scaleX(${scaleValue})`;
      video.style.transform = `scaleX(${scaleValue})`;
    }
  
    async function startPhotobooth() {
      images = [];
      photoContainer.innerHTML = '';
      startBtn.innerHTML = 'Capturing...';
      startBtn.disabled = true;
      progressCounter.textContent = "0/3";
  
      for (let i = 0; i < 3; i++) {
        await showCountdown();
        flash.style.opacity = 1;
        setTimeout(() => flash.style.opacity = 0, 200);
  
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
  
        ctx.filter = currentFilter;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
        const imageData = canvas.toDataURL('image/png');
        images.push(imageData);
  
        const imgElement = document.createElement('img');
        imgElement.src = imageData;
        imgElement.classList.add('photo');
        photoContainer.appendChild(imgElement);
  
        progressCounter.textContent = `${i + 1}/3`;
  
        if (i < 2) await new Promise(res => setTimeout(res, 3000));
      }
  
      startBtn.innerHTML = 'Retake';
      startBtn.disabled = false;
      doneBtn.style.display = 'block';
    }
  
    async function showCountdown() {
      countdownText.style.display = "block";
      for (let countdown = 3; countdown > 0; countdown--) {
        countdownText.textContent = countdown;
        await new Promise(res => setTimeout(res, 1000));
      }
      countdownText.style.display = "none";
    }
  
    if (doneBtn) {
      doneBtn.addEventListener('click', () => storeImageArray());
    }
  
    function storeImageArray() {
      let loadedImages = 0;
      let storedImages = [];
  
      images.forEach((imgData, index) => {
        const img = new Image();
        img.src = imgData;
        img.onload = () => {
          if (invertBtnState) {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            tempCtx.translate(img.width, 0);
            tempCtx.scale(-1, 1);
            tempCtx.drawImage(img, 0, 0, img.width, img.height);
            storedImages[index] = tempCanvas.toDataURL('image/png');
          } else {
            storedImages[index] = imgData;
          }
          loadedImages++;
  
          if (loadedImages === 3) {
            sessionStorage.setItem('photoArray', JSON.stringify(storedImages));
            window.location.href = 'customize.html';
          }
        };
      });
    }
  
    startCamera();
  
    if (startBtn) {
      startBtn.addEventListener('click', () => startPhotobooth());
    }
  });