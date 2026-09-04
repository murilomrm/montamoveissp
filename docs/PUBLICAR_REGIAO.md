# Publicar uma região

1. Abra `src/data/regioes.json` e ache a região pelo `slug`.
2. Preencha `paragrafoUnico` com 60 a 120 palavras sobre o lugar de verdade: tipo de prédio ou casa, portaria, elevador de serviço, estacionamento, perfil dos móveis mais comuns. O nome da região precisa aparecer no texto. Não copie frase de outra região.
3. Confira `bairrosVizinhos` (4 a 6 nomes). Os que também existem na lista viram links "Regiões próximas".
4. Marque `"publicada": true`.
5. `npm run build`. O `check-seo` avisa se a região publicada estiver sem texto (ela sai com `noindex`).
6. Confira que `dist/sitemap-0.xml` lista `/montador-de-moveis/<slug>/`.
7. Commit e push. O deploy é automático.

Para tirar uma região do ar, mude `publicada` para `false`. A página deixa de ser gerada.

Prioridade (1, 2, 3) só muda a ordem em que a região aparece nas listas. Prioridade 1 aparece na home, no rodapé e nas páginas de serviço.
