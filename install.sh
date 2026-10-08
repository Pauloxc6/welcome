#!/usr/bin/env bash

# ==============================================================================
# Variáveis Globais de Cores ANSI
# ==============================================================================
export RESET="\e[0m"
export RED="\e[31;1m"
export GREEN="\e[32;1m"
export YELLOW="\e[33;1m"
export BLUE="\e[34;1m"
export PURPLE="\e[35;1m"
export CYAN="\e[36;1m"
export WHITE="\e[37;1m"

# ==============================================================================
# Configurações de Caminhos e Repositório Remoto
# ==============================================================================
readonly zoran_default="${HOME}/.local/share/zoran"
readonly rootdir="https://raw.githubusercontent.com/Pauloxc6/zoran/refs/heads/main/zoran.sh"
readonly path="${HOME}/.local/share"
readonly bin="${HOME}/.local/bin"

echo -e "${GREEN}[+]${RESET} Install zoran"

# Apenas garante que as pastas pai (~/.local/share e ~/.local/bin) existem
dirs=(
    "${bin}"
    "${path}"
)

# ==============================================================================
# Verificação e Criação da Estrutura Base (~/.local/bin e ~/.local/share)
# ==============================================================================
echo -e "${YELLOW}[*]${RESET} Verificando se os diretórios base existem"
for dir in "${dirs[@]}"; do
    if [[ ! -d "${dir}" ]]; then
        echo -e "${YELLOW}[${dir}]${RESET} Diretório não existe"
        if ! mkdir -p "${dir}"; then
            echo -e "${RED}[!]${RESET} Falha ao criar: ${dir}"
            exit 1
        fi
    else
        echo -e "${GREEN}[+]${RESET} Diretório ${dir} OK"
    fi
done

# ==============================================================================
# Checagem de Instalação Existente e Remoção Limpa
# ==============================================================================
if [[ -d "${zoran_default}" ]]; then
    echo -e "${YELLOW}[!]${RESET} Uma versão do zoran já está instalada"
    read -rp "[?] Deseja remover a versão atual? [s/N] " sn
    case "${sn,,}" in
        s|sim)
            echo -e "${YELLOW}[*]${RESET} Removendo versão já instalada"

            if ! rm -rf "${zoran_default}"; then
                echo -e "${RED}[!]${RESET} Falha ao remover: ${zoran_default}"
                exit 1
            fi

            if [[ -e "${bin}/zoran" || -L "${bin}/zoran" ]]; then
                if ! rm -f "${bin}/zoran"; then
                    echo -e "${RED}[!]${RESET} Falha ao remover: ${bin}/zoran"
                    exit 1
                fi
            fi
        ;;

        n|nao|não|"") echo -e "${CYAN}[*]${RESET} Instalação atual será mantida" ;;
        *) echo -e "${RED}[!]${RESET} Opção inválida" ; exit 1 ;;
    esac
fi

# ==============================================================================
# Criação do Diretório de Instalação do Zoran
# ==============================================================================
echo -e "${BLUE}[+]${RESET} Criando diretório de instalação"

if [[ ! -d "${zoran_default}" ]]; then
    if ! mkdir -p "${zoran_default}"; then
        echo -e "${RED}[!]${RESET} Falha ao criar diretório de instalação"
        exit 1
    fi
fi

# ==============================================================================
# Download do Script Principal do Zoran
# ==============================================================================
echo -e "${BLUE}[+]${RESET} Iniciando cópia dos arquivos"
if ! curl -s "${rootdir}" -o "${zoran_default}/zoran.sh"; then
    echo -e "${RED}[!]${RESET} Falha ao copiar os arquivos"
    exit 1
fi

# ==============================================================================
# Concessão de Permissão de Execução
# ==============================================================================
if ! chmod +x "${zoran_default}/zoran.sh"; then
    echo -e "${RED}[!]${RESET} Falha ao definir permissão de execução"
    exit 1
fi

# ==============================================================================
# Criação do Link Simbólico em ~/.local/bin/zoran
# ==============================================================================
if [[ -e "${bin}/zoran" || -L "${bin}/zoran" ]]; then
    rm -f "${bin}/zoran"
fi

if ! ln -s "${zoran_default}/zoran.sh" "${bin}/zoran"; then
    echo -e "${RED}[!]${RESET} Falha ao criar o link simbólico"
    exit 1
fi

# ==============================================================================
# Finalização do Processo de Instalação
# ==============================================================================
echo -e "${GREEN}[+]${RESET} zoran instalado com sucesso!"
echo -e "${CYAN}[+]${RESET} Execute '${WHITE}zoran --version${RESET}' para verificar a instalação"