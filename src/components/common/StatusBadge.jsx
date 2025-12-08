/**
 * StatusBadge.jsx
 * 
 * Komponen reusable untuk menampilkan badge status gizi dengan styling yang lebih baik
 * - Background full menutupi tulisan dengan padding yang cukup
 * - Animasi hover yang smooth
 * - Konsisten dengan standar WHO
 */

import { useState } from 'react';

function StatusBadge({ status, size = 'md', className = '' }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!status || status === '-' || status === 'PENDING') {
    return (
      <span 
        className={`status-badge status-badge-warning ${size} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        PENDING
      </span>
    );
  }

  const statusLower = (status || '').toLowerCase();
  const statusText = status || '-';

  // Tentukan warna badge berdasarkan standar WHO
  let badgeType = 'ghost'; // default
  if (statusLower.includes('stunting') || statusLower.includes('buruk')) {
    badgeType = 'error';
  } else if (statusLower.includes('kurang') || statusLower.includes('wasting') || statusLower.includes('underweight')) {
    badgeType = 'warning';
  } else if (statusLower.includes('normal')) {
    badgeType = 'success';
  } else if (statusLower.includes('overweight') || statusLower.includes('obesitas') || statusLower.includes('obese')) {
    badgeType = 'warning';
  } else if (statusLower.includes('tinggi') || statusLower.includes('tall')) {
    badgeType = 'info';
  }

  return (
    <span
      className={`status-badge status-badge-${badgeType} ${size} ${className} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={statusText}
    >
      {statusText}
    </span>
  );
}

export default StatusBadge;

