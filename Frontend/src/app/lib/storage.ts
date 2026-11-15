// Sistema de armazenamento local usando localStorage

export interface Plano {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  periodicidade: "mensal" | "trimestral" | "semestral" | "anual";
  criadoEm: string;
}

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  planoId: string;
  observacoes?: string;
  criadoEm: string;
}

export interface Grupo {
  id: string;
  nome: string;
  descricao: string;
  alunosIds: string[];
  criadoEm: string;
}

export interface Pagamento {
  id: string;
  alunoId: string;
  mes: string; // formato: "2026-02"
  valor: number;
  status: "pago" | "pendente";
  dataPagamento?: string;
  criadoEm: string;
}

export interface Aula {
  id: string;
  titulo: string;
  alunoId: string;
  grupoId?: string;
  data: string; // ISO string
  duracao: number; // em minutos
  observacoes?: string;
  criadoEm: string;
}

// Funções para gerenciar Planos
export function getPlanos(): Plano[] {
  const data = localStorage.getItem("planos");
  return data ? JSON.parse(data) : [];
}

export function savePlanos(planos: Plano[]): void {
  localStorage.setItem("planos", JSON.stringify(planos));
}

export function addPlano(plano: Omit<Plano, "id" | "criadoEm">): Plano {
  const planos = getPlanos();
  const novoPlano: Plano = {
    ...plano,
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };
  planos.push(novoPlano);
  savePlanos(planos);
  return novoPlano;
}

export function updatePlano(id: string, data: Partial<Plano>): void {
  const planos = getPlanos();
  const index = planos.findIndex((p) => p.id === id);
  if (index !== -1) {
    planos[index] = { ...planos[index], ...data };
    savePlanos(planos);
  }
}

export function deletePlano(id: string): void {
  const planos = getPlanos();
  savePlanos(planos.filter((p) => p.id !== id));
}

// Funções para gerenciar Alunos
export function getAlunos(): Aluno[] {
  const data = localStorage.getItem("alunos");
  return data ? JSON.parse(data) : [];
}

export function saveAlunos(alunos: Aluno[]): void {
  localStorage.setItem("alunos", JSON.stringify(alunos));
}

export function addAluno(aluno: Omit<Aluno, "id" | "criadoEm">): Aluno {
  const alunos = getAlunos();
  const novoAluno: Aluno = {
    ...aluno,
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };
  alunos.push(novoAluno);
  saveAlunos(alunos);
  return novoAluno;
}

export function updateAluno(id: string, data: Partial<Aluno>): void {
  const alunos = getAlunos();
  const index = alunos.findIndex((a) => a.id === id);
  if (index !== -1) {
    alunos[index] = { ...alunos[index], ...data };
    saveAlunos(alunos);
  }
}

export function deleteAluno(id: string): void {
  const alunos = getAlunos();
  saveAlunos(alunos.filter((a) => a.id !== id));
}

// Funções para gerenciar Grupos
export function getGrupos(): Grupo[] {
  const data = localStorage.getItem("grupos");
  return data ? JSON.parse(data) : [];
}

export function saveGrupos(grupos: Grupo[]): void {
  localStorage.setItem("grupos", JSON.stringify(grupos));
}

export function addGrupo(grupo: Omit<Grupo, "id" | "criadoEm">): Grupo {
  const grupos = getGrupos();
  const novoGrupo: Grupo = {
    ...grupo,
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };
  grupos.push(novoGrupo);
  saveGrupos(grupos);
  return novoGrupo;
}

export function updateGrupo(id: string, data: Partial<Grupo>): void {
  const grupos = getGrupos();
  const index = grupos.findIndex((g) => g.id === id);
  if (index !== -1) {
    grupos[index] = { ...grupos[index], ...data };
    saveGrupos(grupos);
  }
}

export function deleteGrupo(id: string): void {
  const grupos = getGrupos();
  saveGrupos(grupos.filter((g) => g.id !== id));
}

// Funções para gerenciar Pagamentos
export function getPagamentos(): Pagamento[] {
  const data = localStorage.getItem("pagamentos");
  return data ? JSON.parse(data) : [];
}

export function savePagamentos(pagamentos: Pagamento[]): void {
  localStorage.setItem("pagamentos", JSON.stringify(pagamentos));
}

export function addPagamento(pagamento: Omit<Pagamento, "id" | "criadoEm">): Pagamento {
  const pagamentos = getPagamentos();
  const novoPagamento: Pagamento = {
    ...pagamento,
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };
  pagamentos.push(novoPagamento);
  savePagamentos(pagamentos);
  return novoPagamento;
}

export function updatePagamento(id: string, data: Partial<Pagamento>): void {
  const pagamentos = getPagamentos();
  const index = pagamentos.findIndex((p) => p.id === id);
  if (index !== -1) {
    pagamentos[index] = { ...pagamentos[index], ...data };
    savePagamentos(pagamentos);
  }
}

export function deletePagamento(id: string): void {
  const pagamentos = getPagamentos();
  savePagamentos(pagamentos.filter((p) => p.id !== id));
}

// Funções para gerenciar Aulas
export function getAulas(): Aula[] {
  const data = localStorage.getItem("aulas");
  return data ? JSON.parse(data) : [];
}

export function saveAulas(aulas: Aula[]): void {
  localStorage.setItem("aulas", JSON.stringify(aulas));
}

export function addAula(aula: Omit<Aula, "id" | "criadoEm">): Aula {
  const aulas = getAulas();
  const novaAula: Aula = {
    ...aula,
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };
  aulas.push(novaAula);
  saveAulas(aulas);
  return novaAula;
}

export function updateAula(id: string, data: Partial<Aula>): void {
  const aulas = getAulas();
  const index = aulas.findIndex((a) => a.id === id);
  if (index !== -1) {
    aulas[index] = { ...aulas[index], ...data };
    saveAulas(aulas);
  }
}

export function deleteAula(id: string): void {
  const aulas = getAulas();
  saveAulas(aulas.filter((a) => a.id !== id));
}

// Função para inicializar dados fake
export function initializeFakeData(): void {
  // Verifica se já existem dados
  if (getAlunos().length > 0) {
    return; // Não sobrescreve dados existentes
  }

  // Criar planos fake
  const planosFake: Plano[] = [
    {
      id: "plano-1",
      nome: "Plano Básico",
      descricao: "Acesso a todos os grupos e aulas",
      valor: 250,
      periodicidade: "mensal",
      criadoEm: "2026-01-10T08:00:00.000Z",
    },
    {
      id: "plano-2",
      nome: "Plano Premium",
      descricao: "Acesso a todos os grupos e aulas, incluindo CrossFit",
      valor: 300,
      periodicidade: "mensal",
      criadoEm: "2026-01-12T10:00:00.000Z",
    },
  ];

  // Criar alunos fake
  const alunosFake: Aluno[] = [
    {
      id: "aluno-1",
      nome: "Maria Silva",
      email: "maria.silva@email.com",
      telefone: "(11) 98765-4321",
      dataNascimento: "1990-05-15",
      planoId: "plano-1",
      observacoes: "Preferência por treinos pela manhã",
      criadoEm: "2026-01-15T10:00:00.000Z",
    },
    {
      id: "aluno-2",
      nome: "João Santos",
      email: "joao.santos@email.com",
      telefone: "(11) 97654-3210",
      dataNascimento: "1985-08-22",
      planoId: "plano-2",
      observacoes: "Foco em hipertrofia",
      criadoEm: "2026-01-20T14:30:00.000Z",
    },
    {
      id: "aluno-3",
      nome: "Ana Paula Costa",
      email: "ana.costa@email.com",
      telefone: "(11) 96543-2109",
      dataNascimento: "1992-03-10",
      planoId: "plano-1",
      observacoes: "Treino funcional e cardio",
      criadoEm: "2026-02-01T09:00:00.000Z",
    },
    {
      id: "aluno-4",
      nome: "Carlos Eduardo",
      email: "carlos.eduardo@email.com",
      telefone: "(11) 95432-1098",
      dataNascimento: "1988-11-30",
      planoId: "plano-2",
      observacoes: "Preparação para maratona",
      criadoEm: "2026-02-05T16:00:00.000Z",
    },
    {
      id: "aluno-5",
      nome: "Juliana Mendes",
      email: "juliana.mendes@email.com",
      telefone: "(11) 94321-0987",
      dataNascimento: "1995-07-18",
      planoId: "plano-1",
      observacoes: "Yoga e pilates",
      criadoEm: "2026-02-10T11:00:00.000Z",
    },
    {
      id: "aluno-6",
      nome: "Ricardo Alves",
      email: "ricardo.alves@email.com",
      telefone: "(11) 93210-9876",
      dataNascimento: "1987-12-05",
      planoId: "plano-2",
      observacoes: "Treino de força",
      criadoEm: "2026-02-12T08:00:00.000Z",
    },
    {
      id: "aluno-7",
      nome: "Patricia Lima",
      email: "patricia.lima@email.com",
      telefone: "(11) 92109-8765",
      dataNascimento: "1993-04-25",
      planoId: "plano-1",
      observacoes: "Emagrecimento e condicionamento",
      criadoEm: "2026-02-15T13:00:00.000Z",
    },
    {
      id: "aluno-8",
      nome: "Fernando Rocha",
      email: "fernando.rocha@email.com",
      telefone: "(11) 91098-7654",
      dataNascimento: "1991-09-08",
      planoId: "plano-2",
      observacoes: "CrossFit",
      criadoEm: "2026-02-18T15:30:00.000Z",
    },
  ];

  // Criar grupos fake
  const gruposFake: Grupo[] = [
    {
      id: "grupo-1",
      nome: "Turma Manhã",
      descricao: "Grupo de treino funcional das 7h às 8h",
      alunosIds: ["aluno-1", "aluno-3", "aluno-5"],
      criadoEm: "2026-01-10T08:00:00.000Z",
    },
    {
      id: "grupo-2",
      nome: "Hipertrofia",
      descricao: "Foco em ganho de massa muscular",
      alunosIds: ["aluno-2", "aluno-6"],
      criadoEm: "2026-01-12T10:00:00.000Z",
    },
    {
      id: "grupo-3",
      nome: "Cardio Avançado",
      descricao: "Preparação para corridas e maratonas",
      alunosIds: ["aluno-4", "aluno-7"],
      criadoEm: "2026-02-01T07:00:00.000Z",
    },
    {
      id: "grupo-4",
      nome: "CrossFit Iniciantes",
      descricao: "Introdução ao CrossFit",
      alunosIds: ["aluno-8"],
      criadoEm: "2026-02-15T18:00:00.000Z",
    },
  ];

  // Criar pagamentos fake (últimos 3 meses)
  const pagamentosFake: Pagamento[] = [
    // Janeiro 2026
    { id: "pag-1", alunoId: "aluno-1", mes: "2026-01", valor: 250, status: "pago", dataPagamento: "2026-01-05T10:00:00.000Z", criadoEm: "2026-01-05T10:00:00.000Z" },
    { id: "pag-2", alunoId: "aluno-2", mes: "2026-01", valor: 250, status: "pago", dataPagamento: "2026-01-03T14:00:00.000Z", criadoEm: "2026-01-03T14:00:00.000Z" },
    { id: "pag-3", alunoId: "aluno-3", mes: "2026-01", valor: 250, status: "pago", dataPagamento: "2026-01-07T09:00:00.000Z", criadoEm: "2026-01-07T09:00:00.000Z" },
    { id: "pag-4", alunoId: "aluno-4", mes: "2026-01", valor: 300, status: "pago", dataPagamento: "2026-01-10T11:00:00.000Z", criadoEm: "2026-01-10T11:00:00.000Z" },
    
    // Fevereiro 2026
    { id: "pag-5", alunoId: "aluno-1", mes: "2026-02", valor: 250, status: "pago", dataPagamento: "2026-02-05T10:00:00.000Z", criadoEm: "2026-02-05T10:00:00.000Z" },
    { id: "pag-6", alunoId: "aluno-2", mes: "2026-02", valor: 250, status: "pago", dataPagamento: "2026-02-04T14:00:00.000Z", criadoEm: "2026-02-04T14:00:00.000Z" },
    { id: "pag-7", alunoId: "aluno-3", mes: "2026-02", valor: 250, status: "pago", dataPagamento: "2026-02-06T09:00:00.000Z", criadoEm: "2026-02-06T09:00:00.000Z" },
    { id: "pag-8", alunoId: "aluno-4", mes: "2026-02", valor: 300, status: "pago", dataPagamento: "2026-02-08T11:00:00.000Z", criadoEm: "2026-02-08T11:00:00.000Z" },
    { id: "pag-9", alunoId: "aluno-5", mes: "2026-02", valor: 250, status: "pago", dataPagamento: "2026-02-12T10:00:00.000Z", criadoEm: "2026-02-12T10:00:00.000Z" },
    { id: "pag-10", alunoId: "aluno-6", mes: "2026-02", valor: 250, status: "pago", dataPagamento: "2026-02-14T15:00:00.000Z", criadoEm: "2026-02-14T15:00:00.000Z" },
    
    // Março 2026 (mês atual - alguns pendentes)
    { id: "pag-11", alunoId: "aluno-1", mes: "2026-03", valor: 250, status: "pago", dataPagamento: "2026-03-05T10:00:00.000Z", criadoEm: "2026-03-05T10:00:00.000Z" },
    { id: "pag-12", alunoId: "aluno-2", mes: "2026-03", valor: 250, status: "pago", dataPagamento: "2026-03-03T14:00:00.000Z", criadoEm: "2026-03-03T14:00:00.000Z" },
    { id: "pag-13", alunoId: "aluno-3", mes: "2026-03", valor: 250, status: "pendente", criadoEm: "2026-03-01T09:00:00.000Z" },
    { id: "pag-14", alunoId: "aluno-4", mes: "2026-03", valor: 300, status: "pago", dataPagamento: "2026-03-07T11:00:00.000Z", criadoEm: "2026-03-07T11:00:00.000Z" },
    { id: "pag-15", alunoId: "aluno-5", mes: "2026-03", valor: 250, status: "pendente", criadoEm: "2026-03-01T09:00:00.000Z" },
    { id: "pag-16", alunoId: "aluno-6", mes: "2026-03", valor: 250, status: "pago", dataPagamento: "2026-03-10T15:00:00.000Z", criadoEm: "2026-03-10T15:00:00.000Z" },
    { id: "pag-17", alunoId: "aluno-7", mes: "2026-03", valor: 250, status: "pendente", criadoEm: "2026-03-01T09:00:00.000Z" },
    { id: "pag-18", alunoId: "aluno-8", mes: "2026-03", valor: 300, status: "pendente", criadoEm: "2026-03-01T09:00:00.000Z" },
  ];

  // Criar aulas fake (próximos 14 dias)
  const aulasFake: Aula[] = [
    // Segunda (30/03/2026)
    { id: "aula-1", titulo: "Treino Funcional", alunoId: "aluno-1", grupoId: "grupo-1", data: "2026-03-30T07:00:00.000Z", duracao: 60, observacoes: "Treino em grupo", criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-2", titulo: "Hipertrofia - Peito e Tríceps", alunoId: "aluno-2", grupoId: "grupo-2", data: "2026-03-30T09:00:00.000Z", duracao: 90, criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-3", titulo: "Corrida - Intervalado", alunoId: "aluno-4", grupoId: "grupo-3", data: "2026-03-30T16:00:00.000Z", duracao: 60, criadoEm: "2026-03-20T10:00:00.000Z" },
    
    // Terça (31/03/2026)
    { id: "aula-4", titulo: "Yoga", alunoId: "aluno-5", data: "2026-03-31T07:00:00.000Z", duracao: 60, observacoes: "Aula individual", criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-5", titulo: "Hipertrofia - Costas e Bíceps", alunoId: "aluno-6", grupoId: "grupo-2", data: "2026-03-31T09:00:00.000Z", duracao: 90, criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-6", titulo: "CrossFit WOD", alunoId: "aluno-8", grupoId: "grupo-4", data: "2026-03-31T18:00:00.000Z", duracao: 60, criadoEm: "2026-03-20T10:00:00.000Z" },
    
    // Quarta (01/04/2026)
    { id: "aula-7", titulo: "Treino Funcional", alunoId: "aluno-3", grupoId: "grupo-1", data: "2026-04-01T07:00:00.000Z", duracao: 60, criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-8", titulo: "Hipertrofia - Pernas", alunoId: "aluno-2", grupoId: "grupo-2", data: "2026-04-01T09:00:00.000Z", duracao: 90, criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-9", titulo: "Cardio + Condicionamento", alunoId: "aluno-7", grupoId: "grupo-3", data: "2026-04-01T16:00:00.000Z", duracao: 60, criadoEm: "2026-03-20T10:00:00.000Z" },
    
    // Quinta (02/04/2026)
    { id: "aula-10", titulo: "Pilates", alunoId: "aluno-5", data: "2026-04-02T07:00:00.000Z", duracao: 60, criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-11", titulo: "Hipertrofia - Ombros e Abs", alunoId: "aluno-6", grupoId: "grupo-2", data: "2026-04-02T09:00:00.000Z", duracao: 90, criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-12", titulo: "CrossFit WOD", alunoId: "aluno-8", grupoId: "grupo-4", data: "2026-04-02T18:00:00.000Z", duracao: 60, criadoEm: "2026-03-20T10:00:00.000Z" },
    
    // Sexta (03/04/2026)
    { id: "aula-13", titulo: "Treino Funcional", alunoId: "aluno-1", grupoId: "grupo-1", data: "2026-04-03T07:00:00.000Z", duracao: 60, criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-14", titulo: "Treino Full Body", alunoId: "aluno-2", data: "2026-04-03T09:00:00.000Z", duracao: 90, criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-15", titulo: "Corrida Longa", alunoId: "aluno-4", data: "2026-04-03T16:00:00.000Z", duracao: 90, observacoes: "Preparação para maratona - 15km", criadoEm: "2026-03-20T10:00:00.000Z" },
    
    // Segunda (06/04/2026)
    { id: "aula-16", titulo: "Treino Funcional", alunoId: "aluno-3", grupoId: "grupo-1", data: "2026-04-06T07:00:00.000Z", duracao: 60, criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-17", titulo: "Hipertrofia - Peito e Tríceps", alunoId: "aluno-2", grupoId: "grupo-2", data: "2026-04-06T09:00:00.000Z", duracao: 90, criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-18", titulo: "HIIT", alunoId: "aluno-7", data: "2026-04-06T16:00:00.000Z", duracao: 45, criadoEm: "2026-03-20T10:00:00.000Z" },
    
    // Terça (07/04/2026)
    { id: "aula-19", titulo: "Yoga", alunoId: "aluno-5", data: "2026-04-07T07:00:00.000Z", duracao: 60, criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-20", titulo: "Hipertrofia - Costas e Bíceps", alunoId: "aluno-6", grupoId: "grupo-2", data: "2026-04-07T09:00:00.000Z", duracao: 90, criadoEm: "2026-03-20T10:00:00.000Z" },
    { id: "aula-21", titulo: "CrossFit WOD", alunoId: "aluno-8", grupoId: "grupo-4", data: "2026-04-07T18:00:00.000Z", duracao: 60, criadoEm: "2026-03-20T10:00:00.000Z" },
  ];

  // Salvar todos os dados no localStorage
  savePlanos(planosFake);
  saveAlunos(alunosFake);
  saveGrupos(gruposFake);
  savePagamentos(pagamentosFake);
  saveAulas(aulasFake);
}