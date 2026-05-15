set -e 

if ! command -v pnpm &> /dev/null; then
    echo "pnpm could not be found, installing..."
    npm install -g pnpm
fi

echo "Instalando dependências do projeto..."

cd backend
pnpm install

cd ../frontend
pnpm install
