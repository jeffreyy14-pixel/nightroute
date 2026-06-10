'use client'

import { useState, useEffect, CSSProperties } from 'react'

interface Review {
  author: string
  rating: number
  comment: string
}

interface Stop {
  order: number
  name: string
  type: string
  address: string
  arrival_time: string
  duration: string
  vibe_description: string
  price_estimate: string
  insider_tip: string
  google_maps_url: string
  rating: number
  reviews: Review[]
  must_try: string
}

interface Plan {
  city: string
  vibe: string
  night_summary: string
  total_budget_estimate: string
  stops: Stop[]
  night_tips: string[]
  best_transport: string
}

interface FormState {
  city: string
  vibe: string
  budget: string
  people: string
}

const VIBES = [
  { id: 'party', emoji: '🎉', label: 'Party' },
  { id: 'chill', emoji: '🍻', label: 'Chill' },
  { id: 'date', emoji: '🕯️', label: 'Date' },
  { id: 'social', emoji: '👋', label: 'Social' },
]

const BUDGETS = ['20', '50', '100', 'unlimited']

const FORFAITS = [
  { id: 'soiree', label: 'Une soirée', price: '0,99$', credits: 1, emoji: '🌙' },
  { id: 'weekend', label: 'Un weekend', price: '1,99$', credits: 3, emoji: '🎉' },
  { id: 'semaine', label: 'Une semaine', price: '3,99$', credits: 7, emoji: '🔥' },
  { id: 'mois', label: 'Un mois', price: '7,99$', credits: 30, emoji: '👑' },
]

export default function NightRoute() {
  const [screen, setScreen] = useState<'landing' | 'form' | 'loading' | 'result' | 'paywall'>('landing')
  const [form, setForm] = useState<FormState>({ city: 'Ville de Québec', vibe: '', budget: '', people: '2' })
  const [plan, setPlan] = useState<Plan | null>(null)
  const [credits, setCredits] = useState(0)
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [selectedForfait, setSelectedForfait] = useState('soiree')

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      * { box-sizing: border-box; }
    `
    document.head.appendChild(style)

    // Récupérer les crédits depuis localStorage
    const saved = localStorage.getItem('nightroute_credits')
    if (saved) setCredits(parseInt(saved))

    // Vérifier si retour de Stripe
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const newCredits = params.get('credits')
    if (sessionId && newCredits) {
      verifyPayment(sessionId, parseInt(newCredits))
      window.history.replaceState({}, '', '/')
    }
  }, [])

  async function verifyPayment(sessionId: string, newCredits: number) {
    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
      const data = await res.json()
      if (data.paid) {
        const total = credits + newCredits
        setCredits(total)
        localStorage.setItem('nightroute_credits', total.toString())
        setScreen('form')
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function handleCheckout() {
    setLoadingCheckout(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedForfait }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error(e)
    }
    setLoadingCheckout(false)
  }

  async function generatePlan() {
    if (credits <= 0) {
      setScreen('paywall')
      return
    }
    setScreen('loading')
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      const parsed = JSON.parse(data.result)
      setPlan(parsed)
      // Déduire 1 crédit
      const newCredits = credits - 1
      setCredits(newCredits)
      localStorage.setItem('nightroute_credits', newCredits.toString())
      setScreen('result')
    } catch (error) {
      console.error(error)
      setScreen('result')
    }
  }

  // ─── LANDING ───────────────────────────────────────────────
  if (screen === 'landing') {
    return (
      <div style={styles.root}>
        <div style={styles.glow1} />
        <div style={styles.glow2} />
        <div style={styles.landingWrap}>
          <div style={styles.logoMark}>🌙</div>
          <h1 style={styles.heroTitle}>NightRoute<span style={styles.heroAI}>.ai</span></h1>
          <p style={styles.heroSub}>Ton plan de soirée généré par IA en 10 secondes. Bars, restos, clubs — adaptés à ton vibe et ton budget.</p>

          <div style={styles.propsGrid}>
            {[
              { icon: '🎯', text: 'Personnalisé selon ton vibe' },
              { icon: '📍', text: 'Adresses réelles avec Maps' },
              { icon: '⭐', text: 'Avis et notes inclus' },
              { icon: '💸', text: 'Adapté à ton budget' },
            ].map((p) => (
              <div key={p.icon} style={styles.propItem}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <span style={styles.propText}>{p.text}</span>
              </div>
            ))}
          </div>

          {credits > 0 && (
            <div style={styles.creditsBar}>
              ✅ Tu as <strong>{credits} plan{credits > 1 ? 's' : ''}</strong> disponible{credits > 1 ? 's' : ''}
            </div>
          )}

          <button style={styles.ctaPrimary} onClick={() => credits > 0 ? setScreen('form') : setScreen('paywall')}>
            {credits > 0 ? 'Planifier ma soirée →' : 'Commencer — 0,99$'}
          </button>
          <p style={styles.priceHint}>Aperçu gratuit • Plans à partir de 0,99$</p>
        </div>
      </div>
    )
  }

  // ─── PAYWALL ───────────────────────────────────────────────
  if (screen === 'paywall') {
    return (
      <div style={styles.root}>
        <div style={styles.glow1} />
        <div style={styles.formWrap}>
          <button style={styles.backBtn} onClick={() => setScreen('landing')}>← Retour</button>
          <h2 style={styles.sectionTitle}>Choisis ton forfait</h2>
          <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 28, marginTop: -16 }}>
            Débloque des plans de soirée complets générés par IA
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {FORFAITS.map((f) => (
              <button key={f.id} onClick={() => setSelectedForfait(f.id)}
                style={{ ...styles.forfaitBtn, ...(selectedForfait === f.id ? styles.forfaitBtnActive : {}) }}>
                <span style={{ fontSize: 24 }}>{f.emoji}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#F9FAFB' }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{f.credits} plan{f.credits > 1 ? 's' : ''} de soirée</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: selectedForfait === f.id ? '#7C3AED' : '#F9FAFB' }}>
                  {f.price}
                </div>
              </button>
            ))}
          </div>

          <button style={{ ...styles.ctaPrimary, opacity: loadingCheckout ? 0.6 : 1 }}
            onClick={handleCheckout} disabled={loadingCheckout}>
            {loadingCheckout ? 'Redirection...' : `Payer ${FORFAITS.find(f => f.id === selectedForfait)?.price} →`}
          </button>
          <p style={styles.priceHint}>Paiement sécurisé par Stripe 🔒</p>
        </div>
      </div>
    )
  }

  // ─── FORM ──────────────────────────────────────────────────
  if (screen === 'form') {
    const canGenerate = form.vibe && form.budget
    return (
      <div style={styles.root}>
        <div style={styles.glow1} />
        <div style={styles.formWrap}>
          <button style={styles.backBtn} onClick={() => setScreen('landing')}>← Retour</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Configure ta soirée</h2>
            <div style={styles.creditsChip}>🌙 {credits} crédit{credits > 1 ? 's' : ''}</div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>📍 Ville</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Ville de Québec', 'Montréal'].map((city) => (
                <button key={city} onClick={() => setForm({ ...form, city })}
                  style={{ ...styles.optBtn, ...(form.city === city ? styles.optBtnActive : {}) }}>
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>🎭 Vibe</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {VIBES.map((v) => (
                <button key={v.id} onClick={() => setForm({ ...form, vibe: v.label })}
                  style={{ ...styles.vibeBtn, ...(form.vibe === v.label ? styles.vibeBtnActive : {}) }}>
                  <span style={{ fontSize: 24 }}>{v.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>💸 Budget / personne</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              {BUDGETS.map((b) => (
                <button key={b} onClick={() => setForm({ ...form, budget: b })}
                  style={{ ...styles.budgetBtn, ...(form.budget === b ? styles.budgetBtnActive : {}) }}>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{b === 'unlimited' ? '∞' : `${b}$`}</span>
                  <span style={{ fontSize: 10, color: '#6B7280' }}>{b === 'unlimited' ? 'Illimité' : 'max'}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>👥 Nombre de personnes</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['1', '2', '3', '4', '5+'].map((n) => (
                <button key={n} onClick={() => setForm({ ...form, people: n })}
                  style={{ ...styles.numBtn, ...(form.people === n ? styles.numBtnActive : {}) }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button style={{ ...styles.ctaPrimary, opacity: canGenerate ? 1 : 0.4, cursor: canGenerate ? 'pointer' : 'not-allowed' }}
            onClick={canGenerate ? generatePlan : undefined}>
            Générer mon plan 🚀
          </button>
        </div>
      </div>
    )
  }

  // ─── LOADING ───────────────────────────────────────────────
  if (screen === 'loading') {
    return (
      <div style={{ ...styles.root, justifyContent: 'center', gap: 24 }}>
        <div style={styles.glow1} />
        <div style={styles.spinner} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', margin: 0 }}>Génération en cours…</p>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>L'IA prépare ta soirée parfaite</p>
        </div>
      </div>
    )
  }

  // ─── RESULT ────────────────────────────────────────────────
  if (screen === 'result' && plan) {
    return (
      <div style={styles.root}>
        <div style={styles.glow1} />
        <div style={styles.glow2} />
        <div style={styles.resultWrap}>
          <div style={styles.resultHeader}>
            <div style={styles.logoMark}>🌙</div>
            <div style={styles.vibeBadge}>{plan.vibe}</div>
            <h1 style={styles.resultTitle}>Ta soirée à {plan.city}</h1>
            <p style={styles.resultSummary}>{plan.night_summary}</p>
            <div style={styles.metaRow}>
              <span style={styles.metaChip}>💸 {plan.total_budget_estimate}</span>
              <span style={styles.metaChip}>🚗 {plan.best_transport}</span>
              <span style={styles.metaChip}>📍 {plan.stops?.length} arrêts</span>
            </div>
          </div>

          {plan.stops?.map((stop) => (
            <StopCard key={stop.order} stop={stop} />
          ))}

          {plan.night_tips?.length > 0 && (
            <div style={styles.tipsCard}>
              <h3 style={styles.tipsTitle}>💡 Conseils de la nuit</h3>
              {plan.night_tips.map((tip, i) => (
                <div key={i} style={styles.tipItem}>
                  <span style={styles.tipDot}>•</span>
                  <span style={{ fontSize: 14, color: '#D1D5DB' }}>{tip}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={styles.restartBtn} onClick={() => setScreen('form')}>
              ↩ Nouvelle soirée
            </button>
            {credits <= 0 && (
              <button style={{ ...styles.restartBtn, borderColor: '#7C3AED', color: '#7C3AED' }}
                onClick={() => setScreen('paywall')}>
                + Acheter des crédits
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}

function StopCard({ stop }: { stop: Stop }) {
  const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))
  return (
    <div style={stopCardStyles.card}>
      <div style={stopCardStyles.header}>
        <div style={stopCardStyles.orderBadge}>{stop.order}</div>
        <div style={{ flex: 1 }}>
          <div style={stopCardStyles.name}>{stop.name}</div>
          <div style={stopCardStyles.typeLine}>
            <span style={stopCardStyles.typeChip}>{stop.type}</span>
            {stop.rating && (
              <span style={stopCardStyles.rating}>
                <span style={{ color: '#F59E0B' }}>{stars(stop.rating)}</span>
                <span style={{ color: '#9CA3AF', fontSize: 12, marginLeft: 4 }}>{stop.rating}/5</span>
              </span>
            )}
          </div>
        </div>
        <div style={stopCardStyles.timeBlock}>
          <div style={stopCardStyles.time}>{stop.arrival_time}</div>
          <div style={stopCardStyles.duration}>{stop.duration}</div>
        </div>
      </div>
      <p style={stopCardStyles.vibe}>{stop.vibe_description}</p>
      {stop.must_try && (
        <div style={stopCardStyles.mustTry}>
          🍽️ <strong>À essayer :</strong> {stop.must_try}
        </div>
      )}
      {stop.reviews?.length > 0 && (
        <div style={stopCardStyles.reviewsWrap}>
          <div style={stopCardStyles.reviewsTitle}>Avis clients</div>
          {stop.reviews.map((r, i) => (
            <div key={i} style={stopCardStyles.review}>
              <div style={stopCardStyles.reviewHeader}>
                <span style={stopCardStyles.reviewAuthor}>{r.author}</span>
                <span style={{ color: '#F59E0B', fontSize: 12 }}>{'★'.repeat(r.rating)}</span>
              </div>
              <p style={stopCardStyles.reviewText}>"{r.comment}"</p>
            </div>
          ))}
        </div>
      )}
      <div style={stopCardStyles.footer}>
        <div style={stopCardStyles.footerInfo}>
          <span style={stopCardStyles.footerChip}>📍 {stop.address}</span>
          <span style={stopCardStyles.footerChip}>💸 {stop.price_estimate}</span>
        </div>
        {stop.insider_tip && (
          <div style={stopCardStyles.insiderTip}>🎯 <em>{stop.insider_tip}</em></div>
        )}
        <a href={stop.google_maps_url} target="_blank" rel="noreferrer" style={stopCardStyles.mapsBtn}>
          Ouvrir dans Google Maps →
        </a>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  root: {
    minHeight: '100vh', background: '#09090B',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#F9FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0 0 60px 0', position: 'relative', overflowX: 'hidden',
  },
  glow1: { position: 'fixed', top: 0, left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  glow2: { position: 'fixed', top: 200, right: '0%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,77,109,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  landingWrap: { width: '100%', maxWidth: 440, padding: '70px 20px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 },
  logoMark: { fontSize: 32, width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #7C3AED, #FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  heroTitle: { fontSize: 48, fontWeight: 900, letterSpacing: '-2px', margin: '0 0 16px', lineHeight: 1 },
  heroAI: { background: 'linear-gradient(135deg, #7C3AED, #FF4D6D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { fontSize: 16, color: '#9CA3AF', lineHeight: 1.7, margin: 0, textAlign: 'center' },
  propsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', margin: '32px 0' },
  propItem: { background: '#111113', border: '1px solid #1F1F23', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 },
  propText: { fontSize: 13, color: '#D1D5DB', fontWeight: 500, lineHeight: 1.4 },
  creditsBar: { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, padding: '10px 16px', fontSize: 14, color: '#D1D5DB', marginBottom: 16, width: '100%', textAlign: 'center' },
  ctaPrimary: { width: '100%', padding: '18px 24px', background: 'linear-gradient(135deg, #7C3AED, #FF4D6D)', border: 'none', borderRadius: 16, color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 32px rgba(124,58,237,0.35)' },
  priceHint: { color: '#4B5563', fontSize: 12, marginTop: 12, textAlign: 'center' },
  formWrap: { width: '100%', maxWidth: 440, padding: '32px 20px', position: 'relative', zIndex: 1 },
  backBtn: { background: 'none', border: 'none', color: '#6B7280', fontSize: 14, cursor: 'pointer', padding: '0 0 24px', fontWeight: 600 },
  sectionTitle: { fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 28px', color: '#F9FAFB' },
  fieldGroup: { marginBottom: 28 },
  label: { display: 'block', color: '#9CA3AF', fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' },
  optBtn: { flex: 1, padding: '12px 16px', background: '#111113', border: '1.5px solid #2A2A2E', borderRadius: 12, color: '#9CA3AF', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  optBtnActive: { border: '1.5px solid #7C3AED', background: 'rgba(124,58,237,0.15)', color: '#fff' },
  vibeBtn: { padding: '18px 12px', background: '#111113', border: '1.5px solid #2A2A2E', borderRadius: 14, color: '#9CA3AF', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  vibeBtnActive: { border: '1.5px solid #FF4D6D', background: 'rgba(255,77,109,0.12)', color: '#fff' },
  budgetBtn: { padding: '14px 8px', background: '#111113', border: '1.5px solid #2A2A2E', borderRadius: 12, color: '#9CA3AF', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  budgetBtnActive: { border: '1.5px solid #F59E0B', background: 'rgba(245,158,11,0.13)', color: '#fff' },
  numBtn: { width: 44, height: 44, background: '#111113', border: '1.5px solid #2A2A2E', borderRadius: 10, color: '#9CA3AF', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  numBtnActive: { border: '1.5px solid #7C3AED', background: 'rgba(124,58,237,0.15)', color: '#fff' },
  forfaitBtn: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#111113', border: '1.5px solid #2A2A2E', borderRadius: 14, cursor: 'pointer', width: '100%' },
  forfaitBtnActive: { border: '1.5px solid #7C3AED', background: 'rgba(124,58,237,0.1)' },
  creditsChip: { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '4px 12px', fontSize: 13, color: '#A78BFA', fontWeight: 700 },
  spinner: { width: 52, height: 52, borderRadius: '50%', border: '3px solid #1F1F23', borderTop: '3px solid #7C3AED', animation: 'spin 0.8s linear infinite' },
  resultWrap: { width: '100%', maxWidth: 480, padding: '40px 16px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 },
  resultHeader: { textAlign: 'center', marginBottom: 8 },
  resultTitle: { fontSize: 32, fontWeight: 900, letterSpacing: '-1px', margin: '12px 0 8px' },
  resultSummary: { fontSize: 15, color: '#9CA3AF', lineHeight: 1.6, margin: '0 0 16px' },
  vibeBadge: { display: 'inline-block', background: 'rgba(255,77,109,0.15)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 700, color: '#FF4D6D' },
  metaRow: { display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  metaChip: { background: '#111113', border: '1px solid #2A2A2E', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: '#9CA3AF' },
  tipsCard: { background: '#111113', border: '1px solid #1F1F23', borderRadius: 16, padding: 20 },
  tipsTitle: { fontSize: 16, fontWeight: 800, margin: '0 0 14px', color: '#F9FAFB' },
  tipItem: { display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  tipDot: { color: '#7C3AED', fontWeight: 900, flexShrink: 0, marginTop: 1 },
  restartBtn: { flex: 1, background: 'none', border: '1.5px solid #2A2A2E', borderRadius: 12, color: '#6B7280', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '12px 20px', textAlign: 'center' },
}

const stopCardStyles: Record<string, CSSProperties> = {
  card: { background: '#0D0D0F', border: '1px solid #1F1F23', borderRadius: 20, overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 18px 0' },
  orderBadge: { width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', flexShrink: 0 },
  name: { fontSize: 17, fontWeight: 800, color: '#F9FAFB', lineHeight: 1.2 },
  typeLine: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 },
  typeChip: { background: '#1F1F23', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#9CA3AF', fontWeight: 600 },
  rating: { display: 'flex', alignItems: 'center', fontSize: 13 },
  timeBlock: { textAlign: 'right', flexShrink: 0 },
  time: { fontSize: 15, fontWeight: 800, color: '#F9FAFB' },
  duration: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  vibe: { fontSize: 14, color: '#9CA3AF', lineHeight: 1.6, margin: '12px 18px 0' },
  mustTry: { margin: '12px 18px 0', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#D1D5DB' },
  reviewsWrap: { margin: '14px 18px 0' },
  reviewsTitle: { fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 },
  review: { background: '#111113', borderRadius: 12, padding: '12px 14px', marginBottom: 8 },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewAuthor: { fontSize: 13, fontWeight: 700, color: '#F9FAFB' },
  reviewText: { fontSize: 13, color: '#9CA3AF', margin: 0, lineHeight: 1.5, fontStyle: 'italic' },
  footer: { padding: '14px 18px 18px' },
  footerInfo: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  footerChip: { background: '#111113', border: '1px solid #2A2A2E', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: '#9CA3AF' },
  insiderTip: { fontSize: 13, color: '#7C3AED', marginBottom: 12, lineHeight: 1.5 },
  mapsBtn: { display: 'block', textAlign: 'center', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#7C3AED', textDecoration: 'none' },
}