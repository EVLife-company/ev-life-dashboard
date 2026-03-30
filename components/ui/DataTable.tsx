'use client';

interface Column {
  key: string;
  label: string;
  render?: (val: any, row: any) => React.ReactNode;
}

interface Props {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
}

export default function DataTable({ columns, data, emptyMessage = 'No data found' }: Props) {

  if (data.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 20px',
          color: '#777',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
        <div style={{ fontSize: 14 }}>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'Inter, sans-serif'
        }}
      >

        <thead>
          <tr>

            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#777',
                  letterSpacing: '.5px',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #eee',
                  background: '#fafafa'
                }}
              >
                {col.label}
              </th>
            ))}

          </tr>
        </thead>

        <tbody>

          {data.map((row, i) => (

            <tr
              key={row.id || i}
              style={{
                borderBottom: '1px solid #f2f2f2',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f7f9fb')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >

              {columns.map(col => (

                <td
                  key={col.key}
                  style={{
                    padding: '14px 16px',
                    fontSize: 14,
                    color: '#333'
                  }}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : row[col.key] ?? '—'}
                </td>

              ))}

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}