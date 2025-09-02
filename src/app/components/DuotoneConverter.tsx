'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { colord } from 'colord';
import { Upload, Download, Image as ImageIcon } from 'lucide-react';
import NextImage from 'next/image';

type RGB = { r: number; g: number; b: number };

export type DuotoneConverterProps = {
    shadowHex: string;
    highlightHex: string;
    maxSizeMB?: number;
    className?: string;
    onChange?: (dataUrl: string | null) => void;
    showUrlInput?: boolean;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const contrast = (t: number, c = 0.15) => clamp01((t - 0.5) * (1 + c) + 0.5);

function hexToRgb(hex: string): RGB {
    const c = colord(hex);
    if (!c.isValid()) throw new Error(`Warna tidak valid: ${hex}`);
    const { r, g, b } = c.toRgb();
    return { r, g, b };
}

function applyDuotoneToCanvas(
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    shadow: RGB,
    highlight: RGB
) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D tidak tersedia.');

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) throw new Error('Ukuran gambar tidak dikenali.');

    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h);
    const d = imageData.data;

    for (let i = 0; i < d.length; i += 4) {
        const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
        let L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        L = contrast(L, 0.15);

        d[i] = Math.round(lerp(shadow.r, highlight.r, L));
        d[i + 1] = Math.round(lerp(shadow.g, highlight.g, L));
        d[i + 2] = Math.round(lerp(shadow.b, highlight.b, L));
        // alpha tetap
    }

    ctx.putImageData(imageData, 0, 0);
}

export default function DuotoneConverter({
    shadowHex,
    highlightHex,
    maxSizeMB = 10,
    className,
    onChange,
    showUrlInput = true,
}: DuotoneConverterProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState('');
    const [hasImage, setHasImage] = useState(false);

    const currentBlobUrlRef = useRef<string | null>(null);

    const shadow = useMemo(() => hexToRgb(shadowHex), [shadowHex]);
    const highlight = useMemo(() => hexToRgb(highlightHex), [highlightHex]);

    const processImage = useCallback(
        (img: HTMLImageElement) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            applyDuotoneToCanvas(canvas, img, shadow, highlight);
            const url = canvas.toDataURL('image/png');
            setResultUrl(url);
            setHasImage(true);
            onChange?.(url);
        },
        [shadow, highlight, onChange]
    );

    const fromFile = useCallback(
        (file: File) => {
            if (!file.type.startsWith('image/')) {
                alert('Pilih file gambar yang valid.');
                return;
            }
            if (file.size > maxSizeMB * 1024 * 1024) {
                alert(`Maksimal ${maxSizeMB}MB.`);
                return;
            }

            setLoading(true);
            const img = new window.Image();
            const blobUrl = URL.createObjectURL(file);

            if (currentBlobUrlRef.current) {
                URL.revokeObjectURL(currentBlobUrlRef.current);
            }
            currentBlobUrlRef.current = blobUrl;

            img.onload = () => {
                requestAnimationFrame(() => {
                    processImage(img);
                    setLoading(false);
                });
            };
            img.onerror = () => {
                setLoading(false);
                alert('Gagal memuat gambar.');
            };
            img.src = blobUrl;
        },
        [maxSizeMB, processImage]
    );

    const fromUrl = useCallback(
        (url: string) => {
            try {
                new URL(url);
            } catch {
                return alert('URL tidak valid.');
            }
            setLoading(true);

            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                requestAnimationFrame(() => {
                    processImage(img);
                    setLoading(false);
                });
            };
            img.onerror = () => {
                setLoading(false);
                alert('Gagal memuat URL (CORS?). Coba unggah file.');
            };
            img.src = url;
        },
        [processImage]
    );

    const onDrop = useCallback(
        (accepted: File[]) => {
            const file = accepted?.[0];
            if (file) fromFile(file);
        },
        [fromFile]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'image/*': [] },
        maxSize: maxSizeMB * 1024 * 1024,
    });

    const handleDownload = () => {
        if (!resultUrl) return;
        const a = document.createElement('a');
        a.href = resultUrl;
        a.download = `BRAVE-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    useEffect(() => {
        return () => {
            if (currentBlobUrlRef.current) {
                URL.revokeObjectURL(currentBlobUrlRef.current);
            }
        };
    }, []);

    return (
        <section className={className}>
            {/* Upload area + PREVIEW HASIL */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden mb-8">
                <div className="p-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-emerald-600" />
                        Unggah Gambar
                    </h3>

                    <div
                        {...getRootProps()}
                        className={`relative border-2 border-dashed rounded-xl px-6 py-8 text-center transition-all cursor-pointer
              ${isDragActive ? 'border-emerald-400 bg-emerald-50/60' : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50'}`}
                    >
                        <input {...getInputProps()} aria-label="Unggah berkas gambar" />

                        {resultUrl ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-full h-80 rounded-lg overflow-hidden bg-white border border-gray-200">
                                    <NextImage
                                        src={resultUrl}
                                        alt="Hasil duotone hijau–pink"
                                        fill
                                        sizes="100vw"
                                        unoptimized
                                        className="object-contain bg-gray-50"
                                        draggable={false}
                                    />
                                </div>
                                <p className="text-gray-600">Klik untuk ganti gambar atau seret gambar baru ke sini</p>
                                <p className="text-sm text-gray-500">PNG, JPG, GIF hingga {maxSizeMB}MB</p>
                            </div>
                        ) : (
                            <>
                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">
                                    {isDragActive ? 'Lepaskan untuk mengunggah' : 'Klik untuk unggah atau drag & drop'}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF hingga {maxSizeMB}MB</p>
                            </>
                        )}
                    </div>

                    {showUrlInput && (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-sm text-gray-500 px-3">atau dari URL</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://contoh.com/gambar.jpg"
                                    className="text-gray-700 flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && fromUrl(urlInput)}
                                />
                                <button
                                    type="button"
                                    onClick={() => fromUrl(urlInput)}
                                    disabled={loading || !urlInput.trim()}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 font-medium"
                                >
                                    Muat
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="border-t border-gray-200 bg-gray-50 px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-gray-600">Memproses gambar…</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Hasil + Canvas */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Hasil</h3>
                        <button
                            onClick={handleDownload}
                            disabled={!resultUrl || loading}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 font-medium shadow-lg"
                        >
                            <Download className="w-4 h-4" />
                            Unduh PNG
                        </button>
                    </div>

                    <div className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 'auto' }} />
                        {!hasImage && !loading && (
                            <div className="absolute inset-0 grid place-items-center text-gray-500 text-sm">
                                Belum ada gambar — unggah di atas.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
