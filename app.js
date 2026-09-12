import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC9__kb5yQ3UvFyDkUcs5OQZnSAytuQvT8",
  authDomain: "radarlivros-2c06c.firebaseapp.com",
  projectId: "radarlivros-2c06c",
  storageBucket: "radarlivros-2c06c.firebasestorage.app",
  messagingSenderId: "912450942857",
  appId: "1:912450942857:web:7d8dfb4db550a688565358",
  measurementId: "G-0X49WC273H"
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
