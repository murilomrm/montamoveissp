#!/usr/bin/env bash
# Importa as fotos do site: renomeia, redimensiona e converte para WebP em public/img/.
#
# Uso:
#   ./scripts/importar-fotos.sh ~/Desktop/fotos          # mostra o plano, não escreve nada
#   ./scripts/importar-fotos.sh ~/Desktop/fotos --aplicar  # executa
#
# As fotos são lidas em ORDEM ALFABÉTICA do nome do arquivo. Se você salvou como
# 1.jpg, 2.jpg ... 13.jpg (ou foto-01, foto-02 ...), a ordem bate com a lista abaixo.
# Confira o plano impresso antes de usar --aplicar.

set -euo pipefail

ORIGEM="${1:-}"
APLICAR="${2:-}"
DESTINO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/public/img"

if [ -z "$ORIGEM" ] || [ ! -d "$ORIGEM" ]; then
  echo "Uso: $0 <pasta-com-as-fotos> [--aplicar]"
  echo "Exemplo: $0 ~/Desktop/fotos --aplicar"
  exit 1
fi

# Ordem em que as fotos foram enviadas. nome:largura
DESTINOS=(
  "hero:1280"
  "montador-retrato:1200"
  "cozinha-armario:1200"
  "caixas-fechadas:1200"
  "planejado-closet:1200"
  "cozinha-bancada:1280"
  "prateleiras:1200"
  "painel-tv:1200"
  "guarda-roupa:1280"
  "cozinha-planejada:1280"
  "escritorio-bancada:1280"
  "rack-suspenso:1280"
  "whatsapp-atendimento:1280"
)

DESCRICOES=(
  "montador ajoelhado parafusando lateral de guarda-roupa"
  "montador em pe com caixa de ferramentas e nivel"
  "polo azul fixando armario aereo, azulejo bege"
  "caixas planas encostadas na parede do quarto"
  "parafusando prateleira dentro do closet branco"
  "nivelando tampo cinza na ilha, janelao com predios"
  "de costas, parafusando prateleiras suspensas"
  "encaixando o painel de TV na sala"
  "encaixando prateleira no guarda-roupa de madeira clara"
  "medindo o tampo na cozinha planejada branca"
  "parafusando a bancada embaixo da janela"
  "instalando o rack suspenso na sala"
  "mao com celular na mesa da cozinha"
)

# Lista os arquivos de imagem da pasta, em ordem alfabética.
ARQUIVOS=()
while IFS= read -r linha; do
  ARQUIVOS+=("$linha")
done < <(find "$ORIGEM" -maxdepth 1 -type f \( \
    -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.heic" \
  \) | LC_ALL=C sort)

TOTAL_ENCONTRADOS=${#ARQUIVOS[@]}
TOTAL_ESPERADO=${#DESTINOS[@]}

if [ "$TOTAL_ENCONTRADOS" -eq 0 ]; then
  echo "Nenhuma imagem encontrada em: $ORIGEM"
  exit 1
fi

echo "Origem : $ORIGEM"
echo "Destino: $DESTINO"
echo "Encontradas: $TOTAL_ENCONTRADOS   Esperadas: $TOTAL_ESPERADO"
echo

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp nao encontrado. Instale com: brew install webp"
  exit 1
fi

echo "PLANO:"
printf '%-3s %-28s %-24s %-7s %s\n' "#" "ARQUIVO" "VIRA" "LARGURA" "A FOTO DEVE SER"
i=0
for arquivo in "${ARQUIVOS[@]}"; do
  if [ "$i" -ge "$TOTAL_ESPERADO" ]; then
    printf '%-3s %-28s %s\n' "$((i+1))" "$(basename "$arquivo")" "IGNORADA (sobrou)"
    i=$((i+1)); continue
  fi
  nome="${DESTINOS[$i]%%:*}"
  largura="${DESTINOS[$i]##*:}"
  printf '%-3s %-28s %-24s %-7s %s\n' "$((i+1))" "$(basename "$arquivo")" "$nome.webp" "$largura" "${DESCRICOES[$i]}"
  i=$((i+1))
done

if [ "$TOTAL_ENCONTRADOS" -lt "$TOTAL_ESPERADO" ]; then
  echo
  echo "Faltam $((TOTAL_ESPERADO - TOTAL_ENCONTRADOS)) foto(s). As que faltarem seguem como bloco cinza no site."
fi

if [ "$APLICAR" != "--aplicar" ]; then
  echo
  echo "Nada foi escrito. Confira a coluna 'A FOTO DEVE SER'."
  echo "Se a ordem estiver certa, rode de novo com --aplicar:"
  echo "  $0 \"$ORIGEM\" --aplicar"
  exit 0
fi

echo
mkdir -p "$DESTINO"
i=0
for arquivo in "${ARQUIVOS[@]}"; do
  [ "$i" -ge "$TOTAL_ESPERADO" ] && break
  nome="${DESTINOS[$i]%%:*}"
  largura="${DESTINOS[$i]##*:}"
  saida="$DESTINO/$nome.webp"
  # -resize L 0 mantem a proporcao original. Nao amplia imagem menor que a largura alvo.
  cwebp -quiet -q 80 -resize "$largura" 0 "$arquivo" -o "$saida"
  peso=$(du -h "$saida" | cut -f1 | tr -d ' ')
  echo "  ok  $nome.webp  ($peso)"
  i=$((i+1))
done

echo
echo "Pronto. $i foto(s) em public/img/."
echo "Agora rode: npm run build"
