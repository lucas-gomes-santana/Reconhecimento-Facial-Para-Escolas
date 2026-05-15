# Script bash para iniciar o projeto em desenvolvimento

set -e

echo "Iniciando backend..."
(cd backend && node server.js) &

echo "Iniciando frontend..."
(cd frontend && pnpm dev)

wait