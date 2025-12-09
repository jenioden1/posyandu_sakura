/**
 * DateInput.jsx
 * 
 * Komponen input tanggal dengan format DD-MM-YYYY (hari-bulan-tahun)
 * User-friendly untuk input tanggal Indonesia
 */

import { useState, useEffect } from 'react';

function DateInput({ name, value, onChange, required = false, max = null, min = null, className = '', placeholder = 'DD-MM-YYYY' }) {
  const [displayValue, setDisplayValue] = useState('');
  const [internalValue, setInternalValue] = useState(''); // Format YYYY-MM-DD untuk HTML5 date input

  // Konversi dari YYYY-MM-DD ke DD-MM-YYYY untuk display
  const formatToDisplay = (isoDate) => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return '';
    }
  };

  // Konversi dari DD-MM-YYYY ke YYYY-MM-DD
  const parseFromDisplay = (displayStr) => {
    if (!displayStr) return '';
    // Hapus semua karakter selain angka dan dash
    const cleaned = displayStr.replace(/[^\d-]/g, '');
    // Format: DD-MM-YYYY
    const parts = cleaned.split('-').filter(p => p);
    
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      
      // Validasi
      if (day.length === 2 && month.length === 2 && year.length === 4) {
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        
        // Validasi range
        if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
          // Cek apakah tanggal valid
          const date = new Date(yearNum, monthNum - 1, dayNum);
          if (date.getDate() === dayNum && date.getMonth() === monthNum - 1 && date.getFullYear() === yearNum) {
            return `${yearNum}-${month}-${day}`;
          }
        }
      }
    }
    return '';
  };

  // Update display value saat value prop berubah
  useEffect(() => {
    if (value) {
      const formatted = formatToDisplay(value);
      setDisplayValue(formatted);
      setInternalValue(value);
    } else {
      setDisplayValue('');
      setInternalValue('');
    }
  }, [value]);

  const handleInputChange = (e) => {
    let inputValue = e.target.value;
    
    // Hapus semua karakter selain angka dan dash
    inputValue = inputValue.replace(/[^\d-]/g, '');
    
    // Auto-format saat mengetik: DD-MM-YYYY
    if (inputValue.length > 0) {
      const digits = inputValue.replace(/-/g, '');
      let formatted = '';
      
      if (digits.length <= 2) {
        formatted = digits;
      } else if (digits.length <= 4) {
        formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
      } else {
        formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
      }
      
      inputValue = formatted;
    }
    
    setDisplayValue(inputValue);
    
    // Coba parse ke format ISO hanya jika sudah lengkap (DD-MM-YYYY)
    const isoDate = parseFromDisplay(inputValue);
    setInternalValue(isoDate);
    
    // Trigger onChange dengan format ISO (YYYY-MM-DD) hanya jika valid
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name,
          value: isoDate || '' // Kirim string kosong jika belum valid
        }
      };
      onChange(syntheticEvent);
    }
  };

  const handleBlur = () => {
    // Validasi dan format ulang saat blur
    if (displayValue) {
      const isoDate = parseFromDisplay(displayValue);
      if (isoDate) {
        const formatted = formatToDisplay(isoDate);
        setDisplayValue(formatted);
        setInternalValue(isoDate);
      } else {
        // Jika tidak valid, reset ke value asli
        setDisplayValue(formatToDisplay(value || ''));
        setInternalValue(value || '');
      }
    }
  };

  // Format max dan min untuk display
  const formatMaxMin = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return formatToDisplay(dateStr);
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        name={name}
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`input input-bordered w-full ${className}`}
        required={required}
        maxLength={10}
        pattern="\d{2}-\d{2}-\d{4}"
        title="Format: DD-MM-YYYY (contoh: 15-06-2024)"
      />
      {/* Hidden input untuk validasi HTML5 */}
      <input
        type="date"
        name={`${name}_iso`}
        value={internalValue}
        onChange={() => {}} // Read-only, hanya untuk validasi
        className="hidden"
        max={max || undefined}
        min={min || undefined}
        required={required}
      />
      {displayValue && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <label className="label">
        <span className="label-text-alt text-gray-500">
          Format: DD-MM-YYYY (contoh: 15-06-2024)
        </span>
      </label>
    </div>
  );
}

export default DateInput;

