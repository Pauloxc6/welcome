import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB67Z-zED6uDNi7AMVz4S96XdHH11JKi04",
    authDomain: "portifolio-vendas-f963a.firebaseapp.com",
    projectId: "portifolio-vendas-f963a",
    storageBucket: "portifolio-vendas-f963a.firebasestorage.app",
    messagingSenderId: "345527982066",
    appId: "1:345527982066:web:77ac0c088408d383b03d6b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function escutarVitrineEmTempoReal() {
    const grid = document.getElementById('products-grid');

    // Consulta ordenada pelos mais recentes
    const q = query(collection(db, "produtos"), orderBy("criadoEm", "desc"));

    // O onSnapshot escuta alterações na coleção em tempo real
    onSnapshot(q, (snapshot) => {
        grid.innerHTML = '';

        if (snapshot.empty) {
            grid.innerHTML = '<p style="color: #9ca3af;">Nenhum produto disponível no momento.</p>';
            return;
        }

        snapshot.forEach((doc) => {
            const prod = doc.data();
            const precoFormatado = typeof prod.preco === 'number' ? prod.preco.toFixed(2) : '0.00';

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div>
                    <span class="product-badge">${prod.categoria || 'GERAL'}</span>
                    <br><br>
                    <h3 class="product-title">${prod.nome || 'Produto sem nome'}</h3>
                    <p class="product-description">${prod.descricao || ''}</p>
                </div>
                <div>
                    <div class="product-price">R$ ${precoFormatado}</div>
                    <a href="${prod.linkCheckout || '#'}" target="_blank" rel="noopener noreferrer" class="btn-buy">
                        Comprar Agora
                    </a>
                </div>
            `;
            grid.appendChild(card);
        });
    }, (error) => {
        console.error("Erro ao escutar atualizações da vitrine:", error);
        grid.innerHTML = '<p style="color: #ef4444;">Erro ao carregar o catálogo de produtos.</p>';
    });
}

// Inicia a escuta em tempo real assim que o DOM carregar
document.addEventListener('DOMContentLoaded', escutarVitrineEmTempoReal);