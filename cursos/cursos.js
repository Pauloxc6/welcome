const filterButtons =
    document.querySelectorAll(".filter-button");

const courseCards =
    document.querySelectorAll(".course-card");


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        const filter =
            button.dataset.filter;


        // Atualiza botão ativo

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");


        // Filtra os cursos

        courseCards.forEach(card => {

            const category =
                card.dataset.category;


            if (
                filter === "all" ||
                category === filter
            ) {

                card.style.display = "flex";

            } else {

                card.style.display = "none";

            }

        });

    });

});