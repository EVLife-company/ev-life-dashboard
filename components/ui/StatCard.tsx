interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export default function StatCard({
  label,
  value,
  sub,
  color = '#111'
}: StatCardProps) {

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: 14,
        padding: '20px 22px',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
      }}
    >

      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#777',
          letterSpacing: '.6px',
          textTransform: 'uppercase',
          marginBottom: 10
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: -1,
          marginBottom: 6,
          color
        }}
      >
        {value}
      </div>

      {sub && (
        <div
          style={{
            fontSize: 13,
            color: '#888'
          }}
        >
          {sub}
        </div>
      )}

    </div>
  );
}