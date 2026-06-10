import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const species = await db.species.findMany({
      orderBy: { nameEn: 'asc' },
    })
    return NextResponse.json(species)
  } catch (error) {
    console.error('Error fetching species:', error)
    return NextResponse.json({ error: 'Failed to fetch species' }, { status: 500 })
  }
}
