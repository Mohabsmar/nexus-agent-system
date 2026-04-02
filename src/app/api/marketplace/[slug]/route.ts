// Z-Claw Marketplace Item API
// Get, install, uninstall individual marketplace items

import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedMarketplace } from '@/lib/zclaw/marketplaces/unified-marketplace';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const marketplace = getUnifiedMarketplace();
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    // Get reviews for item
    if (action === 'reviews') {
      const reviews = marketplace.getReviews(slug);
      return NextResponse.json({ reviews });
    }

    // Get item details
    const item = marketplace.getItem(slug);
    if (!item) {
      return NextResponse.json(
        { error: `Item "${slug}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Marketplace item API error:', error);
    return NextResponse.json(
      { error: 'Failed to get marketplace item' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const marketplace = getUnifiedMarketplace();
    const body = await request.json().catch(() => ({}));

    // Install item
    const result = await marketplace.install(slug);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully installed ${slug}`,
      ...result,
    });
  } catch (error) {
    console.error('Install error:', error);
    return NextResponse.json(
      { error: 'Failed to install item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const marketplace = getUnifiedMarketplace();

    // Uninstall item
    const result = await marketplace.uninstall(slug);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uninstalled ${slug}`,
    });
  } catch (error) {
    console.error('Uninstall error:', error);
    return NextResponse.json(
      { error: 'Failed to uninstall item' },
      { status: 500 }
    );
  }
}
