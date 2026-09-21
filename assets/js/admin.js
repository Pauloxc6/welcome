import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp, 
    onSnapshot, 
    query, 
    orderBy, 
    doc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB67Z-zED6uDNi7AMVz4S96XdHH11JKi04",
    authDomain: "portifolio-vendas-f963a.firebaseapp.com",
    projectId: "portifolio-vendas-f963a",
    storageBucket: "portifolio-vendas-f963a.firebasestorage.app",
    messagingSenderId: "345527982066",
    appId: "1:345527982066:web:77ac0c088408d383b03d6b"
};

// Evita o erro de aplicação duplicada (duplicate-app)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app); // <- Define a variável db que estava faltando

// 4. Manipulação do Formulário de Cursos
const courseForm = document.getElementById('course-form');

if (courseForm) {
    courseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!auth.currentUser) return alert("Sessão expirada! Faça login novamente.");

        const novoCurso = {
            nome: document.getElementById('course-nome').value,
            categoria: document.getElementById('course-categoria').value,
            preco: parseFloat(document.getElementById('course-preco').value),
            icone: document.getElementById('course-icon').value,
            tech: document.getElementById('course-tech').value,
            nivel: document.getElementById('course-nivel').value,
            descricao: document.getElementById('course-desc').value,
            linkCheckout: document.getElementById('course-link').value,
            criadoEm: serverTimestamp()
        };

        try {
            await addDoc(collection(db, "cursos"), novoCurso);
            alert("Curso cadastrado com sucesso!");
            courseForm.reset();
        } catch (error) {
            alert("Erro ao cadastrar curso: " + error.message);
        }
    });
}

// 5. Listagem de Cursos no Painel Admin
function listarCursosAdmin() {
    const listaContainer = document.getElementById('lista-cursos-admin');
    if (!listaContainer) return;

    const q = query(collection(db, "cursos"), orderBy("criadoEm", "desc"));

    onSnapshot(q, (snapshot) => {
        listaContainer.innerHTML = '';

        if (snapshot.empty) {
            listaContainer.innerHTML = '<p style="color: #9ca3af; font-family: monospace;">Nenhum curso cadastrado ainda.</p>';
            return;
        }

        snapshot.forEach((documento) => {
            const curso = documento.data();
            const id = documento.id;
            const precoFormatado = typeof curso.preco === 'number' ? curso.preco.toFixed(2) : '0.00';

            const itemDiv = document.createElement('div');
            itemDiv.className = 'admin-item-card';
            itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: #0d0d0d; border: 1px solid #1f2937; padding: 1rem; border-radius: 6px; margin-bottom: 0.75rem;';

            itemDiv.innerHTML = `
                <div class="admin-item-info">
                    <h5 style="color: #fff; font-family: monospace; margin: 0 0 0.25rem 0;">
                        ${curso.icone || '>_'} ${curso.nome}
                    </h5>
                    <span style="color: #9ca3af; font-family: monospace; font-size: 0.8rem;">
                        [${curso.categoria}] - R$ ${precoFormatado} | Tech: ${curso.tech || 'N/A'}
                    </span>
                </div>
                <button class="btn-deletar-curso" data-id="${id}" style="background-color: #dc2626; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-family: monospace; font-weight: bold;">
                    Apagar
                </button>
            `;

            listaContainer.appendChild(itemDiv);
        });

        // Configura escutas para os botões de apagar
        document.querySelectorAll('.btn-deletar-curso').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const cursoId = e.target.getAttribute('data-id');
                if (confirm("Tem certeza de que deseja apagar este curso?")) {
                    try {
                        await deleteDoc(doc(db, "cursos", cursoId));
                        alert("Curso apagado com sucesso!");
                    } catch (err) {
                        console.error("Erro ao apagar curso:", err);
                        alert("Erro ao apagar curso!");
                    }
                }
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', listarCursosAdmin);