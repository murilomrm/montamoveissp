# PROMPTS NANO BANANA: FOTOS DO SITE (imagens que imitam foto real)

Este arquivo é separado do prompt de logo (aba 12 da planilha). Aqui o objetivo é gerar imagens fotorrealistas para substituir fotos reais no lançamento, já que ainda não há fotos de clientes e serviços. Assim que houver fotos reais, troque estas por elas: imagem gerada é uma ponte para o lançamento, não a estratégia definitiva.

**Nota de fluxo de trabalho:** estas imagens serão geradas em uma sessão separada, fora deste chat de planejamento (Nano Banana). O prompt do Claude Code (`PROMPT_CLAUDE_CODE.md`) já está avisado de que as fotos de `public/img/` no lançamento serão geradas por IA e não fotos reais, então os nomes de arquivo abaixo devem bater com o que o Claude Code espera.

## Regras gerais para todos os prompts

- Sempre pedir **fotorrealismo**, luz natural, sem estilo cartoon, sem 3D render, sem textura de ilustração.
- Sempre especificar: ambiente brasileiro comum (apartamento simples, prédio popular ou classe média), nada de decoração de revista americana.
- Nunca pedir rostos de pessoas reais ou celebridades. Peça "pessoa genérica, sem identificação de marca em roupas".
- Peça proporção 4:3 ou 16:9 conforme o uso (indicado em cada linha).
- Depois de gerar, faça upscale se a resolução vier baixa (o próprio Nano Banana ou um upscaler como Topaz/Real-ESRGAN).

## Lista de imagens e prompts

| Arquivo final | Uso | Proporção | Prompt |
|---|---|---|---|
| hero.jpg | Topo da home | 16:9 | Photorealistic photo of a Brazilian furniture assembly technician, around 35 years old, wearing a plain gray polo shirt and work pants, kneeling and assembling a wardrobe panel with a cordless screwdriver, inside a simple modern Brazilian apartment bedroom with natural window light, shallow depth of field, documentary photography style, realistic skin texture, no text, no logo, no brand names visible |
| montador-1.jpg | Sobre / equipe | 4:3 | Photorealistic photo of a Brazilian man in his 30s, plain gray polo shirt, holding a toolbox and a level tool, standing in front of an assembled wardrobe in a bright apartment room, confident neutral expression, natural daylight, documentary photography style, no text, no logo |
| montador-2.jpg | Serviço de cozinha | 4:3 | Photorealistic photo of a technician installing an upper kitchen cabinet on a wall in a small Brazilian apartment kitchen, using a drill, tools laid out on the counter, natural light, realistic, documentary style, no text, no logo |
| antes-depois-1-antes.jpg | Antes/depois guarda-roupa | 4:3 | Photorealistic photo of unopened flat-pack furniture boxes leaning against a bedroom wall in a simple Brazilian apartment, cardboard boxes with visible wood-panel edges, natural light, realistic, no text, no logo |
| antes-depois-1-depois.jpg | Antes/depois guarda-roupa | 4:3 | Photorealistic photo of a fully assembled modern white wardrobe with sliding doors in the same simple Brazilian apartment bedroom, natural light, clean finished look, tidy room, realistic, no text, no logo |
| antes-depois-2-antes.jpg | Antes/depois cozinha | 4:3 | Photorealistic photo of an empty kitchen wall with only brackets and markings for future cabinets, exposed wall, Brazilian apartment kitchen, natural light, realistic, no text, no logo |
| antes-depois-2-depois.jpg | Antes/depois cozinha | 4:3 | Photorealistic photo of a fully installed modern kitchen cabinet set on the same wall, white cabinets, clean finish, natural light, realistic, no text, no logo |
| ferramentas.jpg | Diferenciais | 4:3 | Photorealistic close-up photo of a professional furniture assembly toolbox open on the floor, cordless drill, allen key set, spirit level, tape measure, screws organized in small containers, natural light, realistic, top-down angle, no text, no logo |
| whatsapp-atendimento.jpg | Seção "como funciona" | 4:3 | Photorealistic photo of a hand holding a smartphone showing a generic chat app interface (blurred, no real brand UI), person sitting at a kitchen table, natural light, shallow depth of field, realistic, no readable text on screen, no logo |
| regiao-predio-sp.jpg | Fundo de páginas de região (genérico) | 16:9 | Photorealistic wide photo of a typical São Paulo residential street with mid-rise apartment buildings, overcast soft daylight, realistic urban Brazilian architecture, no visible text, no logos, no license plates, no identifiable storefronts |
| escritorio-montagem.jpg | Serviço de escritório | 4:3 | Photorealistic photo of a technician assembling an office desk and drawer unit in a small modern Brazilian coworking office, natural light, tidy space, realistic, documentary style, no text, no logo |
| cama-montagem.jpg | Serviço de camas | 4:3 | Photorealistic photo of a technician assembling a bed frame with storage drawers in a simple Brazilian bedroom, natural light, realistic, documentary style, no text, no logo |
| og-image.jpg | Compartilhamento em redes (1200x630) | 1.91:1 | Photorealistic photo of a furniture assembly technician working on a wardrobe in a bright apartment bedroom, wide framing with negative space on the left third for text overlay, natural light, realistic, documentary style, no text, no logo |
| favicon-base.png | Base do favicon | 1:1 | Simple flat icon of an allen key crossed with a screwdriver forming an M shape, navy blue #1F3A5F on white background, minimal, vector style, no gradient, no shadow, no text |

## Como usar

1. Gere cada imagem no Nano Banana com o prompt da tabela.
2. Peça 2 a 3 variações por linha e escolha a mais natural (evite mãos ou dedos deformados, erro comum em geração de pessoas).
3. Salve com o nome exato da coluna "Arquivo final" dentro de `public/img/`.
4. Redimensione/compacte em WebP antes de subir (o Claude Code já espera esse formato, ver `docs/FOTOS.md`).
5. Quando tiver fotos reais de serviços de verdade, substitua uma por vez, começando pelas de antes/depois, que são as que mais geram confiança.

## Aviso de transparência

Como estas imagens não retratam clientes ou serviços reais, evite qualquer legenda no site que afirme se tratar de "nosso cliente" ou "serviço realizado por nós" enquanto as imagens forem geradas por IA. Use legendas genéricas ("Montagem de guarda-roupa", "Instalação de armário de cozinha") em vez de alegar autenticidade que a imagem não tem.
