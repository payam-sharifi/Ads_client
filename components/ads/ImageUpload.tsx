'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useI18n } from '@/lib/contexts/I18nContext';

export interface ImageUploadProps {
  /** Selected files (before upload) */
  files: File[];
  /** Callback when files change - accepts new array or updater function (like useState) */
  onFilesChange: React.Dispatch<React.SetStateAction<File[]>>;
  /** Maximum number of images allowed */
  maxFiles?: number;
  /** Whether the upload area is disabled */
  disabled?: boolean;
  /** Accepted file types */
  accept?: Record<string, string[]>;
}

/**
 * ImageUpload Component
 *
 * Allows users to:
 * - Select images from local device (drag & drop or click)
 * - Display preview of selected images
 * - Remove images before upload
 *
 * Upload to backend is handled by the parent (e.g. useUploadImage hook).
 * Images are compressed and converted to WebP on the backend (R2).
 */
export default function ImageUpload({
  files,
  onFilesChange,
  maxFiles = 3,
  disabled = false,
  accept = { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
}: ImageUploadProps) {
  const { isRTL } = useI18n();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesChange((prev) => {
        const total = prev.length + acceptedFiles.length;
        if (total > maxFiles) {
          const remaining = maxFiles - prev.length;
          return remaining > 0 ? [...prev, ...acceptedFiles.slice(0, remaining)] : prev;
        }
        return [...prev, ...acceptedFiles];
      });
    },
    [maxFiles, onFilesChange],
  );

  const removeImage = useCallback(
    (index: number) => {
      onFilesChange((prev) => prev.filter((_, i) => i !== index));
    },
    [onFilesChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: true,
    noClick: false,
    noKeyboard: false,
    disabled: disabled || files.length >= maxFiles,
  });

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">
        {isRTL ? 'تصاویر' : 'Images'}{' '}
        <span className="text-gray-500 text-xs ml-2">
          ({isRTL ? `حداکثر ${maxFiles} عکس` : `Max ${maxFiles} images`}: {files.length}/{maxFiles})
        </span>
      </label>
      <div
        {...getRootProps({
          onClick: (e) => {
            if (files.length >= maxFiles) {
              e.preventDefault();
              e.stopPropagation();
            }
          },
        })}
        className={`border-2 border-dashed rounded-lg p-4 md:p-6 text-center cursor-pointer transition-colors touch-manipulation relative ${
          files.length >= maxFiles
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
            : isDragActive
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400 active:bg-gray-50'
        }`}
        style={{ WebkitTapHighlightColor: 'transparent', minHeight: '60px' }}
      >
        <input
          {...getInputProps({
            disabled: files.length >= maxFiles,
            onClick: (e) => e.stopPropagation(),
            style: {
              display: 'block',
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 0,
              cursor: 'pointer',
              zIndex: 10,
              pointerEvents: 'auto',
            },
          })}
        />
        <p className="text-gray-600 pointer-events-none text-sm">
          {files.length >= maxFiles
            ? (isRTL ? `حداکثر ${maxFiles} عکس آپلود شده است` : `Maximum ${maxFiles} images uploaded`)
            : isDragActive
              ? (isRTL ? 'تصاویر را اینجا رها کنید' : 'Drop images here')
              : (isRTL ? 'تصاویر را بکشید و رها کنید یا کلیک کنید' : 'Drag and drop images or click to select')}
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative group">
              <div className="relative h-20 md:h-24 w-full rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm hover:bg-red-700"
                aria-label={isRTL ? 'حذف تصویر' : 'Remove image'}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
