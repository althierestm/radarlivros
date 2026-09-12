// Importações CDN para projetos estáticos no GitHub Pages
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Configuração do seu Firebase (Você pegará no Console do Firebase)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-app.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-app.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Efeito na Navbar ao rolar a página
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

// Função para buscar e renderizar os livros
async function carregarCatalogo() {
  const container = document.getElementById('catalogo-container');
  
  // Em um cenário real, você busca isso da coleção 'genres' no Firestore.
  // Aqui, simulamos a lista de gêneros para agilizar:
  const generos = ["Fantasia", "Ficção Científica", "Romance", "Desenvolvimento Pessoal"];

  for (const genero of generos) {
    // Busca os livros deste gênero no Firestore
    const q = query(collection(db, "books"), where("genre", "==", genero));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) continue; // Pula gêneros vazios

    // Cria a estrutura HTML da prateleira (Row)
    const row = document.createElement('div');
    row.className = 'genre-row';
    
    const titulo = document.createElement('h3');
    titulo.className = 'genre-title';
    titulo.textContent = genero;
    row.appendChild(titulo);

    const slider = document.createElement('div');
    slider.className = 'book-slider';

    // Cria os cards dos livros dinamicamente
    querySnapshot.forEach((doc) => {
      const livro = doc.data();
      const card = document.createElement('div');
      card.className = 'book-card';
      // Passa a URL do PDF (armazenada no Firebase Storage) para a lógica do leitor
      card.onclick = () => abrirLeitor(livro.pdf_url); 
      
      const img = document.createElement('img');
      img.src = livro.cover_url;
      img.alt = `Capa de ${livro.title}`;
      
      card.appendChild(img);
      slider.appendChild(card);
    });

    row.appendChild(slider);
    container.appendChild(row);
  }
}

// Inicia o carregamento quando a página carregar
document.addEventListener('DOMContentLoaded', carregarCatalogo);

// Função global para transição de página
window.abrirLeitor = function(pdfUrl) {
  // Transição suave: Adiciona uma classe de fade out na tela inicial
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  
  setTimeout(() => {
    // Redireciona para a tela do leitor enviando a URL do PDF via Query String
    // ou salvando no localStorage para o leitor.html recuperar
    localStorage.setItem('livro_atual_url', pdfUrl);
    window.location.href = 'leitor.html';
  }, 500);
}
