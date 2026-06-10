import Groq from 'groq-sdk'
import { NextRequest } from 'next/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { city, vibe, budget, people } = body

    if (!city || !vibe || !budget) {
      return Response.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const prompt = `
Tu es un expert local en sorties nocturnes à ${city}. Génère un plan de soirée détaillé et réaliste.

Paramètres:
- Ville: ${city}
- Vibe: ${vibe}
- Budget par personne: ${budget === 'unlimited' ? 'illimité' : budget + '$'}
- Nombre de personnes: ${people}

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, sans balises markdown.

Structure JSON exacte:
{
  "city": "${city}",
  "vibe": "${vibe}",
  "night_summary": "Description engageante de la soirée en 2 phrases",
  "total_budget_estimate": "ex: 45$ - 70$ par personne",
  "best_transport": "ex: Taxi ou marche, stationnement difficile",
  "night_tips": [
    "Conseil pratique 1",
    "Conseil pratique 2",
    "Conseil pratique 3"
  ],
  "stops": [
    {
      "order": 1,
      "name": "Nom réel du bar/resto",
      "type": "Bar / Resto / Club / Terrasse",
      "address": "Adresse complète réelle",
      "arrival_time": "20h30",
      "duration": "1h30",
      "vibe_description": "Description de l'ambiance en 1-2 phrases",
      "must_try": "Plat ou boisson signature à commander",
      "price_estimate": "15$ - 25$ par personne",
      "insider_tip": "Astuce locale exclusive",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=NOM+ADRESSE+${city.replace(/ /g, '+')}",
      "rating": 4.3,
      "reviews": [
        {
          "author": "Prénom local",
          "rating": 5,
          "comment": "Avis réaliste et spécifique en français, 1-2 phrases"
        },
        {
          "author": "Prénom local",
          "rating": 4,
          "comment": "Autre avis réaliste en français, 1-2 phrases"
        }
      ]
    }
  ]
}

Génère exactement 4 arrêts. Utilise de vrais endroits populaires de ${city}. Les avis doivent être authentiques et spécifiques à chaque endroit.
    `

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const text = (completion.choices?.[0]?.message?.content ?? '')
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    return Response.json({ result: text })

  } catch (error) {
    console.error('Groq API error:', (error as any).message)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}