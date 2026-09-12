import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

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

window.tentarLogin = function() {
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value;
  const msgDiv = document.getElementById('login-msg');

  if (user === "Althieres" && pass === "@radarlivros26") {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    sessionStorage.setItem('admin_auth', 'true');
  } else {
    msgDiv.textContent = "Usuário ou senha incorretos.";
  }
}

window.salvarLivroComPastas = async function() {
  if (sessionStorage.getItem('admin_auth') !== 'true') return;

  const title = document.getElementById('book-title').value.trim();
  const author = document.getElementById('book-author').value.trim();
  const genre = document.getElementById('book-genre').value;
  const coverPath = document.getElementById('book-cover-path').value.trim();
  const pdfPath = document.getElementById('book-pdf-path').value.trim();
  
  const statusDiv = document.getElementById('upload-status');
  const btnUpload = document.getElementById('btn-upload');

  if (!title || !author || !coverPath || !pdfPath) {
    statusDiv.innerHTML = '<span style="color: #f44336;">Preencha todos os campos e caminhos.</span>';
    return;
  }

  btnUpload.disabled = true;
  btnUpload.textContent = "Salvando...";
  statusDiv.innerHTML = "Vinculando arquivos das pastas...";

  try {
    const baseUrl = "https://althierestm.github.io/radarlivros/";
    const coverUrl = baseUrl + coverPath;
    const pdfUrl = baseUrl + pdfPath;

    await addDoc(collection(db, "books"), {
      title: title,
      author: author,
      genre: genre,
      cover_url: coverUrl,
      pdf_url: pdfUrl,
      timestamp: Date.now()
    });

    statusDiv.innerHTML = '<span style="color: #4caf50;">Livro cadastrado com sucesso!</span>';
    
    document.getElementById('book-title').value = '';
    document.getElementById('book-author').value = '';
    document.getElementById('book-cover-path').value = '';
    document.getElementById('book-pdf-path').value = '';

  } catch (erro) {
    console.error(erro);
    statusDiv.innerHTML = '<span style="color: #f44336;">Erro ao salvar. Verifique o console.</span>';
  } finally {
    btnUpload.disabled = false;
    btnUpload.textContent = "Cadastrar Livro";
  }
}
