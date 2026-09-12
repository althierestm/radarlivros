const pdfUrl = localStorage.getItem('livro_atual_url');

if (!pdfUrl) {
  alert("Nenhum livro selecionado!");
  window.location.href = 'index.html';
}

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

let pageFlip = null;
const statusDiv = document.getElementById('carregando-msg');
const bookContainer = document.getElementById('book');

async function iniciarLeitor() {
  try {
    statusDiv.textContent = "Baixando o livro...";
    
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdfDoc = await loadingTask.promise;
    const totalPaginas = pdfDoc.numPages;

    statusDiv.textContent = `Preparando ${totalPaginas} páginas...`;

    // Cria os elementos de página de forma otimizada
    for (let i = 1; i <= totalPaginas; i++) {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'page';
      pageDiv.dataset.pageNum = i;
      
      // Indicador de carregamento individual na página
      pageDiv.innerHTML = `<div style="display: flex; align-items: center; justify-content: height: 100%; color: #aaa; font-size: 12px; height: 100%;">Carregando pág. ${i}...</div>`;
      bookContainer.appendChild(pageDiv);
    }

    statusDiv.style.display = 'none';

    // Inicializa o StPageFlip imediatamente para o livro abrir rápido
    pageFlip = new St.PageFlip(bookContainer, {
      width: 550,
      height: 733,
      size: "stretch",
      minWidth: 315,
      maxWidth: 1000,
      minHeight: 400,
      maxHeight: 1200,
      maxShadowOpacity: 0.5,
      showCover: true,
      mobileScrollSupport: false
    });

    pageFlip.loadFromHTML(document.querySelectorAll('.page'));

    // Renderiza a página ativa sob demanda para não travar o navegador
    async function renderizarPaginaNoElemento(num) {
      const pageDiv = bookContainer.children[num - 1];
      if (!pageDiv || pageDiv.dataset.rendered === 'true') return;

      try {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: 1.0 }); // Escala otimizada para performance
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        pageDiv.innerHTML = '';
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/jpeg', 0.8);
        img.style.width = '100%';
        img.style.height = '100%';
        
        pageDiv.appendChild(img);
        pageDiv.dataset.rendered = 'true';
      } catch (err) {
        console.error("Erro ao renderizar página " + num, err);
      }
    }

    // Renderiza as primeiras páginas iniciais
    await renderizarPaginaNoElemento(1);
    await renderizarPaginaNoElemento(2);

    // Evento ao virar a página
    pageFlip.on('flip', async (e) => {
      const paginaAtual = e.data + 1;
      document.getElementById('page-num').textContent = paginaAtual;
      
      // Renderiza a página atual e as próximas vizinhas conforme o usuário lê
      await renderizarPaginaNoElemento(paginaAtual);
      if (paginaAtual + 1 <= totalPaginas) await renderizarPaginaNoElemento(paginaAtual + 1);
    });

  } catch (error) {
    console.error("Erro crítico ao carregar o leitor:", error);
    statusDiv.innerHTML = '<span style="color: #f44336;">Erro ao abrir o PDF. Verifique se o caminho no GitHub está correto (F12).</span>';
  }
}

window.proximaPagina = function() {
  if (pageFlip) pageFlip.flipNext();
}

window.paginaAnterior = function() {
  if (pageFlip) pageFlip.flipPrev();
}

window.alternarSepia = function() {
  document.body.classList.toggle('sepia-mode');
}

iniciarLeitor();
