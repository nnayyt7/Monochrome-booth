// Navigasi ke halaman photo.html saat tombol START diklik
document.getElementById('welcome-start').addEventListener('click', () => {
  window.location.href = 'photo.html';
});

// Animasi teks saat halaman dimuat
const heroHeader = document.querySelector('.hero-header');
const bigSubtext = document.querySelectorAll('.big-subtext');
const mainButton = document.querySelector('.main-button');

setTimeout(() => {
  heroHeader.style.opacity = '1';
}, 500);

setTimeout(() => {
  bigSubtext.forEach((text, index) => {
      setTimeout(() => {
          text.style.opacity = '1';
      }, index * 500);
  });
}, 1000);

setTimeout(() => {
  mainButton.style.opacity = '1';
}, 2500);

// Tambahkan nama pembuat di bagian bawah halaman dengan animasi
const footer = document.createElement('footer');
footer.innerHTML = '<p>© 2025 by @nnayyt_</p>';
footer.style.position = 'fixed';
footer.style.bottom = '0';
footer.style.width = '100%';
footer.style.textAlign = 'center';
footer.style.backgroundColor = 'var(--gray)';
footer.style.color = 'var(--white)';
footer.style.zIndex = '10';
footer.style.padding = '10px';
footer.style.opacity = '0';
footer.style.transition = 'opacity 2s ease-in-out';
document.body.appendChild(footer);

setTimeout(() => {
  footer.style.opacity = '1';
}, 3000);