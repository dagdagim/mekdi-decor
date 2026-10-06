import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PackageItem } from '@/lib/types';

export async function GET() {
  try {
    const packages = await db.getPackages();
    return NextResponse.json({
      success: true,
      data: packages,
      total: packages.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.startingPrice) {
      return NextResponse.json(
        { success: false, error: 'Package name and starting price are required' },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const newPackage: PackageItem = {
      id: body.id || `pkg-${Date.now()}`,
      slug,
      name: body.name,
      tierLabel: body.tierLabel || 'Custom Package',
      tagline: body.tagline || 'Custom luxury decor tailored to your venue',
      description: body.description || '',
      startingPrice: Number(body.startingPrice) || 50000,
      currency: body.currency || 'ETB',
      isFeatured: Boolean(body.isFeatured),
      includedServices: Array.isArray(body.includedServices) ? body.includedServices : [],
      displayOrder: Number(body.displayOrder) || 1,
    };

    const saved = await db.addPackage(newPackage);

    return NextResponse.json({
      success: true,
      message: 'Package created successfully',
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
        { success: false, error: 'Package ID or Slug is required' },
        { status: 400 }
      );
    }

    const updated = await db.updatePackage(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Package updated successfully',
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
        { success: false, error: 'Package ID or Slug query parameter is required' },
        { status: 400 }
      );
    }

    const deleted = await db.deletePackage(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
