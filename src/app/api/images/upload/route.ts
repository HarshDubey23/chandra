// Admin: upload a new image to public/uploads/ with Sharp processing.
// POST multipart/form-data with fields: file, category, hiCaption, enCaption, isPublic.
// Saves to /public/uploads/<uuid>.webp, creates ImageAsset row, returns the asset.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { logActivity } from '@/lib/audit'
import sharp from 'sharp'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const category = (formData.get('category') as string) || 'other'
    const hiCaption = (formData.get('hiCaption') as string) || ''
    const enCaption = (formData.get('enCaption') as string) || ''
    const isPublic = (formData.get('isPublic') as string) === 'true'

    if (!file) {
      return NextResponse.json({ error: 'no_file', message: 'कोई फ़ाइल नहीं मिली' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'file_too_large', message: 'फ़ाइल 10MB से कम होनी चाहिए' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'invalid_type', message: 'केवल JPEG, PNG, WebP, GIF, BMP अनुमत हैं' }, { status: 400 })
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true })

    // Generate unique filename
    const uuid = randomUUID()
    const filename = `${uuid}.webp`
    const filepath = join(UPLOAD_DIR, filename)
    const url = `/uploads/${filename}`

    // Process image with Sharp: convert to WebP, resize if too large, optimize
    const buffer = Buffer.from(await file.arrayBuffer())
    await sharp(buffer)
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(filepath)

    // Generate imageId
    const imageId = `img_upload_${Date.now().toString(36)}_${uuid.slice(0, 8)}`

    // Create ImageAsset row
    const asset = await db.imageAsset.create({
      data: {
        imageId,
        filename,
        url,
        category,
        hiCaption: hiCaption || filename,
        enCaption: enCaption || filename,
        isPublic,
        purpose: 'admin-upload',
        confidence: 1.0,
      },
    })

    await logActivity({
      adminId: user.id,
      action: 'upload',
      entityType: 'image',
      entityId: imageId,
      before: null,
      after: { filename, category, hiCaption, isPublic },
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({ ok: true, image: asset })
  } catch (err) {
    console.error('[images/upload] error:', err)
    return NextResponse.json(
      { error: 'upload_failed', message: 'अपलोड विफल — पुनः प्रयास करें' },
      { status: 500 }
    )
  }
}
