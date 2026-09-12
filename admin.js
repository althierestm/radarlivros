import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyClRQgFaBzbrf2sgLPIezfh4OzL1r0A1FI",
  authDomain: "radar-livros-oficial.firebaseapp.com",
  projectId: "radar-livros-oficial",
  storageBucket: "radar-livros-oficial.firebasestorage.app",
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
  const generos = ["Fantasia", "Ficção Científica", "Romance", "Negócios"];

  for (const genero of generos) {
    const q = query(collection(db, "books"), where("genre", "==", genero));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) continue;

    const row = document.createElement('div');
    row.className = 'genre-row';
    
    const titulo = document.createElement('h3');
    titulo.className = 'genre-title';
    titulo.textContent = genero;
    row.appendChild(titulo);

    const slider = document.createElement('div');
    slider.className = 'book-slider';

    querySnapshot.forEach((doc) => {
      const livro = doc.data();
      const card = document.createElement('div');
      card.className = 'book-card';
      
      card.onclick = () => {
        localStorage.setItem('livro_atual_url', livro.pdf_url);
        window.location.href = 'leitor.html';
      };
      
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

document.addEventListener('DOMContentLoaded', carregarCatalogo);
