import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pets = await db.pet.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        species: true,
        clinic: true,
        _count: { select: { samples: true } },
      },
    })
    return NextResponse.json(pets)
  } catch (error) {
    console.error('Error fetching pets:', error)
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const pet = await db.pet.create({ data: body })
    return NextResponse.json(pet, { status: 201 })
  } catch (error) {
    console.error('Error creating pet:', error)
    return NextResponse.json({ error: 'Failed to create pet' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    const pet = await db.pet.update({ where: { id }, data })
    return NextResponse.json(pet)
  } catch (error) {
    console.error('Error updating pet:', error)
    return NextResponse.json({ error: 'Failed to update pet' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    await db.pet.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pet:', error)
    return NextResponse.json({ error: 'Failed to delete pet' }, { status: 500 })
  }
}
