// Camada simples de dados de demonstração.
// Preparada para futura integração com a API pública do ENEM (https://docs.enem.dev/introduction):
// basta trocar as funções abaixo por chamadas fetch mantendo o mesmo formato de objeto.

export const AREAS = [
  { id: "linguagens", nome: "Linguagens", cor: "#e0499b" },
  { id: "humanas", nome: "Ciências Humanas", cor: "#f2a33c" },
  { id: "natureza", nome: "Ciências da Natureza", cor: "#00a58e" },
  { id: "matematica", nome: "Matemática", cor: "#4338ca" },
];

export const ANOS = [2024, 2023, 2022, 2021];
export const DIFICULDADES = ["Fácil", "Médio", "Difícil"];

export const QUESTOES = [
  {
    id: "2023-mat-136",
    area: "matematica",
    ano: 2023,
    dificuldade: "Médio",
    disciplina: "Matemática",
    titulo: "Função do 1º grau e conta de energia",
    enunciado:
      "A conta de energia de uma residência é calculada por uma taxa fixa de R$ 32,00 somada a R$ 0,85 por quilowatt-hora (kWh) consumido. Em determinado mês, a família pagou R$ 202,00. Qual foi o consumo, em kWh, nesse mês?",
    alternativas: [
      { letra: "A", texto: "150 kWh" },
      { letra: "B", texto: "180 kWh" },
      { letra: "C", texto: "200 kWh" },
      { letra: "D", texto: "225 kWh" },
      { letra: "E", texto: "240 kWh" },
    ],
    correta: "C",
    resolucoes: [
      {
        id: "r1",
        autor: "Marina Alcântara",
        votos: 128,
        texto:
          "Monte a equação: 32 + 0,85x = 202. Subtraia 32 dos dois lados: 0,85x = 170. Divida por 0,85: x = 200 kWh. Dica: sempre separe a parte fixa da parte variável antes de dividir.",
      },
      {
        id: "r2",
        autor: "Prof. Caio Ribeiro",
        votos: 74,
        texto:
          "Outra forma: 202 - 32 = 170 reais são só de consumo. Como cada kWh custa 0,85, faça 170 ÷ 0,85 = 200. Resposta: alternativa C.",
      },
    ],
    comentarios: [
      {
        id: "c1",
        autor: "Beatriz Lima",
        texto: "Por que não posso dividir 202 por 0,85 direto?",
        respostas: [
          {
            id: "c1r1",
            autor: "Marina Alcântara",
            texto:
              "Porque a taxa fixa de R$ 32,00 não depende do consumo. Ela precisa sair da conta antes da divisão.",
          },
        ],
      },
    ],
  },
  {
    id: "2022-nat-092",
    area: "natureza",
    ano: 2022,
    dificuldade: "Difícil",
    disciplina: "Química",
    titulo: "Estequiometria na combustão do etanol",
    enunciado:
      "Na combustão completa do etanol (C2H6O), cada mol do combustível reage com oxigênio produzindo gás carbônico e água. Considerando a queima completa de 1 mol de etanol, quantos mols de CO2 são formados?",
    alternativas: [
      { letra: "A", texto: "1 mol" },
      { letra: "B", texto: "2 mols" },
      { letra: "C", texto: "3 mols" },
      { letra: "D", texto: "4 mols" },
      { letra: "E", texto: "6 mols" },
    ],
    correta: "B",
    resolucoes: [
      {
        id: "r1",
        autor: "Otávio Nunes",
        votos: 96,
        texto:
          "Balanceando: C2H6O + 3 O2 → 2 CO2 + 3 H2O. Como há 2 carbonos na molécula, formam-se 2 mols de CO2.",
      },
    ],
    comentarios: [],
  },
  {
    id: "2024-hum-045",
    area: "humanas",
    ano: 2024,
    dificuldade: "Fácil",
    disciplina: "História",
    titulo: "Era Vargas e legislação trabalhista",
    enunciado:
      "A criação da Consolidação das Leis do Trabalho (CLT), em 1943, é frequentemente associada ao governo de Getúlio Vargas. Essa política teve como efeito político central:",
    alternativas: [
      { letra: "A", texto: "O enfraquecimento imediato do sindicalismo urbano." },
      { letra: "B", texto: "A ampliação da base de apoio popular ao governo." },
      { letra: "C", texto: "A extinção do controle estatal sobre os sindicatos." },
      { letra: "D", texto: "A transferência do poder político para as oligarquias rurais." },
      { letra: "E", texto: "A abolição das relações de trabalho no campo." },
    ],
    correta: "B",
    resolucoes: [
      {
        id: "r1",
        autor: "Helena Prado",
        votos: 61,
        texto:
          "A CLT reuniu direitos já existentes e foi apresentada como uma 'doação' de Vargas aos trabalhadores, reforçando o vínculo entre o governo e as massas urbanas. Daí a alternativa B.",
      },
      {
        id: "r2",
        autor: "Diego Fontes",
        votos: 12,
        texto:
          "Cuidado com a letra C: o Estado manteve forte controle sindical (imposto sindical e unicidade), então ela é falsa.",
      },
    ],
    comentarios: [
      {
        id: "c1",
        autor: "Rafael Souza",
        texto: "Alguém tem um resumo curto sobre trabalhismo para revisar?",
        respostas: [],
      },
    ],
  },
  {
    id: "2021-lin-013",
    area: "linguagens",
    ano: 2021,
    dificuldade: "Médio",
    disciplina: "Português",
    titulo: "Função da linguagem em campanha publicitária",
    enunciado:
      "Uma campanha de vacinação usa o slogan: “Proteja quem você ama. Vacine-se hoje.” A função da linguagem predominante nesse enunciado é:",
    alternativas: [
      { letra: "A", texto: "Referencial" },
      { letra: "B", texto: "Poética" },
      { letra: "C", texto: "Conativa" },
      { letra: "D", texto: "Fática" },
      { letra: "E", texto: "Metalinguística" },
    ],
    correta: "C",
    resolucoes: [
      {
        id: "r1",
        autor: "Juliana Reis",
        votos: 88,
        texto:
          "Verbos no imperativo (“proteja”, “vacine-se”) e foco no interlocutor indicam função conativa (apelativa).",
      },
    ],
    comentarios: [],
  },
  {
    id: "2023-nat-118",
    area: "natureza",
    ano: 2023,
    dificuldade: "Médio",
    disciplina: "Física",
    titulo: "Energia potencial gravitacional",
    enunciado:
      "Um corpo de 2 kg é elevado a 5 m do solo. Considerando g = 10 m/s², a energia potencial gravitacional adquirida é de:",
    alternativas: [
      { letra: "A", texto: "10 J" },
      { letra: "B", texto: "25 J" },
      { letra: "C", texto: "50 J" },
      { letra: "D", texto: "100 J" },
      { letra: "E", texto: "200 J" },
    ],
    correta: "D",
    resolucoes: [
      {
        id: "r1",
        autor: "Lucas Amaral",
        votos: 45,
        texto: "Epg = m·g·h = 2 × 10 × 5 = 100 J.",
      },
    ],
    comentarios: [],
  },
  {
    id: "2022-mat-151",
    area: "matematica",
    ano: 2022,
    dificuldade: "Difícil",
    disciplina: "Matemática",
    titulo: "Probabilidade com dois dados",
    enunciado:
      "Dois dados honestos de seis faces são lançados simultaneamente. Qual é a probabilidade de a soma dos valores obtidos ser igual a 8?",
    alternativas: [
      { letra: "A", texto: "1/12" },
      { letra: "B", texto: "5/36" },
      { letra: "C", texto: "1/6" },
      { letra: "D", texto: "7/36" },
      { letra: "E", texto: "1/4" },
    ],
    correta: "B",
    resolucoes: [
      {
        id: "r1",
        autor: "Marina Alcântara",
        votos: 53,
        texto:
          "Casos favoráveis: (2,6), (3,5), (4,4), (5,3), (6,2) → 5. Total de casos: 36. Logo 5/36.",
      },
    ],
    comentarios: [],
  },
  {
    id: "2024-lin-007",
    area: "linguagens",
    ano: 2024,
    dificuldade: "Fácil",
    disciplina: "Literatura",
    titulo: "Modernismo brasileiro",
    enunciado:
      "A Semana de Arte Moderna de 1922 marcou a ruptura com padrões acadêmicos. Uma característica central da primeira fase modernista brasileira é:",
    alternativas: [
      { letra: "A", texto: "O rigor métrico do soneto parnasiano." },
      { letra: "B", texto: "A valorização da linguagem coloquial brasileira." },
      { letra: "C", texto: "O retorno à temática árcade pastoril." },
      { letra: "D", texto: "A recusa completa de temas nacionais." },
      { letra: "E", texto: "O uso exclusivo do português lusitano." },
    ],
    correta: "B",
    resolucoes: [
      {
        id: "r1",
        autor: "Helena Prado",
        votos: 34,
        texto:
          "A primeira fase é irreverente e nacionalista: aproxima a escrita da fala brasileira e rompe com o parnasianismo.",
      },
    ],
    comentarios: [],
  },
  {
    id: "2021-hum-078",
    area: "humanas",
    ano: 2021,
    dificuldade: "Médio",
    disciplina: "Geografia",
    titulo: "Urbanização e ilhas de calor",
    enunciado:
      "A substituição de áreas verdes por asfalto e concreto nas grandes cidades brasileiras contribui diretamente para a formação de ilhas de calor porque:",
    alternativas: [
      { letra: "A", texto: "Aumenta a evapotranspiração local." },
      { letra: "B", texto: "Reduz a absorção e retenção de calor pelas superfícies." },
      { letra: "C", texto: "Eleva a capacidade de infiltração da água no solo." },
      { letra: "D", texto: "Amplia a retenção de calor e diminui a umidade do ar." },
      { letra: "E", texto: "Diminui a emissão de poluentes atmosféricos." },
    ],
    correta: "D",
    resolucoes: [
      {
        id: "r1",
        autor: "Diego Fontes",
        votos: 27,
        texto:
          "Concreto e asfalto absorvem e retêm mais calor, e a falta de vegetação reduz a umidade — resultado: temperaturas mais altas no centro urbano.",
      },
    ],
    comentarios: [],
  },
];

export const DISCIPLINAS = [
  { nome: "Matemática", area: "matematica", progresso: 68, questoes: 142 },
  { nome: "Linguagens", area: "linguagens", progresso: 45, questoes: 98 },
  { nome: "Ciências da Natureza", area: "natureza", progresso: 52, questoes: 117 },
  { nome: "Ciências Humanas", area: "humanas", progresso: 74, questoes: 131 },
];

export const PROGRESSO_SEMANAL = [
  { dia: "Seg", questoes: 12, meta: 15 },
  { dia: "Ter", questoes: 18, meta: 15 },
  { dia: "Qua", questoes: 9, meta: 15 },
  { dia: "Qui", questoes: 15, meta: 15 },
  { dia: "Sex", questoes: 21, meta: 15 },
  { dia: "Sáb", questoes: 6, meta: 15 },
  { dia: "Dom", questoes: 0, meta: 15 },
];

export const SIMULADOS = [
  {
    id: "sim-geral-2024",
    nome: "Simulado Geral ENEM 2024",
    descricao: "Uma amostra das quatro áreas para diagnosticar seu nível atual.",
    minutos: 30,
    questoes: ["2023-mat-136", "2022-nat-092", "2024-hum-045", "2021-lin-013"],
  },
  {
    id: "sim-exatas",
    nome: "Foco em Exatas",
    descricao: "Matemática e Ciências da Natureza para treinar cálculo sob pressão.",
    minutos: 20,
    questoes: ["2023-mat-136", "2022-mat-151", "2023-nat-118"],
  },
  {
    id: "sim-humanas",
    nome: "Humanas e Linguagens",
    descricao: "Interpretação, história e geografia em um bloco rápido.",
    minutos: 20,
    questoes: ["2024-hum-045", "2021-hum-078", "2024-lin-007", "2021-lin-013"],
  },
];

export const RANKING = [
  { nome: "Marina Alcântara", questoes: 214, ajudas: 31, avatar: "MA" },
  { nome: "Otávio Nunes", questoes: 198, ajudas: 12, avatar: "ON" },
  { nome: "Helena Prado", questoes: 187, ajudas: 44, avatar: "HP" },
  { nome: "Juliana Reis", questoes: 165, ajudas: 22, avatar: "JR" },
  { nome: "Lucas Amaral", questoes: 151, ajudas: 8, avatar: "LA" },
  { nome: "Você", questoes: 138, ajudas: 17, avatar: "VC", euMesmo: true },
  { nome: "Beatriz Lima", questoes: 121, ajudas: 5, avatar: "BL" },
  { nome: "Rafael Souza", questoes: 110, ajudas: 9, avatar: "RS" },
  { nome: "Diego Fontes", questoes: 96, ajudas: 27, avatar: "DF" },
  { nome: "Camila Torres", questoes: 88, ajudas: 3, avatar: "CT" },
];

export const NIVEIS = [
  { nome: "Iniciante", pontosMin: 0, reducaoAnuncios: 0 },
  { nome: "Colaborador", pontosMin: 150, reducaoAnuncios: 25 },
  { nome: "Mentor", pontosMin: 400, reducaoAnuncios: 50 },
  { nome: "Guardião do Fórum", pontosMin: 800, reducaoAnuncios: 80 },
];

export function nomeArea(id) {
  const area = AREAS.find((a) => a.id === id);
  return area ? area.nome : id;
}

export function corArea(id) {
  const area = AREAS.find((a) => a.id === id);
  return area ? area.cor : "#4338ca";
}

export function buscarQuestao(id) {
  return QUESTOES.find((q) => q.id === id);
}

export function nivelPorPontos(pontos) {
  return [...NIVEIS].reverse().find((n) => pontos >= n.pontosMin) || NIVEIS[0];
}
