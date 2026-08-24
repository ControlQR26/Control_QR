"use client";

import { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Camera, QrCode, BellRing, UserCheck, XCircle, RefreshCw, Upload, Keyboard, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ScannerPage() {
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorResult, setErrorResult] = useState<string | null>(null);

  // Cámara activa y ref del scanner
  const [cameraActive, setCameraActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'camera' | 'manual' | 'file'>('camera');
  const [manualCode, setManualCode] = useState('');
  const html5QrCodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    if (cameraActive && activeTab === 'camera') {
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
              onScanSuccess(decodedText, 'QR_Camara');
            },
            (errorMessage) => {
              // Fails silently for continuous scanning logs
            }
          );
          
          toast.success('Lector de cámara web activo');
        } catch (err) {
          console.error("No se pudo iniciar el escaneo: ", err);
          toast.error('Error de acceso a la cámara. Verifique permisos o use la entrada manual/archivo.');
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
  }, [cameraActive, activeTab]);

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

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.warning('Ingrese el código o documento del estudiante');
      return;
    }
    await processScanData(manualCode.trim(), 'Manual_Codigo');
    setManualCode('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode("file-qr-reader-hidden");
      const decodedText = await html5QrCode.scanFile(file, true);
      toast.success('Código QR detectado en la imagen');
      await processScanData(decodedText, 'Archivo_Foto');
    } catch (err: any) {
      toast.error('No se detectó ningún código QR en la imagen seleccionada.');
      setErrorResult('No fue posible leer un código QR en la imagen cargada.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Estación de Escaneo y Control de Ingresos"
        description="Escanee carnets estudiantiles en tiempo real mediante cámara, lector físico o ingreso manual."
      />

      {/* Selector de modo de captura */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => { setActiveTab('camera'); setCameraActive(true); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'camera' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Camera className="h-4 w-4" />
          Cámara Web / Celular
        </button>
        <button
          onClick={() => { setActiveTab('manual'); stopCamera(); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'manual' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Keyboard className="h-4 w-4" />
          Ingreso Manual / Lector USB
        </button>
        <button
          onClick={() => { setActiveTab('file'); stopCamera(); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'file' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Upload className="h-4 w-4" />
          Subir Foto de Carnet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lado Izquierdo: Entrada del Escáner */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* MODO 1: CÁMARA */}
          {activeTab === 'camera' && (
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
          )}

          {/* MODO 2: MANUAL / LECTOR DE CÓDIGO DE BARRAS */}
          {activeTab === 'manual' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-emerald-600" />
                Ingreso por Código o Lector Físico
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Escriba el código estudiantil, número de documento o use una pistola lectora de código de barras / QR USB o Bluetooth conectada al dispositivo.
              </p>

              <form onSubmit={handleManualSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Código de Estudiante, Documento o ID
                  </label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ej: 00403 o 1029665014"
                    autoFocus
                    className="w-full text-base font-mono font-bold px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !manualCode.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="h-4 w-4" />
                  Validar Ingreso y Enviar Alertas
                </button>
              </form>
            </div>
          )}

          {/* MODO 3: ARCHIVO / FOTO */}
          {activeTab === 'file' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-600" />
                Subir Imagen de Carnet
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Seleccione una fotografía o captura de pantalla del carnet escolar guardada en este celular o computadora.
              </p>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 rounded-xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3"
              >
                <QrCode className="h-12 w-12 text-emerald-600" />
                <p className="text-sm font-bold text-gray-700">Haga clic aquí para seleccionar una foto</p>
                <p className="text-xs text-gray-500">Formatos soportados: JPG, PNG, WEBP</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div id="file-qr-reader-hidden" className="hidden"></div>
            </div>
          )}

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
              <p className="text-xs text-gray-400 mt-1 text-center">Enfoque el código QR frente a la cámara o use la entrada manual.</p>
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

