const form = document.querySelector("#contact");
const status = document.querySelector("#enviar-contato");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  status.textContent = "Enviando...";

  const formData = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      status.textContent = "Mensagem enviada com sucesso!";
      form.reset();
    } else {
      status.textContent = "Não foi possível enviar a mensagem.";
    }
  } catch {
    status.textContent = "Erro ao enviar a mensagem.";
  }
});