import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Stepper.css';

export type StepperOrientation = 'horizontal' | 'vertical';

/** Explicit per-step status. When omitted, status is derived from `activeIndex`. */
export type StepStatus =
  | 'complete'
  | 'current'
  | 'upcoming'
  | 'error'
  | 'warning';

export interface Step {
  /** Step title. */
  title: ReactNode;
  /** Optional description shown under the title. */
  description?: ReactNode;
  /** Override the derived status (e.g. to flag an error or warning). */
  status?: StepStatus;
}

export interface StepperProps extends HTMLAttributes<HTMLOListElement> {
  /** The ordered steps (3–6 supported). */
  steps: Step[];
  /** Index of the current step. Earlier steps are complete, later are upcoming. */
  activeIndex: number;
  /** Layout direction. */
  orientation?: StepperOrientation;
}

/** Token status keys differ from the public StepStatus ('complete' -> 'finished', 'upcoming' -> 'waiting'). */
type TokenStatus = 'finished' | 'current' | 'waiting' | 'error' | 'warning';

function tokenStatus(status: StepStatus): TokenStatus {
  if (status === 'complete') return 'finished';
  if (status === 'upcoming') return 'waiting';
  return status;
}

function deriveStatus(index: number, activeIndex: number, override?: StepStatus): StepStatus {
  if (override) return override;
  if (index < activeIndex) return 'complete';
  if (index === activeIndex) return 'current';
  return 'upcoming';
}

/** Human-readable status label announced to assistive tech (status is not conveyed by colour alone). */
const STATUS_LABEL: Record<StepStatus, string> = {
  complete: 'Completed',
  current: 'Current step',
  upcoming: 'Upcoming',
  error: 'Error',
  warning: 'Warning',
};

/**
 * Stepper — guides users through a multi-step linear process.
 * Spec: references/components/stepper.md. 32px circular step icons; checkmark on complete.
 */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, activeIndex, orientation = 'horizontal', className, ...rest },
  ref,
) {
  const classes = ['sds-stepper', `sds-stepper--${orientation}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <ol ref={ref} className={classes} {...rest}>
      {steps.map((step, index) => {
        const status = deriveStatus(index, activeIndex, step.status);
        const tStatus = tokenStatus(status);
        const isLast = index === steps.length - 1;

        return (
          <li
            key={index}
            className={`sds-stepper__step sds-stepper__step--${tStatus}`}
            aria-current={status === 'current' ? 'step' : undefined}
          >
            <div className="sds-stepper__head">
              <span
                className={`sds-stepper__icon sds-stepper__icon--${tStatus}`}
                aria-hidden="true"
              >
                {tStatus === 'finished' ? (
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                    <path
                      d="M3 8.5l3 3 7-7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : tStatus === 'error' ? (
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                    <path
                      d="M4 4l8 8M12 4l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : tStatus === 'warning' ? (
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                    <path
                      d="M8 2l6 11H2L8 2z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
                  </svg>
                ) : (
                  <span className="sds-stepper__number">{index + 1}</span>
                )}
              </span>
              <span className="sds-stepper__status">{STATUS_LABEL[status]}: </span>
              <span className="sds-stepper__title">{step.title}</span>
              {!isLast && orientation === 'horizontal' && (
                <span className="sds-stepper__tail" aria-hidden="true">
                  <span className="sds-stepper__line" />
                </span>
              )}
            </div>

            {step.description && (
              <div className="sds-stepper__content">
                <span className="sds-stepper__description">{step.description}</span>
              </div>
            )}

            {!isLast && orientation === 'vertical' && (
              <span className="sds-stepper__connector" aria-hidden="true">
                <span className="sds-stepper__line" />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
});
