export const MATCH_STATUS = {
  scheduled: { label: 'Agendado', color: 'bg-scheduled' },
  live: { label: 'AO VIVO', color: 'bg-live' },
  paused: { label: 'Pausado', color: 'bg-amber-500' },
  finished: { label: 'Finalizado', color: 'bg-finished' },
  suspended: { label: 'Suspenso', color: 'bg-amber-600' },
  cancelled: { label: 'Cancelado', color: 'bg-slate-400' },
}

// Formato da classificação de cada modalidade.
export const STANDINGS_FORMAT = {
  'mata-mata': {
    label: 'Mata-mata (sem tabela)',
    hint: 'Só chaveamento — quem perde está fora. Vale pra maioria das modalidades',
  },
  classico: {
    label: 'Fase de grupos (V/E/D + saldo)',
    hint: 'Esportes femininos que classificam as 2 melhores',
  },
  pontos: {
    label: 'Pontos corridos (LBFF)',
    hint: 'Free Fire — pontos, booyah e abates',
  },
  tempo: {
    label: 'Por tempo (3 rounds)',
    hint: 'Cubo Mágico — 3 tentativas cronometradas, vence a menor média',
  },
}

export const PHASE_LABELS = {
  grupos: 'Fase de Grupos',
  oitavas: 'Oitavas de Final',
  quartas: 'Quartas de Final',
  semifinal: 'Semifinal',
  final: 'Final',
}
