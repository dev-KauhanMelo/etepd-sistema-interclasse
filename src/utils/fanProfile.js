// Perfil do torcedor pro Bolão: fica salvo no navegador (localStorage),
// sem precisar de login. O id aleatório identifica os palpites da pessoa.
const KEY = 'jipd:fanProfile'

export function getFanProfile() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveFanProfile({ name, className }) {
  const existing = getFanProfile()
  const profile = {
    id: existing?.id || (crypto.randomUUID ? crypto.randomUUID() : `fan-${Date.now()}-${Math.random().toString(36).slice(2)}`),
    name: name.trim(),
    className,
  }
  localStorage.setItem(KEY, JSON.stringify(profile))
  return profile
}
