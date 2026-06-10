'use client'

import { Suspense } from 'react'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SuccessContent() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const sessionId = params.get('session_id')
    const credits = params.get('credits')
    if (sessionId && credits) {
      setTimeout(() => router.push(`/?session_id=${sessionId}&credits=${credits}`), 2000)
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#09090B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#F9FAFB', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
      <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 12px' }}>Paiement réussi !</h1>
      <p style={{ color: '#9CA3AF', fontSize: 16 }}>Redirection en cours...</p>
    </div>
  )
}

export default function Success() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
