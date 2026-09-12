import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

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
const storage = getStorage(app);

window.tentarLogin = function() {
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value;
  const msgDiv = document.getElementById('login-msg');

  // Verificação direta para garantir o seu acesso imediato
  if (user === "Althieres" && pass === "@radarlivros26") {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    sessionStorage.setItem('admin_auth', 'true');
  } else {
    msgDiv.textContent = "Usuário ou senha incorretos. Verifique letras maiúsculas.";
  }
}

window.fazerUploadLivro = async function() {
  if (sessionStorage.getItem('admin_auth') !== 'true') return;

  const title = document.getElementById('book-title').value;
  const author = document.getElementById('book-author').value;
  const genre = document.getElementById('book-genre').value;
  const coverFile = document.getElementById('book-cover').files[0];
  const pdfFile = document.getElementById('book-pdf').files[0];
  
  const statusDiv = document.getElementById('upload-status');
  const btnUpload = document.getElementById('btn-upload');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');

  if (!title || !author || !coverFile || !pdfFile) {
    statusDiv.innerHTML = '<span class="erro" style="color: #f44336;">Preencha todos os campos e anexe os arquivos.</span>';
    return;
  }

  btnUpload.disabled = true;
  btnUpload.textContent = "Enviando arquivos...";
  progressContainer.style.display = 'block'; 
  progressBar.style.width = '0%';
  
  try {
    statusDiv.innerHTML = "Passo 1/2: Enviando Capa...";
    const coverUrl = await uploadComProgresso(coverFile, `capas/${Date.now()}_${coverFile.name}`, progressBar, statusDiv);
    
    statusDiv.innerHTML = "Passo 2/2: Enviando Livro (PDF)...";
    progressBar.style.width = '0%'; 
    const pdfUrl = await uploadComProgresso(pdfFile, `livros/${Date.now()}_${pdfFile.name}`, progressBar, statusDiv);

    statusDiv.innerHTML = "Registrando no Catálogo...";
    
    await addDoc(collection(db, "books"), {
      title: title,
      author: author,
      genre: genre,
      cover_url: coverUrl,
      pdf_url: pdfUrl,
      timestamp: Date.now()
    });

    statusDiv.innerHTML = '<span class="sucesso" style="color: #4caf50;">Livro publicado com sucesso!</span>';
    
    document.getElementById('book-title').value = '';
    document.getElementById('book-author').value = '';
    document.getElementById('book-cover').value = '';
    document.getElementById('book-pdf').value = '';
    
    setTimeout(() => { progressContainer.style.display = 'none'; }, 3000);

  } catch (erro) {
    console.error(erro);
    statusDiv.innerHTML = '<span class="erro" style="color: #f44336;">Erro no envio. Verifique o console.</span>';
  } finally {
    btnUpload.disabled = false;
    btnUpload.textContent = "Adicionar Livro";
  }
}

function uploadComProgresso(file, caminho, barraHtml, statusHtml) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, caminho);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        barraHtml.style.width = progress + '%';
        if (statusHtml.innerHTML.includes("PDF")) {
            statusHtml.innerHTML = `Enviando PDF... ${Math.round(progress)}%`;
        }
      }, 
      (error) => { reject(error); }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
