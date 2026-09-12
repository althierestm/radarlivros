pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const pdfUrl = localStorage.getItem('livro_atual_url');
const bookContainer = document.getElementById('book');
const loadingScreen = document.getElementById('loading-screen');
const flipSound = document.getElementById('flip-sound');

if (!pdfUrl) {
  window.location.href = 'index.html';
}

async function renderizarLivro() {
  const loadingTask = pdfjsLib.getDocument(pdfUrl);
  const pdf = await loadingTask.promise;
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.2 }); 
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: ctx, viewport: viewport }).promise;

    const pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.appendChild(canvas);
    bookContainer.appendChild(pageDiv);
  }

  const pageFlip = new StPageFlip.PageFlip(bookContainer, {
    width: 400,
    height: 600,
    size: "stretch",
    minWidth: 300,
    maxWidth: 800,
    minHeight: 400,
    maxHeight: 1000,
    showCover: true,
    mobileScrollSupport: false 
  });

  pageFlip.loadFromHTML(document.querySelectorAll('.page'));
  loadingScreen.style.display = 'none';

  pageFlip.on('flip', () => {
    flipSound.currentTime = 0;
    flipSound.play().catch(() => {}); 
  });
}

renderizarLivro();

let hudTimer;
const hud = document.getElementById('hud');
const readerContainer = document.getElementById('reader-container');
const btnSepia = document.getElementById('btn-sepia');

function resetHudTimer() {
  hud.classList.add('active');
  clearTimeout(hudTimer);
  hudTimer = setTimeout(() => { hud.classList.remove('active'); }, 3000);
}

document.addEventListener('mousemove', resetHudTimer);
document.addEventListener('touchstart', resetHudTimer);
resetHudTimer(); 

btnSepia.addEventListener('click', () => {
  readerContainer.classList.toggle('theme-sepia');
});
