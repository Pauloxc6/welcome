const systemLog = document.getElementById("system-log");
const logText = document.getElementById("log-text");

const logs = [
    "Initializing portfolio...",
    "Loading GitHub API...",
    "Checking repositories...",
    "Loading system modules...",
    "Initializing security protocols...",
    "Scanning available projects...",
    "Connection established.",
    "Visitor detected.",
    "Checking permissions...",
    "Access granted.",
    "Searching for vulnerabilities...",
    "0 vulnerabilities found.",
    "Probably.",
    "System running normally.",
    "Welcome, visitor.",
    "Don't inspect the source code. 👀",
    "Seriously...",
    "You are still reading this?",
    "sudo rm -rf /... just kidding.",
    "Have fun exploring."
];

let currentLog = 0;

const typingSpeed = 45;
const visibleTime = 2500;
const nextLogDelay = 700;


/*
 * Digita o texto caractere por caractere
 */
function typeText(text) {
    return new Promise((resolve) => {
        let index = 0;

        logText.textContent = "";

        const typing = setInterval(() => {

            logText.textContent += text[index];

            index++;

            if (index >= text.length) {
                clearInterval(typing);
                resolve();
            }

        }, typingSpeed);
    });
}


/*
 * Mostra um log
 */
async function showLog(message) {

    systemLog.classList.add("show");

    await typeText(message);

    await new Promise(resolve => {
        setTimeout(resolve, visibleTime);
    });

    systemLog.classList.remove("show");

    await new Promise(resolve => {
        setTimeout(resolve, nextLogDelay);
    });
}


/*
 * Loop dos logs
 */
async function startLogs() {

    while (true) {

        await showLog(logs[currentLog]);

        currentLog++;

        if (currentLog >= logs.length) {
            currentLog = 0;
        }
    }
}


/*
 * Inicializa depois que a página carregar
 */
window.addEventListener("load", () => {

    setTimeout(() => {
        startLogs();
    }, 1500);

});