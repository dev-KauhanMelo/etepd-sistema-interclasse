export const MATCH_STATUS = {
  scheduled: { label: 'Agendado', color: 'bg-scheduled' },
  live: { label: 'AO VIVO', color: 'bg-live' },
  paused: { label: 'Pausado', color: 'bg-amber-500' },
  finished: { label: 'Finalizado', color: 'bg-finished' },
  suspended: { label: 'Suspenso', color: 'bg-amber-600' },
  cancelled: { label: 'Cancelado', color: 'bg-slate-400' },
}

// Formato da classificação de cada modalidade.
// - 'classico': pontos corridos de esporte (V/E/D + saldo). É o padrão.
// - 'pontos': tabela estilo LBFF (Free Fire) — pontos, booyahs e abates,
//   sem confronto direto; a colocação sai da soma da própria turma.
export const STANDINGS_FORMAT = {
  classico: { label: 'Clássico (V/E/D + saldo)', hint: 'Futsal, vôlei, handebol…' },
  pontos: { label: 'Pontos corridos (LBFF)', hint: 'Free Fire — pontos, booyah e abates' },
}

export const PHASE_LABELS = {
  grupos: 'Fase de Grupos',
  oitavas: 'Oitavas de Final',
  quartas: 'Quartas de Final',
  semifinal: 'Semifinal',
  final: 'Final',
}
