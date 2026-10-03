// Fotos reais da galeria da home (prefixo real-, ver regra 17). Cada foto pode ter mais de uma categoria.
// A ordem aqui é a ordem na página: alto padrão e planejados primeiro.
export type Categoria = "planejados" | "alto-padrao" | "comercial" | "movel-pronto";

export const categorias: { id: Categoria; nome: string }[] = [
  { id: "planejados", nome: "Planejados" },
  { id: "alto-padrao", nome: "Alto padrão" },
  { id: "comercial", nome: "Comercial" },
  { id: "movel-pronto", nome: "Móvel pronto" },
];

export const galeria: { foto: string; alt: string; legenda: string; cat: Categoria[] }[] = [
  { foto: "real-cozinha-alto-padrao", alt: "Cozinha planejada branca com portas almofadadas, torre de fornos e nichos iluminados", legenda: "Cozinha planejada com torre quente", cat: ["planejados", "alto-padrao"] },
  { foto: "real-guarda-roupa-vidro", alt: "Guarda-roupa com portas de correr em vidro fumê e coluna de nichos iluminados", legenda: "Guarda-roupa com portas de vidro", cat: ["planejados", "alto-padrao"] },
  { foto: "real-closet-ripado", alt: "Closet planejado com portas em madeira, puxadores pretos e sanca iluminada", legenda: "Closet planejado", cat: ["planejados", "alto-padrao"] },
  { foto: "real-cozinha-integrada", alt: "Cozinha integrada com balcão ripado, armários cinza e painel de TV com LED", legenda: "Cozinha integrada à sala", cat: ["planejados", "alto-padrao"] },
  { foto: "real-armario-comercial", alt: "Armários e prateleiras planejados para estoque de loja", legenda: "Estoque de loja", cat: ["comercial", "planejados"] },
  { foto: "real-banheiro", alt: "Gabinete de banheiro com espelheira e nicho iluminado", legenda: "Banheiro planejado", cat: ["planejados", "alto-padrao"] },
  { foto: "real-parede-planejada", alt: "Parede inteira de armários planejados com nichos, gaveteiro e espaço para TV", legenda: "Parede planejada com nichos", cat: ["planejados"] },
  { foto: "real-painel-ripado-led", alt: "Painel ripado de madeira com TV e rack iluminado", legenda: "Painel ripado com LED", cat: ["planejados", "alto-padrao"] },
  { foto: "real-estante-escritorio", alt: "Estante de ferro preto com prateleiras e gaveteiro em madeira", legenda: "Estante para escritório", cat: ["comercial"] },
  { foto: "real-cozinha-ilha", alt: "Cozinha branca com ilha em granito", legenda: "Cozinha com ilha", cat: ["planejados", "alto-padrao"] },
  { foto: "real-dormitorio-planejado", alt: "Dormitório planejado com armários aéreos, escrivaninha e guarda-roupa de canto", legenda: "Dormitório planejado", cat: ["planejados"] },
  { foto: "real-balcao-copa", alt: "Balcão de copa com frigobar embutido e cesto aramado", legenda: "Copa de escritório", cat: ["comercial"] },
  { foto: "real-quarto-planejado", alt: "Quarto planejado com guarda-roupa de correr, painel de TV e escrivaninha", legenda: "Quarto planejado", cat: ["planejados"] },
  { foto: "real-cozinha-americana", alt: "Cozinha americana com balcão ripado e armários aéreos", legenda: "Cozinha americana", cat: ["planejados"] },
  { foto: "real-cozinha-cinza", alt: "Cozinha planejada cinza com bancada de granito preto", legenda: "Cozinha planejada", cat: ["planejados"] },
  { foto: "real-guarda-roupa-espelho", alt: "Guarda-roupa azul com porta de correr espelhada", legenda: "Guarda-roupa de correr", cat: ["movel-pronto"] },
  { foto: "real-guarda-roupa-madeira", alt: "Guarda-roupa de seis portas em madeira", legenda: "Guarda-roupa 6 portas", cat: ["movel-pronto"] },
  { foto: "real-cristaleira", alt: "Cristaleira com portas de vidro e iluminação interna", legenda: "Cristaleira com LED", cat: ["movel-pronto"] },
  { foto: "real-rack-led", alt: "Rack baixo com iluminação de LED", legenda: "Rack com LED", cat: ["movel-pronto"] },
];
