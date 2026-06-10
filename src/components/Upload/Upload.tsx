import { forwardRef, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Upload.css';

export type UploadStatus = 'default' | 'uploading' | 'uploaded' | 'upload-failed';

export interface UploadFileItem {
  /** Stable id for the item. */
  id: string;
  /** File name shown to the user. */
  name: string;
  /** Human-readable size, e.g. "2.4 MB". */
  size?: string;
  /** Current status. */
  status: UploadStatus;
  /** Progress 0–100 (used while `uploading`). */
  progress?: number;
  /** Error text shown when `upload-failed`. */
  error?: string;
}

export interface UploadProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Drop-zone title. */
  title?: string;
  /** Drop-zone supporting paragraph. */
  paragraph?: string;
  /** Browse-button label. */
  browseLabel?: string;
  /** Accepted file types (passed to the hidden input). */
  accept?: string;
  /** Allow selecting multiple files. */
  multiple?: boolean;
  /** Files to render as items below the drop zone. */
  files?: UploadFileItem[];
  /** Called with the FileList when files are dropped or chosen. */
  onFiles?: (files: FileList) => void;
  /** Called when an item's remove control is used. */
  onRemove?: (id: string) => void;
  /** Called when a failed item's retry control is used. */
  onRetry?: (id: string) => void;
  disabled?: boolean;
  /** Optional leading icon for the drop zone. */
  icon?: ReactNode;
}

const STATUS_LABEL: Record<UploadStatus, string> = {
  default: 'Ready',
  uploading: 'Uploading',
  uploaded: 'Uploaded',
  'upload-failed': 'Upload failed',
};

/**
 * Upload — drag-and-drop drop zone plus per-file items with progress and status.
 * Spec: references/components/upload.md (Upload token group).
 */
export const Upload = forwardRef<HTMLDivElement, UploadProps>(function Upload(
  {
    title = 'Drag and drop files here',
    paragraph = 'or browse to choose files',
    browseLabel = 'Browse files',
    accept,
    multiple = true,
    files = [],
    onFiles,
    onRemove,
    onRetry,
    disabled,
    icon,
    className,
    ...rest
  },
  ref,
) {
  const inputId = useId();
  const liveId = `${inputId}-live`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const emit = (list: FileList | null) => {
    if (list && list.length > 0) onFiles?.(list);
  };

  const zoneClasses = [
    'sds-upload__zone',
    dragOver && 'sds-upload__zone--hover',
    disabled && 'sds-upload__zone--disabled',
  ]
    .filter(Boolean)
    .join(' ');

  const classes = ['sds-upload', className].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} {...rest}>
      <div
        className={zoneClasses}
        role="group"
        aria-label={title}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragOver(false);
          emit(e.dataTransfer.files);
        }}
      >
        {icon && (
          <span className="sds-upload__zone-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <p className="sds-upload__title">{title}</p>
        <p className="sds-upload__paragraph">{paragraph}</p>
        <button
          type="button"
          className="sds-upload__browse"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {browseLabel}
        </button>
        <input
          ref={inputRef}
          id={inputId}
          className="sds-upload__input"
          type="file"
          aria-label={browseLabel}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => emit(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="sds-upload__list">
          {files.map((file) => (
            <li
              key={file.id}
              className={`sds-upload__item sds-upload__item--${file.status}`}
            >
              <span className="sds-upload__item-icon" aria-hidden="true">
                📄
              </span>
              <div className="sds-upload__item-body">
                <div className="sds-upload__item-line">
                  <span className="sds-upload__item-name">{file.name}</span>
                  {file.size && <span className="sds-upload__item-size">{file.size}</span>}
                </div>
                {file.status === 'uploading' && (
                  <div
                    className="sds-upload__progress"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={file.progress ?? 0}
                  >
                    <div
                      className="sds-upload__progress-bar"
                      style={{ width: `${file.progress ?? 0}%` }}
                    />
                  </div>
                )}
                {file.status === 'upload-failed' && file.error && (
                  <p className="sds-upload__item-error">{file.error}</p>
                )}
              </div>
              <span className={`sds-upload__status sds-upload__status--${file.status}`}>
                <span className="sds-upload__status-icon" aria-hidden="true">
                  {file.status === 'uploaded' && '✓'}
                  {file.status === 'upload-failed' && '!'}
                  {file.status === 'uploading' && '↑'}
                </span>
                <span className="sds-upload__status-text">{STATUS_LABEL[file.status]}</span>
              </span>
              {file.status === 'upload-failed' && (
                <button
                  type="button"
                  className="sds-upload__action"
                  aria-label={`Retry uploading ${file.name}`}
                  onClick={() => onRetry?.(file.id)}
                >
                  Retry
                </button>
              )}
              {onRemove && (
                <button
                  type="button"
                  className="sds-upload__action"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => onRemove(file.id)}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <span id={liveId} className="sds-upload__live" role="status" aria-live="polite">
        {files.map((f) => `${f.name}: ${STATUS_LABEL[f.status]}`).join('. ')}
      </span>
    </div>
  );
});
