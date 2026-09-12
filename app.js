import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyClRQgFaBzbrf2sgLPIezfh4OzL1r0A1FI",
  authDomain: "radar-livros-oficial.firebaseapp.com",
  projectId: "radar-livros-oficial",
  storageBucket: "radar-livros-oficial.appspot.com",
  messagingSenderId: "784518870656",
  appId: "1:784518870656:web:c78e85da339a890217d865",
  measurementId: "G-7EWKKF749P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

async function carregarCatalogo() {
  const container = document.getElementById('catalogo-container');
  
  if (!container) {
    console.error("ERRO: O elemento #catalogo-container não foi encontrado no index.html!");
    return;
  }

  container.innerHTML = '<p style="color: #fff; text-align: center; padding: 40px;">Carregando biblioteca...</p>';

  try {
    // Busca todos os livros do Firestore de uma vez
    const querySnapshot = await getDocs(collection(db, "books"));
    
    if (querySnapshot.empty) {
      container.innerHTML = '<p style="color: #aaa; text-align: center; padding: 40px; font-size: 16px;">Nenhum livro cadastrado no catálogo ainda. Acesse o Painel Admin para adicionar.</p>';
      return;
    }

    container.innerHTML = ''; // Limpa o aviso de carregando

    // Agrupa os livros por gênero dinamicamente
    const livrosPorGenero = {};
    querySnapshot.forEach((doc) => {
      const livro = doc.data();
      const genero = livro.genre || "Outros";
      if (!livrosPorGenero[genero]) {
        livrosPorGenero[genero] = [];
      }
      livrosPorGenero[genero].push(livro);
    });

    // Cria as linhas de carrossel para cada gênero encontrado
    for (const [genero, livros] of Object.entries(livrosPorGenero)) {
      const row = document.createElement('div');
      row.className = 'genre-row';
      row.style.marginBottom = '30px';
      
      const titulo = document.createElement('h3');
      titulo.className = 'genre-title';
      titulo.textContent = genero;
      titulo.style.color = '#fff';
      titulo.style.fontSize = '20px';
      titulo.style.marginBottom = '15px';
      titulo.style.paddingLeft = '40px';
      row.appendChild(titulo);

      const slider = document.createElement('div');
      slider.className = 'book-slider';
      slider.style.display = 'flex';
      slider.style.gap = '20px';
      slider.style.overflowX = 'auto';
      slider.style.paddingLeft = '40px';
      slider.style.paddingBottom = '15px';

      livros.forEach((livro) => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.style.cursor = 'pointer';
        card.style.flex = '0 0 160px';
        card.style.transition = 'transform 0.3s ease';
        
        card.onmouseenter = () => card.style.transform = 'scale(1.05)';
        card.onmouseleave = () => card.style.transform = 'scale(1)';

        card.onclick = () => {
          localStorage.setItem('livro_atual_url', livro.pdf_url);
          window.location.href = 'leitor.html';
        };
        
        const img = document.createElement('img');
        img.src = livro.cover_url;
        img.alt = `Capa de ${livro.title}`;
        img.style.width = '100%';
        img.style.height = '230px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '6px';
        
        card.appendChild(img);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'book-info';
        infoDiv.style.padding = '8px 2px';
        infoDiv.innerHTML = `
          <h4 style="font-size: 13px; margin: 0 0 4px 0; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${livro.title}">${livro.title}</h4>
          <p style="font-size: 11px; margin: 0; color: #007bff; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${livro.author}">${livro.author || 'Autor desconhecido'}</p>
        `;
        card.appendChild(infoDiv);

        slider.appendChild(card);
      });

      row.appendChild(slider);
      container.appendChild(row);
    }

  } catch (erro) {
    console.error("Erro ao carregar o catálogo do Firebase:", erro);
    container.innerHTML = '<p style="color: #f44336; text-align: center; padding: 40px;">Erro ao carregar os livros. Verifique o console (F12).</p>';
  }
}

document.addEventListener('DOMContentLoaded', carregarCatalogo);
