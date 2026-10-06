import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GalleryProject } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('type') || undefined;
    const style = searchParams.get('style') || undefined;

    const projects = await db.getGalleryProjects({ type: eventType, style });

    return NextResponse.json({
      success: true,
      data: projects,
      total: projects.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.heroImage) {
      return NextResponse.json(
        { success: false, error: 'Title and Hero Image are required' },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const newProject: GalleryProject = {
      id: body.id || `proj-${Date.now()}`,
      slug,
      title: body.title,
      eventType: body.eventType || 'Wedding',
      venueName: body.venueName || 'Luxury Venue Addis',
      locationCity: body.locationCity || 'Addis Ababa',
      guestCount: Number(body.guestCount) || 150,
      decorationStyle: body.decorationStyle || 'Luxury',
      heroImage: body.heroImage,
      beforeImage: body.beforeImage || undefined,
      afterImage: body.afterImage || body.heroImage,
      videoUrl: body.videoUrl || undefined,
      description: body.description || '',
      colorPalette: Array.isArray(body.colorPalette) ? body.colorPalette : ['#5B1424', '#D4AF37'],
      estimatedPriceRange: body.estimatedPriceRange || 'ETB 100,000 - 180,000',
      testimonialQuote: body.testimonialQuote || undefined,
      testimonialAuthor: body.testimonialAuthor || undefined,
      servicesUsed: Array.isArray(body.servicesUsed) ? body.servicesUsed : ['Stage Decoration', 'Floral Design'],
      isFeatured: Boolean(body.isFeatured),
      displayOrder: Number(body.displayOrder) || 1,
    };

    const saved = await db.addGalleryProject(newProject);

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      data: saved,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || body.slug;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Project ID or Slug is required' },
        { status: 400 }
      );
    }

    const updated = await db.updateGalleryProject(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || searchParams.get('slug');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Project ID or Slug query parameter is required' },
        { status: 400 }
      );
    }

    const deleted = await db.deleteGalleryProject(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
