# Script bash usado para remover dados de collections específicas após os testes da aplicação

MONGO_URI="mongodb://localhost:27017"
DATABASE="facedb"

mongosh "$MONGO_URI/$DATABASE" --eval '
db.responsavels.deleteMany({});
db.vinculos.deleteMany({});
'