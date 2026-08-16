// Assinatura do site. Fica no pé da Home e na tela de contagem regressiva —
// dois lugares com espaço morto, onde o crédito aparece sem disputar atenção
// com placar, chaveamento ou horário de jogo.
export default function Credits({ className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      <p className="font-bracket font-bold text-[10px] tracking-[0.24em] text-arena-dim uppercase">
        Desenvolvido por
      </p>
      <p className="font-varsity text-base text-arena-muted tracking-[0.06em] mt-1">
        KAUHAN MELO
      </p>
      <p className="font-body font-medium text-[11px] text-arena-dim mt-1.5">
        com a Comissão JIPD · ETE Porto Digital · 2026
      </p>
    </div>
  )
}
