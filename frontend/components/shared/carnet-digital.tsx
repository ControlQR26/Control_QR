"use client";

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface CarnetDigitalProps {
  student: {
    nombres: string;
    apellidos: string;
    programaAcademico: string;
    codigoEstudiantil: string;
    numeroDocumento: string;
    qrCode?: string;
  };
}

export default function CarnetDigital({ student }: CarnetDigitalProps) {
  const [coloredQr, setColoredQr] = useState<string>('');

  useEffect(() => {
    if (student.qrCode) {
      setColoredQr(student.qrCode);
      return;
    }

    const rawData = student.codigoEstudiantil || student.numeroDocumento || 'CONTROLQR';
    QRCode.toDataURL(rawData, {
      width: 400,
      margin: 0,
      color: {
        dark: '#006B2E',
        light: '#FFFFFF',
      },
    })
      .then((url) => setColoredQr(url))
      .catch((err) => {
        console.error('Error generando QR:', err);
        setColoredQr('');
      });
  }, [student]);

  const primerNombre = student.nombres ? student.nombres.split(' ')[0] : '';
  const restNombres = student.nombres ? student.nombres.split(' ').slice(1).join(' ') : '';
  const apellidosCompletos = [restNombres, student.apellidos].filter(Boolean).join(' ');

  return (
    <div
      id="carnet-digital-card"
      style={{
        width: '100%',
        maxWidth: '380px',
        aspectRatio: '580 / 960',
        borderRadius: '28px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
        backgroundColor: '#ffffff', // Mantiene los bordes blancos nativos redondeados
        backgroundImage: 'url("/carnet-bg.png")',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        userSelect: 'none',
      }}
    >
      {/* Fuentes */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Oswald:wght@500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ====== CAPA DE DATOS SUPERPUESTOS ====== */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        {/* 1. CÓDIGO QR ENMARCADO EXACTAMENTE EN EL CUADRO BLANCO */}
        <div
          style={{
            position: 'absolute',
            top: '36.2%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '54.5%',
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5%',
            boxSizing: 'border-box',
          }}
        >
          {coloredQr && (
            <img
              src={coloredQr}
              alt="Código QR"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '10px',
              }}
            />
          )}
        </div>

        {/* 2. INFORMACIÓN DEL ESTUDIANTE (Nombre, Apellidos y Programa) */}
        <div
          style={{
            position: 'absolute',
            top: '72.5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '88%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Nombre principal */}
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '24px',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: '-0.3px',
            }}
          >
            {primerNombre}
          </h2>

          {/* Apellidos */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px',
              fontWeight: 700,
              color: '#334155',
              margin: '2px 0 0 0',
              lineHeight: 1.2,
            }}
          >
            {apellidosCompletos}
          </p>

          {/* Programa Académico */}
          <span
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginTop: '4px',
            }}
          >
            — {student.programaAcademico || 'Grado 11°'} —
          </span>
        </div>

        {/* 3. NÚMEROS DE CÓDIGO Y DOCUMENTO EN EL FOOTER */}
        {/* CÓDIGO */}
        <div
          style={{
            position: 'absolute',
            top: '93.2%',
            left: '32.5%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#fde047',
              letterSpacing: '0.8px',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            }}
          >
            {student.codigoEstudiantil || '20261003'}
          </span>
        </div>

        {/* DOCUMENTO (Ajustado a left: 78.8% para equilibrio óptimo) */}
        <div
          style={{
            position: 'absolute',
            top: '93.2%',
            left: '78.8%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#fde047',
              letterSpacing: '0.8px',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            }}
          >
            {student.numeroDocumento || '1034567890'}
          </span>
        </div>
      </div>
    </div>
  );
}