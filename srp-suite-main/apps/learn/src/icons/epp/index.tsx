import React from 'react';

interface IconProps {
    size?: number;
    color?: string;
}

export const Casco: React.FC<IconProps> = ({ size = 40, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M12 38c0-12 4-24 20-24s20 12 20 24" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <path d="M8 38h48v6c0 2-2 4-4 4H12c-2 0-4-2-4-4v-6z" fill={color} opacity={0.3} />
        <path d="M8 38h48v6c0 2-2 4-4 4H12c-2 0-4-2-4-4v-6z" stroke={color} strokeWidth="2.5" />
        <path d="M32 14v10" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.5} />
        <circle cx="32" cy="12" r="2" fill={color} opacity={0.5} />
    </svg>
);

export const Guantes: React.FC<IconProps> = ({ size = 40, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M20 48V28c0-2 2-4 4-4h2V16c0-2 2-3 3-3s3 1 3 3v8h2V14c0-2 2-3 3-3s3 1 3 3v10h2V18c0-2 2-3 3-3s3 1 3 3v30" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 28l-4 8c-1 2 0 4 2 5l2 1" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="24" y1="36" x2="45" y2="36" stroke={color} strokeWidth="1.5" opacity={0.4} />
    </svg>
);

export const Lentes: React.FC<IconProps> = ({ size = 40, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect x="6" y="24" width="22" height="16" rx="4" stroke={color} strokeWidth="2.5" fill={color} fillOpacity={0.15} />
        <rect x="36" y="24" width="22" height="16" rx="4" stroke={color} strokeWidth="2.5" fill={color} fillOpacity={0.15} />
        <path d="M28 30c2-2 6-2 8 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M6 30L2 28" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M58 30l4-2" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);

export const Arnes: React.FC<IconProps> = ({ size = 40, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="14" r="6" stroke={color} strokeWidth="2.5" />
        <path d="M22 24h20v8l-4 20h-12l-4-20v-8z" stroke={color} strokeWidth="2.5" fill={color} fillOpacity={0.15} />
        <path d="M18 28h28" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 28l-4 16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.6} />
        <path d="M40 28l4 16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.6} />
        <rect x="28" y="28" width="8" height="6" rx="1" fill={color} opacity={0.4} />
    </svg>
);

export const Zapatos: React.FC<IconProps> = ({ size = 40, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M10 38l4-14c1-3 4-6 8-6h10c4 0 7 2 8 6l2 6h12c4 0 6 3 6 6v4c0 2-2 4-4 4H14c-3 0-5-2-5-4v-2z" stroke={color} strokeWidth="2.5" fill={color} fillOpacity={0.15} />
        <path d="M14 44h40" stroke={color} strokeWidth="2" opacity={0.4} />
        <circle cx="42" cy="38" r="2" fill={color} opacity={0.5} />
        <path d="M18 38c0-4 2-8 6-10" stroke={color} strokeWidth="1.5" opacity={0.4} strokeLinecap="round" />
    </svg>
);

export const Chaleco: React.FC<IconProps> = ({ size = 40, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M20 16l-8 6v26l8 2V16z" stroke={color} strokeWidth="2.5" fill={color} fillOpacity={0.15} />
        <path d="M44 16l8 6v26l-8 2V16z" stroke={color} strokeWidth="2.5" fill={color} fillOpacity={0.15} />
        <path d="M20 16c4-4 8-4 12-4s8 0 12 4" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M20 50h24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="30" x2="20" y2="30" stroke="#f1c40f" strokeWidth="3" />
        <line x1="44" y1="30" x2="52" y2="30" stroke="#f1c40f" strokeWidth="3" />
        <line x1="12" y1="38" x2="20" y2="38" stroke="#f1c40f" strokeWidth="3" />
        <line x1="44" y1="38" x2="52" y2="38" stroke="#f1c40f" strokeWidth="3" />
    </svg>
);

export const Respirador: React.FC<IconProps> = ({ size = 40, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <ellipse cx="32" cy="36" rx="16" ry="14" stroke={color} strokeWidth="2.5" fill={color} fillOpacity={0.15} />
        <path d="M16 30L10 24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M48 30l6-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="26" cy="34" r="5" stroke={color} strokeWidth="2" fill={color} fillOpacity={0.2} />
        <circle cx="38" cy="34" r="5" stroke={color} strokeWidth="2" fill={color} fillOpacity={0.2} />
        <path d="M26 42h12" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.5} />
        <line x1="26" y1="32" x2="26" y2="36" stroke={color} strokeWidth="1" opacity={0.4} />
        <line x1="38" y1="32" x2="38" y2="36" stroke={color} strokeWidth="1" opacity={0.4} />
    </svg>
);

export const ProtectorAuditivo: React.FC<IconProps> = ({ size = 40, color = '#ffffff' }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M16 28c0-8 8-14 16-14s16 6 16 14" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="16" cy="34" rx="6" ry="8" fill={color} fillOpacity={0.2} stroke={color} strokeWidth="2.5" />
        <ellipse cx="48" cy="34" rx="6" ry="8" fill={color} fillOpacity={0.2} stroke={color} strokeWidth="2.5" />
        <line x1="16" y1="28" x2="16" y2="26" stroke={color} strokeWidth="3" />
        <line x1="48" y1="28" x2="48" y2="26" stroke={color} strokeWidth="3" />
    </svg>
);

// Barrel export con mapeo string → componente
export const EPP_ICONS: Record<string, React.FC<IconProps>> = {
    casco: Casco,
    guantes: Guantes,
    lentes: Lentes,
    arnes: Arnes,
    zapatos: Zapatos,
    chaleco: Chaleco,
    respirador: Respirador,
    protector_auditivo: ProtectorAuditivo,
};

// Labels en español
export const EPP_LABELS: Record<string, string> = {
    casco: 'Casco',
    guantes: 'Guantes',
    lentes: 'Lentes',
    arnes: 'Arnés',
    zapatos: 'Zapatos',
    chaleco: 'Chaleco',
    respirador: 'Respirador',
    protector_auditivo: 'Protector Auditivo',
};
