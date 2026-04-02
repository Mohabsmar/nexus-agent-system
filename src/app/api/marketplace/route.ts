// Z-Claw Marketplace API
// Comprehensive API for marketplace operations

import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedMarketplace } from '@/lib/zclaw/marketplaces/unified-marketplace';
import { MarketplaceCategory, MarketplaceSource, MarketplaceSort } from '@/lib/zclaw/types';

export async function GET(request: NextRequest) {
  try {
    const marketplace = getUnifiedMarketplace();
    const searchParams = request.nextUrl.searchParams;

    // Check for specific endpoints
    const action = searchParams.get('action');

    if (action === 'stats') {
      return NextResponse.json(marketplace.getStats());
    }

    if (action === 'categories') {
      const stats = marketplace.getStats();
      return NextResponse.json({
        categories: Object.entries(stats.categories).map(([key, count]) => ({
          id: key,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          count,
        })),
      });
    }

    if (action === 'featured') {
      const limit = parseInt(searchParams.get('limit') || '10');
      return NextResponse.json(marketplace.getFeatured(limit));
    }

    if (action === 'trending') {
      const limit = parseInt(searchParams.get('limit') || '10');
      return NextResponse.json(marketplace.getTrending(limit));
    }

    if (action === 'new-releases') {
      const limit = parseInt(searchParams.get('limit') || '10');
      return NextResponse.json(marketplace.getNewReleases(limit));
    }

    if (action === 'installed') {
      return NextResponse.json(marketplace.getInstalled());
    }

    if (action === 'collections') {
      return NextResponse.json(marketplace.getCollections());
    }

    // Search with filters
    const filters = {
      query: searchParams.get('q') || searchParams.get('query') || undefined,
      category: searchParams.get('category') as MarketplaceCategory | undefined,
      source: searchParams.get('source') as MarketplaceSource | undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      author: searchParams.get('author') || undefined,
      price: searchParams.get('price')?.split(',').filter(Boolean) as ('free' | 'freemium' | 'paid')[] | undefined,
      rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
      installed: searchParams.get('installed') === 'true' ? true : searchParams.get('installed') === 'false' ? false : undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      verified: searchParams.get('verified') === 'true' ? true : undefined,
      sortBy: (searchParams.get('sort') || searchParams.get('sortBy')) as MarketplaceSort | undefined,
      sortOrder: (searchParams.get('order') || 'desc') as 'asc' | 'desc',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const results = await marketplace.search(filters);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Marketplace API error:', error);
    return NextResponse.json(
      { error: 'Failed to process marketplace request' },
      { status: 500 }
    );
  }
}
