import { forwardRef, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import {
  CircleCheckIcon,
  CircleExclamationIcon,
  DownloadIcon,
  FileLinesIcon,
  ReloadIcon,
  SpinnerIcon,
  TrashIcon,
  XmarkIcon,
} from './UploadIcons';
import './Upload.css';

/**
 * Item status. Maps to the Figma "File upload item" `Type`:
 * `default` = Default, `uploading` = Semi - Uploaded, `uploaded` = Uploaded,
 * `upload-failed` = Failed. Figma's Disabled type is the `disabled` flag.
 */
export type UploadStatus = 'default' | 'uploading' | 'uploaded' | 'upload-failed';

export interface UploadFileItem {
  /** Stable id for the item. */
  id: string;
  /** File name shown to the user (Paragraph - Regular). */
  name: string;
  /** Human-readable size, e.g. "2.4 MB" (Paragraph - Small). */
  size?: string;
  /** Current status. */
  status: UploadStatus;
  /**
   * Progress 0–100 shown in the item's progress bar. Defaults to 100 for `uploaded`
   * and 0 otherwise, as in the Figma variants.
   */
  progress?: number;
  /** Figma Type=Disabled: greyed item, disabled progress bar, no status, actions disabled. */
  disabled?: boolean;
}

/** Icon overrides for the built-in Font Awesome Duotone icons. */
export interface UploadIcons {
  /** Item file icon (Figma `Instance` swap, default `file-lines`). */
  file?: ReactNode;
  /** Uploading status icon (default `spinner`). */
  uploading?: ReactNode;
  /** Uploaded status icon (default `circle-check`). */
  uploaded?: ReactNode;
  /** Upload Failed status icon (default `circle-exclamation`). */
  failed?: ReactNode;
  /** Download action (default `download`). */
  download?: ReactNode;
  /** Cancel action (default `xmark`). */
  cancel?: ReactNode;
  /** Retry action (default `arrow-rotate-right`). */
  retry?: ReactNode;
  /** Remove action (default `trash`). */
  remove?: ReactNode;
}

export interface UploadProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Drop-zone title (H4). Figma default "Drop your files here". */
  title?: string;
  /**
   * Drop-zone supporting paragraph (Paragraph - Regular): the accepted formats and maximum size.
   * Figma default "File format: xls, ppt, pdf, doc, jpg. Maximum size: n MB".
   */
  paragraph?: string;
  /** Label of the Primary Button in the drop zone. Figma default "Upload". */
  browseLabel?: string;
  /** Accepted file types (passed to the hidden input). */
  accept?: string;
  /** Allow selecting multiple files. */
  multiple?: boolean;
  /** Files to render as items below the drop zone. */
  files?: UploadFileItem[];
  /** Called with the FileList when files are dropped or chosen. */
  onFiles?: (files: FileList) => void;
  /** Figma `Show Trash`: renders a trash Icon button on every item. */
  onRemove?: (id: string) => void;
  /** Figma `Show Reload`: the reload Icon button rendered on `upload-failed` items. */
  onRetry?: (id: string) => void;
  /** Figma `Show Download`: renders a download Icon button on `uploaded` items. */
  onDownload?: (id: string) => void;
  /** Figma `Show X`: renders a cancel (xmark) Icon button on `uploading` items. */
  onCancel?: (id: string) => void;
  /** Disables the drop zone (Figma Drop file Type=Disabled) and renders every item as disabled. */
  disabled?: boolean;
  /** Override the built-in item / status / action icons. */
  icons?: UploadIcons;
}

const STATUS_LABEL: Record<UploadStatus, string> = {
  default: 'Ready',
  uploading: 'Uploading',
  uploaded: 'Uploaded',
  'upload-failed': 'Upload Failed',
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/**
 * Upload — drag-and-drop drop zone plus per-file items with progress and status.
 *
 * Figma: page 93:75. Composition (frame 1373:35803): drop zone and items stacked, gap 20px.
 *
 * "Drop file" set 1326:33366 (Default / Hover / Disabled):
 * - Column, padding 24px 20px, gap 20px, centred, radius 8px, 1px inside dashed stroke (dash 2, gap 2).
 * - Text block gap 8px: title H4, paragraph Paragraph - Regular, both centred.
 * - CTA: Button Variant=Primary ("Upload"); State=Disabled when the zone is disabled.
 * - Tokens: `Upload/Drop File/default-*`, `hover-*` (while dragging over), `Disabled/*` (title and
 *   paragraph in `Disabled/text`).
 *
 * "File upload item" set 1353:1221 (Default / Semi - Uploaded / Uploaded / Failed / Disabled):
 * - Column, padding 8px, gap 4px, radius 8px, 1px inside stroke, per-state `Upload/Upload Item/*`.
 * - Row (space-between, gap 4px): 32px box with a 20px `file-lines` icon; name (Paragraph - Regular)
 *   + size (Paragraph - Small), gap 8px; status (padding-left 16px, padding-right 8px, gap 4px):
 *   20px icon + Paragraph - Small text ("Uploading", "Uploaded", "Upload Failed"; none for Default).
 * - Action slots: Icon button Variant=Tertiary — Download, X, Reload, Trash (off unless a handler is passed).
 * - Progress bar nested in every state: padding 0 8px, gap 12px, % label on both sides
 *   (Paragraph - Regular), 8px track radius 4px with `Progress Bar/primary-*` tokens;
 *   Failed and Disabled use the Disabled progress type (`Disabled/background`, `Disabled/icon`, `Disabled/text`).
 * - Disabled: `Disabled/background` + `Disabled/stroke`, icon `Disabled/icon`, text `Disabled/text`.
 *
 * The keyboard focus rings are not designed in Figma; they are kept for accessibility.
 */
export const Upload = forwardRef<HTMLDivElement, UploadProps>(function Upload(
  {
    title = 'Drop your files here',
    paragraph = 'File format: xls, ppt, pdf, doc, jpg. Maximum size: n MB',
    browseLabel = 'Upload',
    accept,
    multiple = true,
    files = [],
    onFiles,
    onRemove,
    onRetry,
    onDownload,
    onCancel,
    disabled,
    icons = {},
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
    dragOver && !disabled && 'sds-upload__zone--hover',
    disabled && 'sds-upload__zone--disabled',
  ]
    .filter(Boolean)
    .join(' ');

  const classes = ['sds-upload', className].filter(Boolean).join(' ');

  const statusIcon = (status: UploadStatus): ReactNode => {
    if (status === 'uploading') return icons.uploading ?? <SpinnerIcon />;
    if (status === 'uploaded') return icons.uploaded ?? <CircleCheckIcon />;
    if (status === 'upload-failed') return icons.failed ?? <CircleExclamationIcon />;
    return null;
  };

  return (
    <div ref={ref} className={classes} {...rest}>
      <div
        className={zoneClasses}
        role="group"
        aria-label={title}
        aria-disabled={disabled || undefined}
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
        {/* Dashed 1px inside stroke with Figma's exact 2/2 dash pattern (CSS `dashed` can't set it). */}
        <svg className="sds-upload__zone-border" aria-hidden="true" focusable="false">
          <rect className="sds-upload__zone-border-rect" width="100%" height="100%" rx="7.5" ry="7.5" />
        </svg>
        <div className="sds-upload__text">
          <p className="sds-upload__title">{title}</p>
          {paragraph && <p className="sds-upload__paragraph">{paragraph}</p>}
        </div>
        <Button
          variant="primary"
          className="sds-upload__browse"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {browseLabel}
        </Button>
        <input
          ref={inputRef}
          id={inputId}
          className="sds-upload__input"
          type="file"
          aria-label={browseLabel}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          tabIndex={-1}
          onChange={(e) => emit(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="sds-upload__list">
          {files.map((file) => {
            const itemDisabled = Boolean(disabled || file.disabled);
            const progress = clamp(file.progress ?? (file.status === 'uploaded' ? 100 : 0));
            const progressDisabled = itemDisabled || file.status === 'upload-failed';
            const showStatus = !itemDisabled && file.status !== 'default';
            const itemClasses = [
              'sds-upload__item',
              `sds-upload__item--${file.status}`,
              itemDisabled && 'sds-upload__item--disabled',
            ]
              .filter(Boolean)
              .join(' ');
            const showDownload = Boolean(onDownload) && file.status === 'uploaded';
            const showCancel = Boolean(onCancel) && file.status === 'uploading';
            const showRetry = file.status === 'upload-failed';
            const showRemove = Boolean(onRemove);
            const hasActions = showDownload || showCancel || showRetry || showRemove;

            return (
              <li key={file.id} className={itemClasses} aria-disabled={itemDisabled || undefined}>
                <div className="sds-upload__item-row">
                  <div className="sds-upload__item-main">
                    <span className="sds-upload__item-icon" aria-hidden="true">
                      {icons.file ?? <FileLinesIcon />}
                    </span>
                    <div className="sds-upload__item-line">
                      <span className="sds-upload__item-name">{file.name}</span>
                      {file.size && <span className="sds-upload__item-size">{file.size}</span>}
                    </div>
                    {showStatus && (
                      <span className={`sds-upload__status sds-upload__status--${file.status}`}>
                        <span className="sds-upload__status-icon" aria-hidden="true">
                          {statusIcon(file.status)}
                        </span>
                        <span className="sds-upload__status-text">{STATUS_LABEL[file.status]}</span>
                      </span>
                    )}
                  </div>
                  {hasActions && (
                    <div className="sds-upload__actions">
                      {showDownload && (
                        <IconButton
                          variant="tertiary"
                          icon={icons.download ?? <DownloadIcon />}
                          aria-label={`Download ${file.name}`}
                          disabled={itemDisabled}
                          onClick={() => onDownload?.(file.id)}
                        />
                      )}
                      {showCancel && (
                        <IconButton
                          variant="tertiary"
                          icon={icons.cancel ?? <XmarkIcon />}
                          aria-label={`Cancel uploading ${file.name}`}
                          disabled={itemDisabled}
                          onClick={() => onCancel?.(file.id)}
                        />
                      )}
                      {showRetry && (
                        <IconButton
                          variant="tertiary"
                          icon={icons.retry ?? <ReloadIcon />}
                          aria-label={`Retry uploading ${file.name}`}
                          disabled={itemDisabled}
                          onClick={() => onRetry?.(file.id)}
                        />
                      )}
                      {showRemove && (
                        <IconButton
                          variant="tertiary"
                          icon={icons.remove ?? <TrashIcon />}
                          aria-label={`Remove ${file.name}`}
                          disabled={itemDisabled}
                          onClick={() => onRemove?.(file.id)}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={[
                    'sds-upload__progress',
                    progressDisabled && 'sds-upload__progress--disabled',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="sds-upload__progress-label" aria-hidden="true">
                    {`${Math.round(progress)}%`}
                  </span>
                  <div
                    className="sds-upload__progress-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress)}
                    aria-label={`${file.name} upload progress`}
                  >
                    <div className="sds-upload__progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="sds-upload__progress-label" aria-hidden="true">
                    {`${Math.round(progress)}%`}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <span id={liveId} className="sds-upload__live" role="status" aria-live="polite">
        {files.map((f) => `${f.name}: ${STATUS_LABEL[f.status]}`).join('. ')}
      </span>
    </div>
  );
});
