'use client';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          border: '1px solid #eee',
          borderRadius: 16,
          padding: 28,
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)'
        }}
      >

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#111',
            marginBottom: 20
          }}
        >
          {title}
        </div>

        {children}

      </div>

    </div>
  );
}