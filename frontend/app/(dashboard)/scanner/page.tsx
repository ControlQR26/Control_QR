"use client";

import { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Camera, QrCode, BellRing, UserCheck, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function ScannerPage() {
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorResult, setErrorResult] = useState<string | null>(null);

  // Cámara activa y ref del scanner
  const [cameraActive, setCameraActive] = useState(true);
  const html5QrCodeRef = useRef<any>(null);
  const lastScannedRef = useRef<string>('');
  const cooldownRef = useRef<boolean>(false);
  const [cooldown, setCooldown] = useState(false);
  const COOLDOWN_SECONDS = 5;

  const startCamera = () => {
    setCameraActive(true);
    setScanResult(null);
    setErrorResult(null);
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Error al detener la cámara:', err);
      }
    }
    setCameraActive(false);
  };

  // Inicializar escáner de html5-qrcode cuando la cámara se activa
  useEffect(() => {
    let active = true;

    if (cameraActive) {
      const initScanner = async () => {
        try {
          // Importación dinámica para prevenir problemas con SSR
          const { Html5Qrcode } = await import('html5-qrcode');
          if (!active) return;

          const html5QrCode = new Html5Qrcode("reader");
          html5QrCodeRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 280, height: 280 },
            },
            (decodedText) => {
              onScanSuccess(decodedText);
            },
            (errorMessage) => {
              // Fails silently for continuous scanning logs
            }
          );
          
          toast.success('Cámara web iniciada con éxito');
        } catch (err) {
          console.error("No se pudo iniciar el escaneo: ", err);
          toast.error('Error de acceso a la cámara. Asegúrese de dar permisos y usar HTTPS.');
          setCameraActive(false);
        }
      };

      initScanner();
    }

    return () => {
      active = false;
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [cameraActive]);

  const onScanSuccess = async (decodedText: string) => {
    // Prevenir escaneos duplicados con cooldown
    if (cooldownRef.current) return;
    if (lastScannedRef.current === decodedText) return;

    cooldownRef.current = true;
    setCooldown(true);
    lastScannedRef.current = decodedText;
    
    setLoading(true);
    setScanResult(null);
    setErrorResult(null);

    try {
      const now = new Date();
      const hours24 = now.getHours();
      const minutes = now.getMinutes();
      const hours12 = hours24 % 12 || 12;
      const ampm = hours24 < 12 ? 'a. m.' : 'p. m.';
      const clientTimeStr = `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;

      const day = now.getDate();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const clientDateStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      const clientHora24 = `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      const res = await fetch('/api/scanner/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrData: decodedText,
          metodo: 'QR',
          clientTimeStr,
          clientDateStr,
          clientHora24
        }),
      });
      const data = await res.json();

      if (data.success) {
        setScanResult(data);
        toast.success('Ingreso autorizado correctamente.');
      } else {
        if (data.status === 'estudiante inactivo') {
          setScanResult(data);
          setErrorResult(data.error);
        } else {
          setErrorResult(data.error || 'Acceso rechazado por regla académica.');
          toast.error(data.error || 'Ingreso rechazado.');
        }
      }
    } catch (e) {
      setErrorResult('Error de red al intentar conectarse al servidor.');
      toast.error('Error de comunicación.');
    } finally {
      setLoading(false);
      // Cooldown de N segundos antes de permitir otro escaneo
      setTimeout(() => {
        cooldownRef.current = false;
        setCooldown(false);
        lastScannedRef.current = '';
      }, COOLDOWN_SECONDS * 1000);
    }
  };

  const onScanFailure = (error: any) => {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Estación de Escaneo y Control de Ingresos"
        description="Escanee carnets estudiantiles en tiempo real mediante la cámara web de este dispositivo."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lado Izquierdo: Lector de Cámara Ampliado */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Contenedor Lector de cámara ampliado */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 self-start">
              <Camera className="h-5 w-5 text-emerald-600" />
              Lector por Cámara Web
            </h2>

            {/* Cuadro de Cámara Ampliado (360px de alto mínimo) */}
            <div className="w-full aspect-[4/3] min-h-[360px] bg-gray-900 rounded-xl flex flex-col items-center justify-center text-gray-500 relative overflow-hidden border border-gray-800 shadow-inner">
              {cameraActive ? (
                <>
                  <div id="reader" className="absolute inset-0 w-full h-full bg-black"></div>
                  {cooldown && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-yellow-400 text-xs font-bold px-4 py-2 rounded-full backdrop-blur-sm">
                      ⏳ Esperando {COOLDOWN_SECONDS}s para siguiente lectura...
                    </div>
                  )}
                </>
              ) : (
                <>
                  <QrCode className="h-20 w-20 text-gray-700" />
                  <p className="text-sm mt-3 font-semibold text-gray-400">Cámara inactiva</p>
                  <p className="text-xs text-gray-600 mt-1">Presione el botón inferior para activar el visor</p>
                </>
              )}
            </div>

            <div className="mt-5 w-full">
              {cameraActive ? (
                <button onClick={stopCamera} className="w-full text-sm font-bold border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl transition-colors shadow-sm">
                  Detener Lector
                </button>
              ) : (
                <button onClick={startCamera} className="w-full text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2">
                  <Camera className="h-5 w-5" />
                  Activar Cámara Web
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Lado Derecho: Resultados del Ingreso y Notificaciones */}
        <div className="lg:col-span-6">
          
          {loading && (
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center h-full min-h-[360px]">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
              <p className="text-sm font-semibold text-gray-500">Validando datos del estudiante...</p>
            </div>
          )}

          {!loading && !scanResult && !errorResult && (
            <div className="bg-slate-50 border border-dashed border-gray-200 p-8 rounded-xl flex flex-col items-center justify-center h-full min-h-[360px] text-gray-400">
              <QrCode className="h-16 w-16 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">Esperando lectura de carnet digital</p>
              <p className="text-xs text-gray-400 mt-1 text-center">Enfoque el código QR frente a la cámara.</p>
            </div>
          )}

          {errorResult && (
            <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="text-base font-bold text-red-950">Acceso Denegado</h3>
                  <p className="text-xs text-red-700 font-medium">Validación de ingreso rechazada por el sistema</p>
                </div>
              </div>
              <p className="text-sm text-gray-800 font-medium bg-red-50/50 p-3 rounded-lg border border-red-100">
                {errorResult}
              </p>

              {scanResult?.student && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Información del Estudiante</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p className="text-gray-500">Nombre: <span className="font-semibold text-gray-800">{scanResult.student.nombres} {scanResult.student.apellidos}</span></p>
                    <p className="text-gray-500">Código: <span className="font-semibold text-gray-800">{scanResult.student.codigoEstudiantil}</span></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {scanResult && scanResult.success && (
            <div className="space-y-6">
              
              {/* Bloque Resumen del Escaneo */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-8 w-8 text-emerald-600" />
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Ingreso Exitoso Autorizado</h3>
                    <p className="text-xs text-emerald-600 font-semibold capitalize">Estado de acceso: {scanResult.status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <p className="text-gray-400 font-semibold mb-1">DATOS ESTUDIANTE</p>
                    <p className="text-sm font-bold text-gray-800">{scanResult.student.nombres} {scanResult.student.apellidos}</p>
                    <p className="text-gray-600">Código: {scanResult.student.codigoEstudiantil} • {scanResult.student.programaAcademico}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 font-semibold mb-1">DETALLE MATERIA DETECTADA</p>
                    {scanResult.schedule ? (
                      <>
                        <p className="text-sm font-bold text-emerald-700">{scanResult.schedule.subject}</p>
                        <p className="text-gray-600">Prof. {scanResult.schedule.teacher} • Aula: {scanResult.schedule.aula || 'N/A'}</p>
                      </>
                    ) : (
                      <p className="text-slate-400 italic">Sin clases programadas en este horario.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Centro de Notificaciones Generadas */}
              {scanResult.notifications && scanResult.notifications.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <BellRing className="h-4.5 w-4.5 text-emerald-600" />
                    Notificaciones Simula-Envío Disparadas
                  </h3>

                  <div className="space-y-3">
                    {scanResult.notifications.map((notif: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            notif.tipoDestinatario === 'acudiente' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {notif.tipoDestinatario}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold font-mono">{notif.estado}</span>
                        </div>
                        <p className="text-gray-700 font-medium leading-relaxed">{notif.mensaje}</p>
                        <p className="text-[10px] text-gray-400">Destinatario: <span className="font-semibold text-gray-500">{notif.destinatario}</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
