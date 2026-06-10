import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const tests = await db.testCatalog.findMany({
      orderBy: { testCode: 'asc' },
      include: { species: true },
    })
    return NextResponse.json(tests)
  } catch (error) {
    console.error('Error fetching tests:', error)
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const test = await db.testCatalog.create({ data: body })
    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error('Error creating test:', error)
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    const test = await db.testCatalog.update({ where: { id }, data })
    return NextResponse.json(test)
  } catch (error) {
    console.error('Error updating test:', error)
    return NextResponse.json({ error: 'Failed to update test' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    const test = await db.testCatalog.update({ where: { id }, data: { active: false } })
    return NextResponse.json(test)
  } catch (error) {
    console.error('Error deleting test:', error)
    return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 })
  }
}
