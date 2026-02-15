import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  description?: string;
}

export function FileUpload({
  onFileSelect,
  accept = ".jpg,.jpeg,.png,.pdf",
  maxSize = 5 * 1024 * 1024, // 5MB
  label = "SYSTEM UPLOAD",
  description = "INITIATE TRANSFER OR DRAG DATA HERE"
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError("");

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`ERR_SIZE_LIMIT_EXCEEDED: MAX ${maxSize / (1024 * 1024)}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError(`ERR_INVALID_FORMAT: EXPECTED [${accept}]`);
      } else {
        setError("ERR_UNKNOWN_UPLOAD_FAILURE");
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [accept, maxSize, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, ext) => {
      acc[`image/${ext.replace('.', '')}`] = [ext];
      acc[`application/${ext.replace('.', '')}`] = [ext];
      return acc;
    }, {} as any),
    maxSize,
    multiple: false
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError("");
  };

  return (
    <div className="w-full max-w-md font-mono">
      {/* Brutalist Label Block */}
      <div className="flex items-center justify-between mb-2 border-b-2 border-black pb-1">
        <label className="text-sm font-bold uppercase tracking-wider text-black">
          /// {label}
        </label>
        <span className="text-xs font-bold bg-black text-white px-2 py-0.5">
          V.1.0
        </span>
      </div>

      <div
        {...getRootProps()}
        className={`
          relative group cursor-pointer overflow-hidden
          border-4 border-black bg-white
          transition-all duration-200 ease-in-out
          ${error ? 'shadow-[8px_8px_0px_0px_#ef4444]' : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1'}
        `}
      >
        <input {...getInputProps()} />

        {/* Diagonal Stripe Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(135deg, #000 10%, transparent 10%, transparent 50%, #000 50%, #000 60%, transparent 60%, transparent 100%)', backgroundSize: '20px 20px' }} 
        />

        {!selectedFile ? (
          <div className={`
            p-10 text-center flex flex-col items-center justify-center min-h-[240px]
            ${isDragActive ? 'bg-[#ffde00]' : 'bg-white'}
            transition-colors duration-200
          `}>
            {/* Animated Icon Box */}
            <div className={`
              w-16 h-16 border-2 border-black mb-6 flex items-center justify-center bg-white
              ${isDragActive ? 'rotate-12 scale-110' : 'group-hover:rotate-3'}
              transition-transform duration-300
            `}>
              <Upload className="w-8 h-8 text-black" strokeWidth={2.5} />
            </div>

            <p className="text-lg font-black uppercase tracking-tight mb-2">
              {isDragActive ? "DROP_ZONE_ACTIVE" : "UPLOAD_TARGET"}
            </p>
            
            <p className="text-xs text-gray-600 uppercase max-w-[200px] leading-relaxed mb-6">
              {description}
            </p>

            {/* Technical Specs footer */}
            <div className="w-full border-t-2 border-black border-dashed pt-4 mt-auto flex justify-between text-[10px] text-gray-500 font-bold uppercase">
              <span>MAX: {maxSize / (1024 * 1024)}MB</span>
              <span>TYPE: {accept.replace(/\./g, '').toUpperCase()}</span>
            </div>
          </div>
        ) : (
          <div className="p-0 bg-blue-50 relative min-h-[240px] flex flex-col">
             {/* File Header */}
             <div className="bg-black text-white p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                  <span className="text-xs font-bold uppercase tracking-widest">STATUS: LOCKED</span>
                </div>
                <button 
                  onClick={removeFile}
                  className="bg-red-500 hover:bg-red-600 text-white border-l-2 border-black px-3 -my-3 h-[48px] flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
             </div>

             {/* File Details Grid */}
             <div className="flex-1 p-6 flex flex-col items-center justify-center">
                <FileText className="w-12 h-12 text-black mb-4" strokeWidth={1.5} />
                
                <div className="w-full space-y-3">
                  <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">FILENAME</p>
                    <p className="text-sm font-bold truncate">{selectedFile.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">SIZE</p>
                      <p className="text-sm font-bold">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">TYPE</p>
                      <p className="text-sm font-bold">{selectedFile.type.split('/')[1]?.toUpperCase() || 'UNK'}</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Error Message Module */}
      {error && (
        <div className="mt-4 border-2 border-red-500 bg-red-50 p-3 flex items-start gap-3 shadow-[4px_4px_0px_0px_#ef4444]">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-600 text-xs uppercase mb-1">System Alert</h4>
            <p className="text-xs font-medium text-red-800 uppercase">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}