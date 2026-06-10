import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { pool, initDb } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      theme,
      horizon,
      question,
      birthDate,
      birthTime,
      unknownTime,
      userName,
      selectedCards,
      readingType = "trinidad", // "trinidad" | "cruz" | "siono"
    } = body

    const session = await auth()
    const email = session?.user?.email || (userName && userName.includes("@") ? userName : null)

    const key = process.env.GEMINI_API_KEY
    const model = process.env.GEMINI_MODEL || "gemini-3.1-pro-preview"

    await initDb()

    const cost = readingType === "siono" ? 1 : readingType === "cruz" ? 5 : 3

    // 1. Save / Update User Profile if email and birthDate are available
    if (email) {
      if (birthDate) {
        try {
          await pool.query(
            `INSERT INTO user_profiles (email, birth_date, birth_time, unknown_time, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (email)
             DO UPDATE SET birth_date = EXCLUDED.birth_date,
                           birth_time = EXCLUDED.birth_time,
                           unknown_time = EXCLUDED.unknown_time,
                           updated_at = NOW()`,
            [email, birthDate, unknownTime ? null : birthTime || null, unknownTime]
          )
        } catch (profileErr) {
          console.error("Error saving user profile:", profileErr)
        }
      }
      
      // Check credits
      try {
        const userRes = await pool.query(`SELECT credits FROM user_profiles WHERE email = $1`, [email])
        const credits = userRes.rows[0]?.credits
        // If credits is undefined, profile might not exist yet, but if it does and is < cost, reject.
        if (credits !== undefined && credits < cost) {
          return NextResponse.json(
            { error: "No tienes suficientes créditos para esta lectura. Por favor, recarga tu cuenta." },
            { status: 402 }
          )
        }
      } catch (checkErr) {
        console.error("Error checking credits:", checkErr)
      }
    }

    // 2. Fetch past readings to pass as context
    let historyText = "No hay tiradas anteriores registradas para este consultante."
    if (email) {
      try {
        const pastResult = await pool.query(
          `SELECT TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as date, reading_type, theme, horizon, question, cards, synthesis
           FROM readings
           WHERE email = $1
           ORDER BY created_at DESC
           LIMIT 3`,
          [email]
        )

        if (pastResult.rows.length > 0) {
          historyText = pastResult.rows.map((r, index) => {
            const cardsStr = r.cards.map((c: any) => `${c.position}: ${c.name} (${c.isReversed ? "Invertida" : "Al derecho"})`).join(", ")
            const typeStr = r.reading_type === "siono" ? "Sí o No" : r.reading_type === "cruz" ? "Cruz Astral" : "Trinidad del Destino"
            return `Lectura del ${r.date} (Tirada: ${typeStr}, Tema: ${r.theme || "General"}, Horizonte: ${r.horizon || "General"}):
   Pregunta: "${r.question || "Búsqueda de guía general"}"
   Cartas elegidas: ${cardsStr}
   Síntesis del oráculo: "${r.synthesis}"`
          }).join("\n---\n")
        }
      } catch (dbErr) {
        console.error("Error fetching past readings:", dbErr)
      }
    }

    // Fallback Mock Generator
    if (!key) {
      console.warn("GEMINI_API_KEY is not defined. Using high-quality mock response.")
      
      const timeStr = unknownTime ? "Hora desconocida" : birthTime || ""
      const userDisplayName = session?.user?.name || (email ? email.split("@")[0] : "Buscador del Destino")
      
      let individualInterpretations = []
      let synthesis = ""
      let binaryAnswer = undefined

      if (readingType === "siono") {
        const card = selectedCards[0]
        const isReversed = card?.isReversed
        binaryAnswer = isReversed ? "NO" : "SÍ"
        const orientation = isReversed ? "Invertida (al revés)" : "Al derecho"
        
        individualInterpretations = [
          {
            position: "Consejo Astral",
            interpretation: `El ${card?.name} en posición ${orientation} sugiere que la energía cósmica actual ${isReversed ? "presenta obstáculos u oposición" : "fluye favorablemente y con luz clara"} respecto a tu consulta. Tu carta natal (${birthDate}) te insta a reflexionar sobre esta fuerza antes de actuar.`
          }
        ]

        synthesis = `Querido/a ${userDisplayName}, ante tu pregunta: "${question || "Búsqueda general de guía"}", el Oráculo del Sí o No responde con un claro y místico [${binaryAnswer}]. El ${card?.name} (${orientation}) aconseja que ${isReversed ? "guardes prudencia y esperes un mejor alineamiento de astros" : "actúes con plena confianza y determinación en tus intenciones"}.`
      } else if (readingType === "cruz") {
        individualInterpretations = selectedCards.map((c: any) => {
          const orientation = c.isReversed ? "Invertida" : "Al derecho"
          return {
            position: c.position,
            interpretation: `El ${c.name} (${orientation}) en la posición de ${c.position} aporta una influencia clave para comprender tu dilema. Tu carta natal (${birthDate}) sintoniza con este arcano para revelar lo oculto y clarificar tu camino.`
          }
        })

        synthesis = `Querido/a ${userDisplayName}, el ritual de la Cruz Astral (5 cartas) revela un panorama detallado para tu consulta sobre "${question || "tu dilema"}" en el horizonte de ${horizon || "General"}. La transición desde tu Situación Actual (${selectedCards[0]?.name}) pasando por el Obstáculo (${selectedCards[1]?.name}) y la Corona (${selectedCards[2]?.name}), apoyado en tu Raíz (${selectedCards[3]?.name}), te conduce inexorablemente hacia el Desenlace (${selectedCards[4]?.name}). Sigue la guía de los astros.`
      } else {
        // trinidad
        individualInterpretations = selectedCards.map((c: any) => {
          const orientation = c.isReversed ? "Invertida" : "Al derecho"
          let posText = c.position === "Pasado" ? "tu pasado cercano" : c.position === "Presente" ? "tu momento actual" : "tu porvenir"
          return {
            position: c.position,
            interpretation: `El ${c.name} (${orientation}) en la posición de ${c.position} simboliza la energía que rige ${posText}. Nacido el ${birthDate}, esta vibración moldea tu destino espiritual en relación a tu pregunta.`
          }
        })

        synthesis = `Querido/a ${userDisplayName}, la Trinidad de tu destino (Pasado: ${selectedCards[0]?.name}, Presente: ${selectedCards[1]?.name}, Futuro: ${selectedCards[2]?.name}) ante tu consulta: "${question || "Guía general"}" indica un sendero de transformación. Naciste el ${birthDate}. Las influencias cósmicas se alinean para sugerirte que confíes en tu intuición y camines con sabiduría hacia el porvenir.`
      }

      // Save mock reading in DB for history
      if (email) {
        try {
          await pool.query('BEGIN')
          await pool.query(
            `INSERT INTO readings (email, reading_type, theme, horizon, question, cards, synthesis, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
            [
              email,
              readingType,
              theme || "General",
              horizon || "General",
              question || "",
              JSON.stringify(selectedCards),
              synthesis
            ]
          )
          await pool.query(
            `UPDATE user_profiles SET credits = credits - $1 WHERE email = $2`,
            [cost, email]
          )
          await pool.query(
            `INSERT INTO credit_transactions (email, amount, transaction_type, description)
             VALUES ($1, $2, $3, $4)`,
            [email, -cost, 'reading', `Lectura Mock: ${readingType}`]
          )
          await pool.query('COMMIT')
        } catch (dbErr) {
          await pool.query('ROLLBACK')
          console.error("Error saving mock reading:", dbErr)
        }
      }

      return NextResponse.json({
        individual: individualInterpretations,
        synthesis,
        binary_answer: binaryAnswer,
        isMock: true,
      })
    }

    // Call Gemini API with historical context
    let promptDetails = ""
    let schemaDetails = ""

    if (readingType === "siono") {
      promptDetails = `Tirada: ORÁCULO DEL SÍ O NO (1 carta).
El consultante quiere una respuesta afirmativa o negativa clara sustentada por el arcano revelado.
La única carta seleccionada es:
- Consejo Astral: ${selectedCards[0]?.name} (${selectedCards[0]?.isReversed ? "Invertida" : "Al derecho"})

Instrucciones de interpretación:
- Si la carta es derecha, tiende a una respuesta afirmativa (SÍ).
- Si la carta es invertida, tiende a una respuesta negativa o de advertencia (NO).
- Explica de forma mística y astrológica la respuesta y brinda un consejo astral.`

      schemaDetails = `{
  "individual": [
    {
      "position": "Consejo Astral",
      "interpretation": "Interpretación detallada de la carta única y su relevancia para la pregunta del consultante."
    }
  ],
  "synthesis": "Síntesis mística que inicia revelando con voz profética y clara si la respuesta tiende al SÍ o al NO, explicando detalladamente los motivos espirituales basándose en el arcano y la astrología natal del consultante.",
  "binary_answer": "SÍ" o "NO" (elige uno basándote estrictamente en tu análisis de la tirada)
}`
    } else if (readingType === "cruz") {
      promptDetails = `Tirada: RITUAL DE LA CRUZ ASTRAL (5 cartas).
Analiza las siguientes 5 cartas en sus posiciones específicas:
1. Situación Actual: ${selectedCards[0]?.name} (${selectedCards[0]?.isReversed ? "Invertida" : "Al derecho"}) - Representa el punto de partida y la energía actual.
2. Obstáculo: ${selectedCards[1]?.name} (${selectedCards[1]?.isReversed ? "Invertida" : "Al derecho"}) - Representa los desafíos y bloqueos inmediatos.
3. Corona: ${selectedCards[2]?.name} (${selectedCards[2]?.isReversed ? "Invertida" : "Al derecho"}) - Representa las metas, el pensamiento consciente y el destino superior.
4. Raíz: ${selectedCards[3]?.name} (${selectedCards[3]?.isReversed ? "Invertida" : "Al derecho"}) - Representa el subconsciente, las bases profundas y el pasado que sostiene el problema.
5. Desenlace: ${selectedCards[4]?.name} (${selectedCards[4]?.isReversed ? "Invertida" : "Al derecho"}) - Representa la resolución y porvenir espiritual final.

Instrucciones:
Proporciona una lectura integral de estas 5 posiciones detallando cómo interactúan.`

      schemaDetails = `{
  "individual": [
    {
      "position": "Situación Actual",
      "interpretation": "Interpretación mística de la carta en la posición de Situación Actual..."
    },
    {
      "position": "Obstáculo",
      "interpretation": "Interpretación mística del Obstáculo que se presenta..."
    },
    {
      "position": "Corona",
      "interpretation": "Interpretación de la Corona consciente y metas superiores..."
    },
    {
      "position": "Raíz",
      "interpretation": "Interpretación de las raíces profundas e inconscientes..."
    },
    {
      "position": "Desenlace",
      "interpretation": "Interpretación del Desenlace final o resolución astral..."
    }
  ],
  "synthesis": "Síntesis mística que unifica las 5 energías en una sola narrativa orientadora para la vida del consultante, respondiendo a su pregunta y relacionándolo con su trasfondo astral y cualquier patrón del historial cósmico previo."
}`
    } else {
      // trinidad
      promptDetails = `Tirada: TRINIDAD DEL DESTINO (3 cartas).
Cartas seleccionadas:
1. Pasado: ${selectedCards[0]?.name} (${selectedCards[0]?.isReversed ? "Invertida" : "Al derecho"})
2. Presente: ${selectedCards[1]?.name} (${selectedCards[1]?.isReversed ? "Invertida" : "Al derecho"})
3. Futuro: ${selectedCards[2]?.name} (${selectedCards[2]?.isReversed ? "Invertida" : "Al derecho"})`

      schemaDetails = `{
  "individual": [
    {
      "position": "Pasado",
      "interpretation": "Interpretación mística y profunda de la carta en la posición del Pasado, en base a la pregunta y la astrología del consultante."
    },
    {
      "position": "Presente",
      "interpretation": "Interpretación mística y profunda de la carta en la posición del Presente, orientada al momento actual y la pregunta."
    },
    {
      "position": "Futuro",
      "interpretation": "Interpretación mística y profunda de la carta en la posición del Futuro, orientada a los resultados y el porvenir."
    }
  ],
  "synthesis": "Una síntesis mística, fluida y unificada que conecta el pasado, presente y futuro en una sola narrativa orientadora para el consultante, respondiendo directamente a su pregunta y considerando su trasfondo astral, el horizonte elegido, y comentando sobre patrones recurrentes del historial."
}`
    }

    const prompt = `Eres un astrólogo y lector de Tarot místico y profesional de la orden Arcana Aurea.
Analiza la siguiente tirada de Tarot para el consultante.

FILOSOFÍA DE INTERPRETACIÓN FUNDAMENTAL:
La inteligencia es la capacidad de interpretar positivamente lo que nos pasa o nos va a pasar. Por lo tanto, todas las interpretaciones de las cartas (individuales) y la síntesis de la tirada deben tener un carácter marcadamente positivo, constructivo y de empoderamiento. Incluso frente a arcanos tradicionalmente considerados difíciles, desafiantes o en posición invertida, debes encontrar y resaltar las oportunidades de crecimiento, el aprendizaje cósmico, la protección espiritual y las bendiciones encubiertas. Evita cualquier tono trágico, pesimista, de castigo o fatalidad.

Detalles del Consultante:
- Nombre/Email: ${session?.user?.name || email || "Buscador del Destino"}
- Fecha de Nacimiento: ${birthDate}
- Hora de Nacimiento: ${unknownTime ? "Hora desconocida" : birthTime || "No especificada"}
- Tema de Consulta: ${theme || "General"}
- Horizonte de Tiempo: ${horizon || "Hoy"}
- Pregunta formulada: "${question || "Guía general"}"

HISTORIAL DE LECTURAS PREVIAS (Contexto Cósmico de Tiradas Anteriores):
${historyText}

DETALLES DE LA TIRADA ACTUAL:
${promptDetails}

Por favor, proporciona una respuesta en formato JSON estructurado con el siguiente esquema exacto. No incluyas bloques de código markdown (\`\`\`json ... \`\`\`), entrega estrictamente el texto plano en JSON para que pueda ser procesado por JSON.parse de forma directa:
${schemaDetails}
Asegúrate de escribir en un tono místico, poético, empático y profesional, digno del oráculo Arcana Aurea. Todo en español. IMPORTANTE: No uses la palabra "amado" o "amada" para dirigirte al consultante, dirígete a la persona simplemente por su nombre.`

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!responseText) {
      throw new Error("No text response from Gemini API")
    }

    const parsedJson = JSON.parse(responseText.trim())

    // Save actual reading in DB for future context
    if (email) {
      try {
        await pool.query('BEGIN')
        await pool.query(
          `INSERT INTO readings (email, reading_type, theme, horizon, question, cards, synthesis, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [
            email,
            readingType,
            theme || "General",
            horizon || "General",
            question || "",
            JSON.stringify(selectedCards),
            parsedJson.synthesis
          ]
        )
        await pool.query(
          `UPDATE user_profiles SET credits = credits - $1 WHERE email = $2`,
          [cost, email]
        )
        await pool.query(
          `INSERT INTO credit_transactions (email, amount, transaction_type, description)
           VALUES ($1, $2, $3, $4)`,
          [email, -cost, 'reading', `Lectura: ${readingType}`]
        )
        await pool.query('COMMIT')
      } catch (dbErr) {
        await pool.query('ROLLBACK')
        console.error("Error saving live reading:", dbErr)
      }
    }

    return NextResponse.json({
      ...parsedJson,
      isMock: false
    })

  } catch (error: any) {
    console.error("Error in tarot interpretation API:", error)
    return NextResponse.json(
      { error: "Error interno al procesar la interpretación del oráculo. Por favor intenta de nuevo." },
      { status: 500 }
    )
  }
}
