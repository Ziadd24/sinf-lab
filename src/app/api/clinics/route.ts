import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const clinics = await db.clinic.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { samples: true, invoices: true, pets: true } },
      },
    })
    return NextResponse.json(clinics)
  } catch (error) {
    console.error('Error fetching clinics:', error)
    return NextResponse.json({ error: 'Failed to fetch clinics' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const clinic = await db.clinic.create({ data: body })
    return NextResponse.json(clinic, { status: 201 })
  } catch (error) {
    console.error('Error creating clinic:', error)
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    const clinic = await db.clinic.update({ where: { id }, data })
    return NextResponse.json(clinic)
  } catch (error) {
    console.error('Error updating clinic:', error)
    return NextResponse.json({ error: 'Failed to update clinic' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    const clinic = await db.clinic.update({ where: { id }, data: { active: false } })
    return NextResponse.json(clinic)
  } catch (error) {
    console.error('Error deleting clinic:', error)
    return NextResponse.json({ error: 'Failed to delete clinic' }, { status: 500 })
  }
}
