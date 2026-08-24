import { ImageResponse } from 'next/og';
import { BRAND } from '@/lib/constants';

export const runtime = 'edge';
export const alt = `${BRAND.name} — Cloud POS, ERP, RMS & HMS`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 72,
        background: '#F2F0EF',
        color: '#1d1b1a',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 10,
            background: '#BC6B32',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          S
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, color: '#BC6B32' }}>{BRAND.name}</div>
      </div>
      <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.12, maxWidth: 920 }}>
        Cloud POS, ERP, RMS & HMS
      </div>
      <div style={{ fontSize: 28, color: '#52443c', marginTop: 22, maxWidth: 820 }}>
        {BRAND.productBy} — custom-built business systems, online and connected.
      </div>
    </div>,
    { ...size },
  );
}
