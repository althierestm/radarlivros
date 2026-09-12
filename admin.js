import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-app.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-app.appspot.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// === SISTEMA DE LOGIN CRIPTOGRAFADO (CLIENT-SIDE) ===

// Função nativa do navegador para criar Hash (Mão Única)
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

  // Nós misturamos usuário e senha para gerar um Hash único e mais forte (Salting)
  const tentativaHash = await gerarHash(user + pass);
  
  // Este é o Hash pré-calculado de "Althieres" + "@radarlivros26"
  const hashAutorizado = "739546059c118cd9bebc1b2ddc5c404cf939632832960fdf6e689db3163eb077";

  if (tentativaHash === hashAutorizado) {
    // Acesso Garantido
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    
    // Salva na sessão (se a página atualizar, tem que logar de novo - segurança extra)
    sessionStorage.setItem('admin_auth', 'true');
  } else {
    msgDiv.textContent = "Usuário ou senha incorretos.";
  }
}

// === SISTEMA DE UPLOAD PARA O FIREBASE ===

window.fazerUploadLivro = async function() {
  // Verifica segurança da sessão
  if (sessionStorage.getItem('admin_auth') !== 'true') return;

  const title = document.getElementById('book-title').value;
  const genre = document.getElementById('book-genre').value;
  const coverFile = document.getElementById('book-cover').files[0];
  const pdfFile = document.getElementById('book-pdf').files[0];
  const statusDiv = document.getElementById('upload-status');
  const btnUpload = document.getElementById('btn-upload');

  if (!title || !coverFile || !pdfFile) {
    statusDiv.innerHTML = '<span class="erro">Preencha todos os campos e anexe os arquivos.</span>';
    return;
  }

  btnUpload.disabled = true;
  btnUpload.textContent = "Enviando... Aguarde";
  
  try {
    statusDiv.innerHTML = "Enviando Capa...";
    const coverUrl = await uploadParaStorage(coverFile, `capas/${Date.now()}_${coverFile.name}`);
    
    statusDiv.innerHTML = "Enviando PDF... (Isso pode demorar)";
    const pdfUrl = await uploadParaStorage(pdfFile, `livros/${Date.now()}_${pdfFile.name}`);

    statusDiv.innerHTML = "Registrando no Catálogo...";
    
    // Salva os dados textuais e as URLs no Firestore Database
    await addDoc(collection(db, "books"), {
      title: title,
      genre: genre,
      cover_url: coverUrl,
      pdf_url: pdfUrl,
      timestamp: Date.now()
    });

    statusDiv.innerHTML = '<span class="sucesso">Livro publicado com sucesso! Ele já aparece na Home.</span>';
    
    // Limpa o formulário
    document.getElementById('book-title').value = '';
    document.getElementById('book-cover').value = '';
    document.getElementById('book-pdf').value = '';

  } catch (erro) {
    console.error(erro);
    statusDiv.innerHTML = '<span class="erro">Erro no envio. Verifique o console.</span>';
  } finally {
    btnUpload.disabled = false;
    btnUpload.textContent = "Adicionar Livro";
  }
}

// Função auxiliar para fazer o upload do arquivo físico e retornar a URL limpa
function uploadParaStorage(file, caminho) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, caminho);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        // Você pode calcular progresso em % aqui se quiser no futuro
      }, 
      (error) => { reject(error); }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
