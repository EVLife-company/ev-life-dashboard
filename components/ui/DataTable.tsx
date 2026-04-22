'use client';

import React from 'react';

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
  // 1. SAFEGUARD: Ensure 'data' is actually an array before trying to use .length or .map
  const isDataValid = Array.isArray(data);
  const hasData = isDataValid && data.length > 0;

  // 2. EMPTY/ERROR STATE
  if (!hasData) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px', 
        background: '#141420', 
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.05)',
        color: '#44445A', 
        fontFamily: 'Outfit, sans-serif' 
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{isDataValid ? '📭' : '⚠️'}</div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>
          {isDataValid ? emptyMessage : 'Error loading data structure'}
        </div>
        {!isDataValid && (
          <div style={{ fontSize: 11, marginTop: 8, opacity: 0.6 }}>
            Expected an array but received {typeof data}
          </div>
        )}
      </div>
    );
  }

  // 3. TABLE RENDER
  return (
    <div style={{ 
      width: '100%', 
      overflowX: 'auto', 
      background: '#141420', 
      borderRadius: 16, 
      border: '1px solid rgba(255,255,255,0.05)' 
    }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        fontFamily: 'Outfit, sans-serif',
        minWidth: 600
      }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
            {columns.map((col) => (
              <th 
                key={col.key} 
                style={{ 
                  textAlign: 'left', 
                  padding: '16px', 
                  fontSize: 10, 
                  fontWeight: 700, 
                  color: '#44445A', 
                  letterSpacing: '1px', 
                  textTransform: 'uppercase', 
                  borderBottom: '1px solid rgba(255,255,255,0.07)' 
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
              key={row.id || row.bookingRef || i} 
              style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {columns.map((col) => (
                <td 
                  key={col.key} 
                  style={{ 
                    padding: '14px 16px', 
                    fontSize: 13, 
                    color: '#F1F2F6', // Slightly brighter for readability
                    opacity: 0.9
                  }}
                >
                  {col.render 
                    ? col.render(row[col.key], row) 
                    : (row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '—')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}