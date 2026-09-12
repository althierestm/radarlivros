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
  const hashAutorizado = "45601720498d25d99deab09d8816d958a04156ae7cbeab70a30baef04e4cf64d";

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
  const author = document.getElementById('book-author').value; // Pegando o autor
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

  // Prepara a UI para o Upload
  btnUpload.disabled = true;
  btnUpload.textContent = "Enviando arquivos...";
  progressContainer.style.display = 'block'; // Mostra a barra vazia
  progressBar.style.width = '0%';
  
  try {
    statusDiv.innerHTML = "Passo 1/2: Enviando Capa...";
    const coverUrl = await uploadComProgresso(coverFile, `capas/${Date.now()}_${coverFile.name}`, progressBar, statusDiv);
    
    statusDiv.innerHTML = "Passo 2/2: Enviando Livro (PDF)...";
    progressBar.style.width = '0%'; // Zera a barra para o PDF que é maior
    const pdfUrl = await uploadComProgresso(pdfFile, `livros/${Date.now()}_${pdfFile.name}`, progressBar, statusDiv);

    statusDiv.innerHTML = "Registrando no Catálogo do Firebase...";
    
    // Adiciona ao banco de dados, agora incluindo o campo Author
    await addDoc(collection(db, "books"), {
      title: title,
      author: author,
      genre: genre,
      cover_url: coverUrl,
      pdf_url: pdfUrl,
      timestamp: Date.now()
    });

    statusDiv.innerHTML = '<span class="sucesso" style="color: #4caf50;">Livro publicado com sucesso! Já está na Home.</span>';
    
    // Limpeza após o sucesso
    document.getElementById('book-title').value = '';
    document.getElementById('book-author').value = '';
    document.getElementById('book-cover').value = '';
    document.getElementById('book-pdf').value = '';
    
    // Esconde a barra depois de 2 segundos
    setTimeout(() => { progressContainer.style.display = 'none'; }, 2000);

  } catch (erro) {
    console.error(erro);
    statusDiv.innerHTML = '<span class="erro" style="color: #f44336;">Erro no envio. Pode ser a conexão ou arquivo grande demais.</span>';
  } finally {
    btnUpload.disabled = false;
    btnUpload.textContent = "Adicionar Novo Livro";
  }
}

// === NOVA FUNÇÃO COM BARRA DE PROGRESSO REAL-TIME ===
function uploadComProgresso(file, caminho, barraHtml, statusHtml) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, caminho);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        // Calcula a porcentagem
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        
        // Atualiza a barra vermelha e o texto
        barraHtml.style.width = progress + '%';
        
        // Se quiser ver a porcentagem escrita em cima da barra
        if (statusHtml.innerHTML.includes("PDF")) {
            statusHtml.innerHTML = `Enviando PDF... ${Math.round(progress)}%`;
        }
      }, 
      (error) => { reject(error); }, 
      async () => {
        // Quando terminar, pega a URL final
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
