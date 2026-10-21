"use client";

import { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Camera, QrCode, BellRing, UserCheck, XCircle, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  const COOLDOWN_SECONDS = 4;

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
              onScanSuccess(decodedText, 'QR');
            },
            (errorMessage) => {
              // Fails silently for continuous scanning logs
            }
          );
          
          toast.success('Lector de cámara activo');
        } catch (err) {
          console.error("No se pudo iniciar el escaneo: ", err);
          toast.error('Error de acceso a la cámara. Verifique los permisos del navegador.');
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

  const processScanData = async (rawData: string, metodo: string = 'QR') => {
    setLoading(true);
    setScanResult(null);
    setErrorResult(null);

    try {
      const now = new Date();
      const clientTimeStr = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(now);

      const clientDateStr = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(now);

      const clientHora24 = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now);

      const res = await fetch('/api/scanner/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrData: rawData,
          metodo,
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
          setErrorResult(data.error || 'Acceso rechazado por el sistema.');
          toast.error(data.error || 'Ingreso rechazado.');
        }
      }
    } catch (e) {
      setErrorResult('Error de red al intentar comunicarse con el servidor.');
      toast.error('Error de comunicación.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        cooldownRef.current = false;
        setCooldown(false);
        lastScannedRef.current = '';
      }, COOLDOWN_SECONDS * 1000);
    }
  };

  const onScanSuccess = async (decodedText: string, metodo: string = 'QR') => {
    if (cooldownRef.current) return;
    if (lastScannedRef.current === decodedText) return;

    cooldownRef.current = true;
    setCooldown(true);
    lastScannedRef.current = decodedText;
    
    await processScanData(decodedText, metodo);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Estación de Escaneo y Control de Ingresos"
        description="Escanee carnets estudiantiles en tiempo real mediante la cámara del dispositivo."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lado Izquierdo: Entrada del Escáner por Cámara */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 self-start">
              <Camera className="h-5 w-5 text-emerald-600" />
              Visor de Cámara
            </h2>

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
              <p className="text-sm font-semibold text-gray-500">Validando datos del estudiante y despachando alertas...</p>
            </div>
          )}

          {!loading && !scanResult && !errorResult && (
            <div className="bg-slate-50 border border-dashed border-gray-200 p-8 rounded-xl flex flex-col items-center justify-center h-full min-h-[360px] text-gray-400">
              <QrCode className="h-16 w-16 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">Esperando lectura de carnet estudiantil</p>
              <p className="text-xs text-gray-400 mt-1 text-center">Enfoque el código QR del carnet frente a la cámara.</p>
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
                    <h3 className="text-base font-bold text-gray-900">Ingreso Autorizado</h3>
                    <p className="text-xs text-emerald-600 font-semibold capitalize">Estado: {scanResult.status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <p className="text-gray-400 font-semibold mb-1">DATOS ESTUDIANTE</p>
                    <p className="text-sm font-bold text-gray-800">{scanResult.student.nombres} {scanResult.student.apellidos}</p>
                    <p className="text-gray-600">Código: {scanResult.student.codigoEstudiantil} • {scanResult.student.programaAcademico}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 font-semibold mb-1">DETALLE ACADÉMICO</p>
                    {scanResult.schedule ? (
                      <>
                        <p className="text-sm font-bold text-emerald-700">{scanResult.schedule.subject}</p>
                        <p className="text-gray-600">Docente: {scanResult.schedule.teacher} • Aula: {scanResult.schedule.aula || 'No asignada'}</p>
                      </>
                    ) : (
                      <p className="text-slate-500 font-medium">Ingreso sin clase programada en este horario.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Centro de Notificaciones Generadas */}
              {scanResult.notifications && scanResult.notifications.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <BellRing className="h-4.5 w-4.5 text-emerald-600" />
                    Notificaciones Instantáneas Disparadas
                  </h3>

                  <div className="space-y-3">
                    {scanResult.notifications.map((notif: any, i: number) => (
                      <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            notif.tipoDestinatario === 'acudiente' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {notif.tipoDestinatario}
                          </span>
                          
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            notif.estado === 'enviada'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {notif.estado === 'enviada' ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                Enviada (Telegram)
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 text-slate-500" />
                                Simulada / Registrada
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-gray-800 font-medium leading-relaxed">{notif.mensaje}</p>
                        <div className="flex justify-between items-center text-[10px] text-gray-500 border-t border-gray-100 pt-1.5">
                          <span>Destinatario: <span className="font-semibold text-gray-700">{notif.destinatario}</span></span>
                          {notif.estado === 'simulada' && (
                            <span className="text-amber-700 italic">Requiere Chat ID activo en Telegram</span>
                          )}
                        </div>
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

