import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB67Z-zED6uDNi7AMVz4S96XdHH11JKi04",
    authDomain: "portifolio-vendas-f963a.firebaseapp.com",
    projectId: "portifolio-vendas-f963a",
    storageBucket: "portifolio-vendas-f963a.firebasestorage.app",
    messagingSenderId: "345527982066",
    appId: "1:345527982066:web:77ac0c088408d383b03d6b"
};

// Garante que o app não é inicializado duplicadamente
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

let cursosCache = [];

function escutarCursosEmTempoReal() {
    // Tenta primeiro buscar ordenado por data
    let q = query(collection(db, "cursos"), orderBy("criadoEm", "desc"));

    onSnapshot(q, (snapshot) => {
        // Se a busca retornar vazia (por falta de timestamp nos docs antigos), faz busca simples
        if (snapshot.empty) {
            onSnapshot(collection(db, "cursos"), (fallbackSnapshot) => {
                processarSnapshot(fallbackSnapshot);
            });
            return;
        }
        processarSnapshot(snapshot);
    }, (error) => {
        console.warn("Erro ao ordenar por data. A tentar busca sem orderBy:", error);
        // Fallback caso falte índice ou timestamp
        onSnapshot(collection(db, "cursos"), (fallbackSnapshot) => {
            processarSnapshot(fallbackSnapshot);
        });
    });
}

function processarSnapshot(snapshot) {
    cursosCache = [];
    snapshot.forEach((doc) => {
        cursosCache.push({ id: doc.id, ...doc.data() });
    });
    
    console.log("Cursos carregados na página pública:", cursosCache);

    const filtroAtivo = document.querySelector('.filter-button.active')?.dataset.filter || 'all';
    renderizarCursos(filtroAtivo);
}

function renderizarCursos(categoriaFiltro) {
    const grid = document.querySelector('.courses-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const cursosFiltrados = categoriaFiltro === 'all' 
        ? cursosCache 
        : cursosCache.filter(c => c.categoria === categoriaFiltro);

    if (cursosFiltrados.length === 0) {
        grid.innerHTML = '<p style="color: #9ca3af; grid-column: 1/-1;">Nenhum curso encontrado nesta categoria.</p>';
        return;
    }

    cursosFiltrados.forEach((curso) => {
        const precoFormatado = typeof curso.preco === 'number' ? curso.preco.toFixed(2) : '0.00';
        
        const article = document.createElement('article');
        article.className = 'course-card';
        article.dataset.category = curso.categoria;

        article.innerHTML = `
            <div class="course-icon">${curso.icone || '>_'}</div>
            <div class="course-content">
                <span class="course-category">${curso.categoria}</span>
                <h3>${curso.nome || 'Curso sem título'}</h3>
                <p>${curso.descricao || ''}</p>
                <div class="course-meta">
                    <span>${curso.tech || '💻 Tech'}</span>
                    <span>${curso.nivel || '📚 Geral'}</span>
                </div>
                <div class="course-bottom">
                    <strong>R$ ${precoFormatado}</strong>
                    <a href="${curso.linkCheckout || '#'}" target="_blank" rel="noopener noreferrer">
                        ${curso.linkCheckout ? 'Ver curso →' : 'Em Breve'}
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(article);
    });
}

function configurarFiltros() {
    const filterButtons = document.querySelectorAll('.filter-button');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const buttonClicked = e.currentTarget;
            
            filterButtons.forEach(b => b.classList.remove('active'));
            buttonClicked.classList.add('active');
            
            const selectedFilter = buttonClicked.dataset.filter || 'all';
            renderizarCursos(selectedFilter);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    configurarFiltros();
    escutarCursosEmTempoReal();
});