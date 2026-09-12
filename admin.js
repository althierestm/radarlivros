import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

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
const storage = getStorage(app);

async function gerarHash(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

window.tentarLogin = async function() {
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value;
  const msgDiv = document.getElementById('login-msg');

  const tentativaHash = await gerarHash(user + pass);
  const hashAutorizado = "739546059c118cd9bebc1b2ddc5c404cf939632832960fdf6e689db3163eb077";

  if (tentativaHash === hashAutorizado) {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    sessionStorage.setItem('admin_auth', 'true');
  } else {
    msgDiv.textContent = "Usuário ou senha incorretos.";
  }
}

window.fazerUploadLivro = async function() {
  if (sessionStorage.getItem('admin_auth') !== 'true') return;

  const title = document.getElementById('book-title').value;
  const genre = document.getElementById('book-genre').value;
  const coverFile = document.getElementById('book-cover').files[0];
  const pdfFile = document.getElementById('book-pdf').files[0];
  const statusDiv = document.getElementById('upload-status');
  const btnUpload = document.getElementById('btn-upload');

  if (!title || !coverFile || !pdfFile) {
    statusDiv.innerHTML = '<span class="erro" style="color: #f44336;">Preencha todos os campos e anexe os arquivos.</span>';
    return;
  }

  btnUpload.disabled = true;
  btnUpload.textContent = "Enviando... Aguarde";
  
  try {
    statusDiv.innerHTML = "Enviando Capa...";
    const coverUrl = await uploadParaStorage(coverFile, `capas/${Date.now()}_${coverFile.name}`);
    
    statusDiv.innerHTML = "Enviando PDF...";
    const pdfUrl = await uploadParaStorage(pdfFile, `livros/${Date.now()}_${pdfFile.name}`);

    statusDiv.innerHTML = "Registrando no Catálogo...";
    
    await addDoc(collection(db, "books"), {
      title: title,
      genre: genre,
      cover_url: coverUrl,
      pdf_url: pdfUrl,
      timestamp: Date.now()
    });

    statusDiv.innerHTML = '<span class="sucesso" style="color: #4caf50;">Livro publicado com sucesso!</span>';
    
    document.getElementById('book-title').value = '';
    document.getElementById('book-cover').value = '';
    document.getElementById('book-pdf').value = '';

  } catch (erro) {
    console.error(erro);
    statusDiv.innerHTML = '<span class="erro" style="color: #f44336;">Erro no envio. Verifique o console (F12).</span>';
  } finally {
    btnUpload.disabled = false;
    btnUpload.textContent = "Adicionar Livro";
  }
}

function uploadParaStorage(file, caminho) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, caminho);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed', null, error => reject(error), async () => resolve(await getDownloadURL(uploadTask.snapshot.ref)));
  });
}
