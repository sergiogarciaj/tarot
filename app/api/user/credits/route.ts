import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { pool, initDb } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await auth()
    const email = session?.user?.email

    if (!email) {
      return NextResponse.json({ credits: 0 }, { status: 401 })
    }

    await initDb()

    const result = await pool.query(
      `SELECT credits FROM user_profiles WHERE email = $1`,
      [email]
    )

    const credits = result.rows[0]?.credits ?? 10

    return NextResponse.json({ credits })
  } catch (error) {
    console.error("Error fetching credits:", error)
    return NextResponse.json(
      { error: "Error interno al obtener los créditos" },
      { status: 500 }
    )
  }
}
