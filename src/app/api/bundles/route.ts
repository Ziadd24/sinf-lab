import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { bundleCreateSchema, bundleUpdateSchema } from '@/lib/validators'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    
    const where = active !== null ? { active: active === 'true' } : { active: true }
    
    const bundles = await db.bundle.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    })
    
    return NextResponse.json(bundles)
  } catch (error: any) {
    console.error('Fetch Bundles Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch bundles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const data = bundleCreateSchema.parse(json)
    
    const bundle = await db.bundle.create({
      data: {
        nameEn: data.nameEn || "",
        nameAr: data.nameAr,
        testCodes: data.testCodes,
        animalIds: data.animalIds || null,
        customPrice: data.customPrice !== undefined ? data.customPrice : null,
        active: data.active,
      }
    })
    
    return NextResponse.json(bundle)
  } catch (error: any) {
    console.error('Create Bundle Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create bundle' }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const json = await request.json()
    const data = bundleUpdateSchema.parse(json)
    
    const bundle = await db.bundle.update({
      where: { id: data.id },
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        testCodes: data.testCodes,
        animalIds: data.animalIds === '' ? null : data.animalIds,
        customPrice: data.customPrice !== undefined ? data.customPrice : null,
        active: data.active,
      }
    })
    
    return NextResponse.json(bundle)
  } catch (error: any) {
    console.error('Update Bundle Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update bundle' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing bundle ID' }, { status: 400 })
    }
    
    const bundle = await db.bundle.update({
      where: { id },
      data: { active: false },
    })
    
    return NextResponse.json(bundle)
  } catch (error: any) {
    console.error('Delete Bundle Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete bundle' }, { status: 400 })
  }
}
