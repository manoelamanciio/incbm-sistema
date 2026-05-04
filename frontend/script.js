// ── DADOS DOS 65 MEMBROS DA PLANILHA ──────────────────────────
let MEMBROS = []
const API_URL = "http://localhost:8080/membros";
async function carregarMembros() {
    try {
        const resposta = await fetch(API_URL);
        const dados = await resposta.json();

        MEMBROS = dados;

        atualizarStats();
        renderMembros();
        renderAniv();

    } catch (erro) {
        console.error("Erro ao carregar membros:", erro);
        toast("Erro ao carregar dados do servidor", "erro");
    }
}

const MESES = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MESES_CURTO = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
let editIdx = null, delIdx = null;

// ── INICIALIZAÇÃO ────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('hd-date').textContent =
        new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    carregarMembros(); // 🔥 AGORA VEM DO BACKEND
});

// ── STATS ────────────────────────────────────────────────────
function atualizarStats() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const lideranca = ['PASTOR', 'PASTOR PRESIDENTE', 'DIACONISA', 'DIACONISA / SECRETÁRIA',
        'SECRETÁRIA', 'TESOUREIRO', 'V. TESOUREIRO', 'EVANGELISTA',
        'DIRIGENTE DP. INFANTIL', 'V. DIRIGENTE DP. INFANTIL'];
    const ativos = MEMBROS.filter(m => m.cargo !== 'IN MEMORIAN');
    document.getElementById('st-total').textContent = MEMBROS.length;
    document.getElementById('st-membros').textContent = ativos.filter(m => m.cargo === 'MEMBRO').length;
    document.getElementById('st-lideranca').textContent = ativos.filter(m => lideranca.includes(m.cargo)).length;
    document.getElementById('st-aniv').textContent = MEMBROS.filter(m => m.mes === mesAtual).length;
}

// ── BADGE CARGO ──────────────────────────────────────────────
function badgeCargo(c) {
    const s = (c || '').toUpperCase();
    if (s.includes('PASTOR')) return `<span class="badge badge-pastor">${c}</span>`;
    if (s.includes('DIACONISA')) return `<span class="badge badge-diaconisa">${c}</span>`;
    if (s.includes('SECRETÁRIA')) return `<span class="badge badge-secretaria">${c}</span>`;
    if (s.includes('TESOUREIRO')) return `<span class="badge badge-tesoureiro">${c}</span>`;
    if (s.includes('EVANGELISTA')) return `<span class="badge badge-evangelista">${c}</span>`;
    if (s.includes('MEMORIAN')) return `<span class="badge badge-memorian">${c}</span>`;
    if (s.includes('DIRIGENTE')) return `<span class="badge badge-diaconisa">${c}</span>`;
    return `<span class="badge badge-membro">${c}</span>`;
}

function iniciais(n) {
    const p = n.split(' ').filter(Boolean);
    if (p.length >= 2) return (p[0][0] + (p[p.length - 1][0])).toUpperCase();
    return n.substring(0, 2).toUpperCase();
}

// ── RENDER TABELA ────────────────────────────────────────────
function renderMembros() {
    const busca = (document.getElementById('busca').value || '').toLowerCase();
    const fcargo = (document.getElementById('filtro-cargo').value || '').toLowerCase();
    const tbody = document.getElementById('tbody');

    let lista = MEMBROS.filter((m, i) => {
        const ok_busca = !busca || m.nome.toLowerCase().includes(busca) || m.cargo.toLowerCase().includes(busca);
        const ok_cargo = !fcargo || m.cargo.toLowerCase().includes(fcargo);
        return ok_busca && ok_cargo;
    });

    if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="icon">🕊️</div><p>Nenhum membro encontrado.</p></div></td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map((m, li) => {
        const realIdx = MEMBROS.indexOf(m);
        const aniv = m.dia && m.mes ? `${m.dia}/${MESES_CURTO[m.mes]}` : '—';
        return `<tr>
      <td style="color:var(--muted);font-size:12px">${li + 1}</td>
      <td>
        <div style="display:flex;align-items:center">
          <span class="nome-cell"><span class="iniciais">${iniciais(m.nome)}</span>${nomeProprio(m.nome)}</span>
        </div>
      </td>
      <td>${badgeCargo(m.cargo)}</td>
      <td style="font-size:13px;color:var(--muted)">${aniv}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-outline btn-sm" onclick="abrirEdicao(${realIdx})">✏️</button>
          <button class="btn btn-danger btn-sm"  onclick="pedirDel(${realIdx})">🗑️</button>
        </div>
      </td>
    </tr>`;
    }).join('');
}

function nomeProprio(s) {
    const stop = new Set(['DA', 'DE', 'DO', 'DOS', 'DAS', 'E']);
    return s.toLowerCase().split(' ').map(w => stop.has(w.toUpperCase()) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ── RENDER ANIVERSÁRIOS ───────────────────────────────────────
function renderAniv() {
    const sel = parseInt(document.getElementById('sel-mes').value);
    const hoje = new Date();
    const mes = sel === 0 ? hoje.getMonth() + 1 : sel;
    const diaHoje = hoje.getDate();
    const mesHoje = hoje.getMonth() + 1;

    const lista = MEMBROS
        .filter(m => m.mes === mes && m.cargo !== 'IN MEMORIAN')
        .sort((a, b) => a.dia - b.dia);

    document.getElementById('aniv-header').textContent =
        `${lista.length} aniversariante${lista.length !== 1 ? 's' : ''} em ${MESES[mes]}`;

    const grid = document.getElementById('aniv-grid');
    if (!lista.length) {
        grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="icon">🎂</div><p>Nenhum aniversariante neste mês.</p></div>`;
        return;
    }

    grid.innerHTML = lista.map(m => {
        const eHoje = m.dia === diaHoje && m.mes === mesHoje;
        const esMes = m.mes === mesHoje;
        const cls = eHoje ? 'aniv-card hoje' : esMes ? 'aniv-card este-mes' : 'aniv-card';
        const tag = eHoje ? '<span class="aniv-tag">🎉 Hoje!</span>' : '';
        return `<div class="${cls}">
      <div class="aniv-date"><div class="d">${m.dia}</div><div class="m">${MESES_CURTO[m.mes]}</div></div>
      <div class="aniv-info">
        <div class="nome">${nomeProprio(m.nome)}</div>
        <div class="cargo">${m.cargo}</div>
        ${tag}
      </div>
    </div>`;
    }).join('');
}

// ── MODAL NOVO ───────────────────────────────────────────────
function abrirNovo() {
    editIdx = null;
    document.getElementById('form-titulo').textContent = '✦ Novo Membro';
    document.getElementById('form-membro').reset();
    abrir('ov-form');
}

// ── MODAL EDIÇÃO ─────────────────────────────────────────────
function abrirEdicao(i) {
    editIdx = i;
    const m = MEMBROS[i];
    document.getElementById('form-titulo').textContent = '✏️ Editar Membro';
    document.getElementById('f-nome').value = m.nome;
    document.getElementById('f-cargo').value = m.cargo;
    document.getElementById('f-dia').value = m.dia || '';
    document.getElementById('f-mes').value = m.mes || '';
    abrir('ov-form');
}

// ── SALVAR ───────────────────────────────────────────────────
async function salvar(e) {
    e.preventDefault();

    const m = {
        nome: document.getElementById('f-nome').value.trim().toUpperCase(),
        cargo: document.getElementById('f-cargo').value,
        dia: parseInt(document.getElementById('f-dia').value) || null,
        mes: parseInt(document.getElementById('f-mes').value) || null
    };

    console.log("ENVIANDO PARA API:", m);

    try {
        let url = API_URL;
        let method = "POST";

        if (editIdx !== null) {
            const id = MEMBROS[editIdx].id;

            console.log("EDITANDO ID:", id);

            url = `${API_URL}/${id}`;
            method = "PUT";
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(m)
        });

        console.log("STATUS:", response.status);

        if (!response.ok) {
            throw new Error("Erro HTTP: " + response.status);
        }

        toast("Salvo com sucesso!", "ok");
        fechar('ov-form');
        carregarMembros();

    } catch (err) {
        console.error("ERRO AO SALVAR:", err);
        toast("Erro ao salvar", "erro");
    }
}

// ── EXCLUIR ──────────────────────────────────────────────────
function pedirDel(i) {
    delIdx = i;
    document.getElementById('del-nome').textContent = nomeProprio(MEMBROS[i].nome);
    abrir('ov-del');
}
async function confirmarDel() {
    if (delIdx === null) return;

    try {
        await fetch(`${API_URL}/${MEMBROS[delIdx].id}`, {
            method: "DELETE"
        });

        toast('Membro removido.', 'ok');
        fechar('ov-del');
        carregarMembros();

    } catch (erro) {
        console.error(erro);
        toast("Erro ao deletar", "erro");
    }
}

// ── TABS ─────────────────────────────────────────────────────
function aba(id, btn) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + id).classList.add('active');
    btn.classList.add('active');
}

// ── OVERLAY ──────────────────────────────────────────────────
function abrir(id) { document.getElementById(id).classList.add('open'); }
function fechar(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('click', e => {
    if (e.target.classList.contains('overlay')) e.target.classList.remove('open');
});

// ── TOAST ────────────────────────────────────────────────────
function toast(msg, tipo) {
    const el = document.createElement('div');
    el.className = `toast toast-${tipo}`;
    el.textContent = (tipo === 'ok' ? '✦ ' : '✕ ') + msg;
    document.getElementById('toasts').appendChild(el);
    setTimeout(() => el.remove(), 3000);
}