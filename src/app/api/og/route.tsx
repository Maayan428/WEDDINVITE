import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #f0fafa 0%, #ffffff 60%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Outer border */}
        <div style={{
          position: 'absolute',
          inset: '20px',
          border: '2px solid #0d9488',
          borderRadius: '16px',
          display: 'flex',
        }} />

        {/* Top label */}
        <div style={{
          fontSize: '28px',
          color: '#0d9488',
          letterSpacing: '8px',
          marginBottom: '24px',
          display: 'flex',
        }}>
          הוזמנת לחתונה
        </div>

        {/* Ring emoji */}
        <div style={{ fontSize: '80px', marginBottom: '16px', display: 'flex' }}>
          💍
        </div>

        {/* CTA */}
        <div style={{
          fontSize: '40px',
          color: '#1e3a5f',
          fontWeight: 'bold',
          marginBottom: '24px',
          display: 'flex',
        }}>
          לחצו לאישור הגעה
        </div>

        {/* Divider */}
        <div style={{
          width: '200px',
          height: '2px',
          background: '#0d9488',
          marginBottom: '20px',
          display: 'flex',
        }} />

        {/* Domain */}
        <div style={{
          fontSize: '24px',
          color: '#6b7280',
          display: 'flex',
        }}>
          weddinvite-ten.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
