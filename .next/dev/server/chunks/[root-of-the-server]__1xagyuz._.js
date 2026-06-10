module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/api/generate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$groq$2d$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/groq-sdk/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$groq$2d$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Groq__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/groq-sdk/client.mjs [app-route] (ecmascript) <export Groq as default>");
;
const groq = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$groq$2d$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Groq__as__default$3e$__["default"]({
    apiKey: process.env.GROQ_API_KEY
});
async function POST(req) {
    try {
        const body = await req.json();
        const { city, vibe, budget, people } = body;
        if (!city || !vibe || !budget) {
            return Response.json({
                error: 'Paramètres manquants'
            }, {
                status: 400
            });
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
    `;
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7
        });
        const text = (completion.choices?.[0]?.message?.content ?? '').replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        return Response.json({
            result: text
        });
    } catch (error) {
        console.error('Groq API error:', error.message);
        return Response.json({
            error: 'Erreur serveur'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1xagyuz._.js.map