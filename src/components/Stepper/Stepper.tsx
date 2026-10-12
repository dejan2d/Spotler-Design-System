import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Stepper.css';

export type StepperOrientation = 'horizontal' | 'vertical';

/**
 * Explicit per-step status, named as in Figma (Stepper/Steps/Horizontal and
 * Stepper/Step/Vertical `Status`). When omitted, status is derived from `activeIndex`.
 *
 * `warning` exists only on the vertical step in Figma; in a horizontal stepper it
 * is ignored and the step falls back to its derived status.
 * (Figma's `Hovered` status is the hover/focus state of a clickable step — see
 * `onStepClick` — not a status you set.)
 */
export type StepStatus = 'finished' | 'in-progress' | 'waiting' | 'error' | 'warning';

export interface Step {
  /** Step title. Paragraph - Regular; the in-progress step is Paragraph - Semi Bold. */
  title: ReactNode;
  /** Optional description under the title (Figma "Subtext"). Paragraph - Small. */
  description?: ReactNode;
  /** Override the derived status (e.g. to flag an error or warning). */
  status?: StepStatus;
  /**
   * Makes this step clickable (requires `onStepClick`). Defaults to `true` for
   * finished steps and `false` otherwise — Figma's `Hovered` state is a finished
   * step under the pointer. Set it on every step once the whole task is complete.
   */
  clickable?: boolean;
}

export interface StepperProps extends HTMLAttributes<HTMLOListElement> {
  /** The ordered steps (Figma "Number of steps": 3–6). */
  steps: Step[];
  /** Index of the current step. Earlier steps are finished, later are waiting. */
  activeIndex: number;
  /** Layout direction (Figma "Direction"). @default 'vertical' */
  orientation?: StepperOrientation;
  /**
   * Called with the step index when a clickable step is activated. When set,
   * clickable steps render as buttons with the Figma `Hovered` state on
   * hover/focus (grey filled icon, white glyph, blue line).
   */
  onStepClick?: (index: number) => void;
}

/** Token status keys used by the CSS (Figma variable names: finished / current / waiting / error / warning). */
type TokenStatus = 'finished' | 'current' | 'waiting' | 'error' | 'warning';

function tokenStatus(status: StepStatus): TokenStatus {
  return status === 'in-progress' ? 'current' : status;
}

function deriveStatus(
  index: number,
  activeIndex: number,
  orientation: StepperOrientation,
  override?: StepStatus,
): StepStatus {
  // Figma has no horizontal Warning step: ignore that override horizontally.
  if (override && !(override === 'warning' && orientation === 'horizontal')) return override;
  if (index < activeIndex) return 'finished';
  if (index === activeIndex) return 'in-progress';
  return 'waiting';
}

/** Human-readable status label announced to assistive tech (status is not conveyed by colour alone). */
const STATUS_LABEL: Record<TokenStatus, string> = {
  finished: 'Completed',
  current: 'Current step',
  waiting: 'Upcoming',
  error: 'Error',
  warning: 'Warning',
};

/**
 * Stepper — guides users through a multi-step linear process.
 *
 * Figma (page "Stepper": Stepper/Icon 823:6412, Stepper/Steps/Horizontal 823:6434,
 * Stepper/Step/Vertical 823:6467, Stepper 823:6513):
 * - Icon: 32×32 circle, 1px stroke, 20×20 glyph — check (finished), number
 *   (in progress / waiting), xmark (error), triangle-exclamation (warning: orange
 *   Warning Main triangle with a Gray-1000 mark).
 * - Horizontal: steps 16px apart; head gap 8px; tail line fills the rest of the
 *   row (8px left padding); description indented 40px.
 * - Vertical: steps stacked (60px each); head gap 16px; a 28px row below holds
 *   the connector line (under the icon centre) and the description at 48px.
 * - Hovered (clickable steps only): Stepper/Icon/hovered-*, line-hovered,
 *   help-text-hovered.
 * - Warning (vertical only) title uses text-default; only the icon is orange.
 * - Default direction is vertical, as in Figma.
 */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, activeIndex, orientation = 'vertical', onStepClick, className, ...rest },
  ref,
) {
  const classes = ['sds-stepper', `sds-stepper--${orientation}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <ol ref={ref} className={classes} {...rest}>
      {steps.map((step, index) => {
        const status = deriveStatus(index, activeIndex, orientation, step.status);
        const tStatus = tokenStatus(status);
        const isLast = index === steps.length - 1;
        const clickable =
          onStepClick !== undefined && (step.clickable ?? tStatus === 'finished');

        const headContent = (
          <>
            <span
              className={`sds-stepper__icon sds-stepper__icon--${tStatus}`}
              aria-hidden="true"
            >
              {tStatus === 'finished' ? (
                <svg viewBox="0 0 16 16" width="20" height="20" fill="none">
                  <path
                    d="M3 8.5l3 3 7-7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : tStatus === 'error' ? (
                <svg viewBox="0 0 16 16" width="20" height="20" fill="none">
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : tStatus === 'warning' ? (
                <svg viewBox="0 0 16 16" width="20" height="20" fill="none">
                  {/* Two-tone, per Figma Stepper/Icon Status=Warning:
                      triangle = Semantic/Orange - Warning/Warning Main, mark = Stepper/Icon/warning-icon. */}
                  <path
                    className="sds-stepper__warning-triangle"
                    d="M8 1.5l7 12.5H1L8 1.5z"
                    strokeLinejoin="round"
                  />
                  <path
                    className="sds-stepper__warning-mark"
                    d="M8 6v3.5"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle className="sds-stepper__warning-dot" cx="8" cy="11.75" r="0.85" />
                </svg>
              ) : (
                <span className="sds-stepper__number">{index + 1}</span>
              )}
            </span>
            <span className="sds-stepper__status">{STATUS_LABEL[tStatus]}: </span>
            <span className="sds-stepper__title">{step.title}</span>
            {!isLast && orientation === 'horizontal' && (
              <span className="sds-stepper__tail" aria-hidden="true">
                <span className="sds-stepper__line" />
              </span>
            )}
          </>
        );

        return (
          <li
            key={index}
            className={[
              'sds-stepper__step',
              `sds-stepper__step--${tStatus}`,
              clickable && 'sds-stepper__step--clickable',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-current={tStatus === 'current' ? 'step' : undefined}
          >
            {clickable ? (
              <button
                type="button"
                className="sds-stepper__head sds-stepper__head--button"
                onClick={() => onStepClick?.(index)}
              >
                {headContent}
              </button>
            ) : (
              <div className="sds-stepper__head">{headContent}</div>
            )}

            {orientation === 'vertical' ? (
              // Figma vertical "content" row (28px): connector under the icon centre,
              // then the description 32px further right (x = 48px).
              <div className="sds-stepper__content">
                <span className="sds-stepper__connector" aria-hidden="true">
                  {!isLast && <span className="sds-stepper__line" />}
                </span>
                {step.description && (
                  <span className="sds-stepper__description">{step.description}</span>
                )}
              </div>
            ) : (
              step.description && (
                <div className="sds-stepper__content">
                  <span className="sds-stepper__description">{step.description}</span>
                </div>
              )
            )}
          </li>
        );
      })}
    </ol>
  );
});
