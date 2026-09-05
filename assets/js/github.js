const username = "Pauloxc6";

const selectedRepositories = [
    "academic-resources",
    "project-homelab",
    "vb-check",
    "hashcrack"
];

const repositories = document.querySelector("#repositories");


async function loadRepositories() {

    try {

        const repos = await Promise.all(
            selectedRepositories.map(async repoName => {

                const response = await fetch(
                    `https://api.github.com/repos/${username}/${repoName}`
                );

                if (!response.ok) {
                    throw new Error(
                        `Repositório não encontrado: ${repoName}`
                    );
                }

                return response.json();

            })
        );


        repositories.innerHTML = "";


        repos.forEach(repo => {

            const card = document.createElement("a");

            card.className = "repo-card";

            card.href = repo.html_url;

            card.target = "_blank";

            card.rel = "noopener noreferrer";


            card.innerHTML = `
                <div class="repo-header">

                    <span class="repo-name">
                        📁 ${repo.name}
                    </span>

                    <span class="repo-arrow">
                        →
                    </span>

                </div>


                <p class="repo-description">
                    ${repo.description || "Sem descrição"}
                </p>


                <div class="repo-info">

                    <span>
                        ● ${repo.language || "N/A"}
                    </span>

                    <span>
                        ★ ${repo.stargazers_count}
                    </span>

                    <span>
                        ⑂ ${repo.forks_count}
                    </span>

                </div>
            `;


            repositories.appendChild(card);

        });

    } catch (error) {

        repositories.innerHTML = `
            <p class="repo-error">
                Não foi possível carregar os repositórios.
            </p>
        `;

        console.error(error);
    }
}


loadRepositories();