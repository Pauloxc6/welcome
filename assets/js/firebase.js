import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";


const firebaseConfig = {
    apiKey: "AIzaSyB67Z-zED6uDNi7AMVz4S96XdHH11JKi04",
    authDomain: "portifolio-vendas-f963a.firebaseapp.com",
    projectId: "portifolio-vendas-f963a",
    storageBucket: "portifolio-vendas-f963a.firebasestorage.app",
    messagingSenderId: "345527982066",
    appId: "1:345527982066:web:77ac0c088408d383b03d6b",
    measurementId: "G-FJ668BYLMB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

let chartInstance = null;

// Elementos da Interface
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const btnLogout = document.getElementById('btn-logout');
const productForm = document.getElementById('product-form');

// 1. GERENCIAMENTO DE AUTENTICAÇÃO
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        carregarDashboard();
        carregarProdutos();
        carregarVendas();
    } else {
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    try {
        await signInWithEmailAndPassword(auth, email, senha);
    } catch (error) {
        alert("Erro na autenticação: " + error.message);
    }
});

btnLogout.addEventListener('click', () => signOut(auth));

// 2. NAVEGAÇÃO POR ABAS
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// 3. CADASTRAR PRODUTO NO FIRESTORE
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Garante que o usuário está autenticado no Firebase
    if (!auth.currentUser) {
        alert("Sua sessão expirou. Faça login novamente.");
        return;
    }

    const novoProduto = {
        nome: document.getElementById('prod-nome').value,
        categoria: document.getElementById('prod-categoria').value,
        preco: parseFloat(document.getElementById('prod-preco').value),
        descricao: document.getElementById('prod-desc').value,
        linkCheckout: document.getElementById('prod-link').value,
        criadoEm: serverTimestamp() // Utiliza o timestamp oficial do Firestore
    };

    try {
        await addDoc(collection(db, "produtos"), novoProduto);
        alert("Produto cadastrado com sucesso!");
        productForm.reset();
        carregarProdutos();
    } catch (error) {
        console.error("Erro ao cadastrar:", error);
        alert("Erro ao cadastrar produto: " + error.message);
    }
});

// 4. CARREGAR PRODUTOS CADASTRADOS E DELETAR
async function carregarProdutos() {
    const tbody = document.getElementById('produtos-table-body');
    try {
        const querySnapshot = await getDocs(collection(db, "produtos"));
        tbody.innerHTML = '';
        document.getElementById('total-produtos').textContent = querySnapshot.size;

        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="5" style="color: #6b7280;">Nenhum produto cadastrado.</td></tr>';
            return;
        }

        querySnapshot.forEach((documento) => {
            const prod = documento.data();
            const precoFormatado = typeof prod.preco === 'number' ? prod.preco.toFixed(2) : '0.00';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${prod.nome || ''}</strong></td>
                <td>${prod.categoria || ''}</td>
                <td style="color: #10b981; font-weight: bold;">R$ ${precoFormatado}</td>
                <td><a href="${prod.linkCheckout || '#'}" target="_blank" style="color: #60a5fa;">Acessar Link</a></td>
                <td>
                    <button class="btn btn-danger btn-delete" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" data-id="${documento.id}">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Event listeners para os botões de exclusão
        tbody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const prodId = e.target.getAttribute('data-id');
                if (confirm("Deseja realmente remover este produto do catálogo?")) {
                    try {
                        await deleteDoc(doc(db, "produtos", prodId));
                        carregarProdutos();
                    } catch (err) {
                        alert("Erro ao deletar produto: " + err.message);
                    }
                }
            });
        });

    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        tbody.innerHTML = `<tr><td colspan="5" style="color: #ef4444;">Erro ao carregar produtos.</td></tr>`;
    }
}

// 5. CARREGAR VENDAS E ATUALIZAR DASHBOARD/GRÁFICOS
async function carregarVendas() {
    const tbody = document.getElementById('vendas-table-body');
    try {
        const q = query(collection(db, "vendas"), orderBy("data", "desc"));
        const querySnapshot = await getDocs(q);

        let faturamentoTotal = 0;
        tbody.innerHTML = '';

        document.getElementById('total-vendas').textContent = querySnapshot.size;

        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="4" style="color: #6b7280;">Nenhuma venda registrada ainda.</td></tr>';
            document.getElementById('total-faturamento').textContent = "R$ 0,00";
            renderizarGrafico([]);
            return;
        }

        const vendasData = [];

        querySnapshot.forEach((doc) => {
            const venda = doc.data();
            const valor = parseFloat(venda.valor) || 0;
            faturamentoTotal += valor;
            vendasData.push(venda);

            const dataFormatada = venda.data && venda.data.seconds ? new Date(venda.data.seconds * 1000).toLocaleDateString('pt-BR') : 'N/A';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${venda.produto || 'Item'}</td>
                <td>${venda.clienteEmail || 'Anônimo'}</td>
                <td style="color: #10b981; font-weight: bold;">R$ ${valor.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('total-faturamento').textContent = `R$ ${faturamentoTotal.toFixed(2)}`;
        renderizarGrafico(vendasData);

    } catch (error) {
        console.error("Erro ao carregar vendas:", error);
        tbody.innerHTML = `<tr><td colspan="4" style="color: #ef4444;">Erro ao carregar vendas.</td></tr>`;
    }
}

function carregarDashboard() {
    // Função auxiliar
}

// 6. RENDERIZAR GRÁFICO (Chart.js)
function renderizarGrafico(vendas) {
    const chartEl = document.getElementById('salesChart');
    if (!chartEl) return;
    
    const ctx = chartEl.getContext('2d');
    if (chartInstance) chartInstance.destroy();

    const produtosMap = {};
    vendas.forEach(v => {
        const prod = v.produto || 'Outros';
        produtosMap[prod] = (produtosMap[prod] || 0) + (v.valor || 0);
    });

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(produtosMap).length ? Object.keys(produtosMap) : ['Sem Vendas'],
            datasets: [{
                label: 'Faturamento por Produto (R$)',
                data: Object.values(produtosMap).length ? Object.values(produtosMap) : [0],
                backgroundColor: '#10b981',
                borderColor: '#059669',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#9ca3af' } }
            },
            scales: {
                x: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } },
                y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } }
            }
        }
    });
}
