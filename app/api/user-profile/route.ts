import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { pool, initDb } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    const email = session?.user?.email

    if (!email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await initDb()

    const result = await pool.query(
      "SELECT TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, birth_time, unknown_time FROM user_profiles WHERE email = $1",
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ profile: null })
    }

    const row = result.rows[0]
    const birthTime = row.birth_time ? row.birth_time.substring(0, 5) : ""

    return NextResponse.json({
      profile: {
        birthDate: row.birth_date,
        birthTime,
        unknownTime: row.unknown_time
      }
    })
  } catch (error: any) {
    console.error("Error in GET /api/user-profile:", error)
    return NextResponse.json({ error: error.message || "Error del servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const email = session?.user?.email

    if (!email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { birthDate, birthTime, unknownTime } = await req.json()

    if (!birthDate) {
      return NextResponse.json({ error: "Fecha de nacimiento requerida" }, { status: 400 })
    }

    await initDb()

    // Upsert user profile
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

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in POST /api/user-profile:", error)
    return NextResponse.json({ error: error.message || "Error del servidor" }, { status: 500 })
  }
}
