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
      `SELECT id, reading_type, TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as date, theme, horizon, question, cards, synthesis
       FROM readings
       WHERE email = $1
       ORDER BY created_at DESC`,
      [email]
    )

    return NextResponse.json({ readings: result.rows })
  } catch (error: any) {
    console.error("Error in GET /api/readings:", error)
    return NextResponse.json({ error: error.message || "Error del servidor" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    const email = session?.user?.email

    if (!email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

    await initDb()

    await pool.query(
      "DELETE FROM readings WHERE id = $1 AND email = $2",
      [id, email]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in DELETE /api/readings:", error)
    return NextResponse.json({ error: error.message || "Error del servidor" }, { status: 500 })
  }
}
