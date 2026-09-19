document.addEventListener("DOMContentLoaded", function () {
    const banner = document.getElementById("cookie-banner");
    const btnAccept = document.getElementById("cookie-accept");
    const btnReject = document.getElementById("cookie-reject");
    const btnReset = document.getElementById("reset-cookie-preference");

    const consent = localStorage.getItem("welcome_cookie_consent");

    // Carrega o Google Analytics somente após o consentimento do usuário
    function loadAnalytics() {
        if (window.gaLoaded) return; // Evita carregar duplicado
        window.gaLoaded = true;

        // Configuração base do dataLayer e gtag
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', 'G-Q71QZDFR70');

        // Injeta a tag script assíncrona do GA4
        const scriptGtag = document.createElement("script");
        scriptGtag.async = true;
        scriptGtag.src = "https://www.googletagmanager.com/gtag/js?id=G-Q71QZDFR7";
        document.head.appendChild(scriptGtag);
    }

    // Exibe o banner se não houver decisão prévia salva
    if (!consent) {
        if (banner) banner.style.display = "block";
    } else if (consent === "accepted") {
        loadAnalytics();
    }

    // Ação: Aceitar Cookies
    if (btnAccept) {
        btnAccept.addEventListener("click", function () {
            localStorage.setItem("welcome_cookie_consent", "accepted");
            if (banner) banner.style.display = "none";
            loadAnalytics();
        });
    }

    // Ação: Recusar Cookies
    if (btnReject) {
        btnReject.addEventListener("click", function () {
            localStorage.setItem("welcome_cookie_consent", "rejected");
            if (banner) banner.style.display = "none";
        });
    }

    // Ação: Redefinir Preferências (Página de Privacidade)
    if (btnReset) {
        btnReset.addEventListener("click", function () {
            localStorage.removeItem("welcome_cookie_consent");
            alert("Preferências de cookies redefinidas. Atualize a página para alterar suas opções.");
            location.reload();
        });
    }
});