// Z-Claw Themes Marketplace API

import { NextResponse } from 'next/server';
import { getUnifiedMarketplace } from '@/lib/zclaw/marketplaces/unified-marketplace';

export async function GET() {
  const marketplace = getUnifiedMarketplace();
  return NextResponse.json(marketplace.getThemes());
}
