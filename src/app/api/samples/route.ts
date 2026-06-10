import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const samples = await db.labSample.findMany({
      orderBy: { collectedAt: 'desc' },
      include: {
        pet: { include: { species: true, clinic: true } },
        clinic: true,
        invoice: true,
        results: { include: { catalog: true } },
      },
    })
    return NextResponse.json(samples)
  } catch (error) {
    console.error('Error fetching samples:', error)
    return NextResponse.json({ error: 'Failed to fetch samples' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const sample = await db.labSample.create({ data: body })
    return NextResponse.json(sample, { status: 201 })
  } catch (error) {
    console.error('Error creating sample:', error)
    return NextResponse.json({ error: 'Failed to create sample' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    const sample = await db.labSample.update({ where: { id }, data })
    return NextResponse.json(sample)
  } catch (error) {
    console.error('Error updating sample:', error)
    return NextResponse.json({ error: 'Failed to update sample' }, { status: 500 })
  }
}
