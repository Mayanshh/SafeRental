import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, FileText } from "lucide-react";

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
  label = "Upload File",
  description = "Drag and drop or click to browse"
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError("");
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError(`Invalid file type. Accepted formats: ${accept}`);
      } else {
        setError("Invalid file");
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

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">{label}</label>
      
      {!selectedFile ? (
        <Card
          {...getRootProps()}
          className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          data-testid="file-upload-area"
        >
          <input {...getInputProps()} data-testid="file-input" />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">
            {isDragActive ? 'Drop the file here...' : description}
          </p>
          <p className="text-sm text-muted-foreground">
            Accepted formats: {accept} (Max {maxSize / (1024 * 1024)}MB)
          </p>
        </Card>
      ) : (
        <Card className="p-4" data-testid="file-selected">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium" data-testid="file-name">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              data-testid="button-remove-file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <p className="text-sm text-destructive" data-testid="file-error">
          {error}
        </p>
      )}
    </div>
  );
}
