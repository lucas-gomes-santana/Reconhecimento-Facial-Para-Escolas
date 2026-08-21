# Script bash para instalação de dependências do projeto

set -e 

if ! command -v pnpm &> /dev/null; then
    echo "pnpm não foi encontrado, instalando..."
    npm install -g pnpm
fi

echo "Instalando dependências do projeto..."

cd backend
pnpm install

cd ../frontend
pnpm install
