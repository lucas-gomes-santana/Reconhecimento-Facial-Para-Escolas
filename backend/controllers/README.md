## Nota importante

Alguns parâmetros req de algumas funções dos controllers estão marcados com underline como prefixo, ficando **\_req**. Isso é uma convenção especial do Typescript
que marca esses parâmetros como "intencionalmente não utilizados". O compilador assume que \_req não vai ser usado e não reporta o erro TS6133 ("declared but its value is never read").

Não é recomendável remover os parâmetros req não utilizados pois o Express chama os handlers de rota sempre com a mesma ordem posicional de argumentos independentemente
da assinatura declarada:

```ts
fn(req, res, next);
```

Portanto, remover o parâmetro não apenas "quebra a assinatura": ele \*\*desloca todos os argumentosrecebidos e faz o handler falhar silenciosamente.
Qualquer função registrada como handler de rota (`router.get/post/put/patch/delete`) recebe `(req, res)` por posição. Por isso a regra vale para praticamente todos
os controllers
