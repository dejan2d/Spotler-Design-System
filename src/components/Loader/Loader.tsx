import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './Loader.css';

/** Figma `Style`: `Dots` → `dots` (inline loader), `Logo` → `logo` (full-screen loader). */
export type LoaderVariant = 'dots' | 'logo';
/** Figma `Color` (Dots only — the Logo style exists in Blue only). */
export type LoaderColor = 'blue' | 'grey';
/** Figma `Size` for Style=Dots: xs 20px, sm 32px, md 48px, lg 68px. */
export type LoaderDotsSize = 'xs' | 'sm' | 'md' | 'lg';
/** Figma `Size` for Style=Logo: sm 50px, md 75px, lg 100px (no xs in Figma). */
export type LoaderLogoSize = 'sm' | 'md' | 'lg';

interface LoaderBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color' | 'role'> {
  /**
   * Supporting text (Figma `Supporting Text`, default "Loading..."), text style
   * Paragraph - Regular, centered under the loader. Make it contextual, e.g.
   * "Loading campaign results". It is also the accessible label: when `showText` is
   * false it is still rendered, visually hidden, inside the status region.
   * @default 'Loading...'
   */
  text?: string;
  /**
   * Show the supporting text (Figma `Show Text`).
   * @default true
   */
  showText?: boolean;
}

export interface LoaderDotsProps extends LoaderBaseProps {
  /** Inline loader (Figma Style=Dots) — for a section that is loading (widget, chart, table). @default 'dots' */
  variant?: 'dots';
  /** @default 'xs' */
  size?: LoaderDotsSize;
  /** Figma `Color`. @default 'blue' */
  color?: LoaderColor;
}

export interface LoaderLogoProps extends LoaderBaseProps {
  /** Full-screen loader (Figma Style=Logo) — only when the whole page is unavailable. */
  variant: 'logo';
  /** @default 'sm' */
  size?: LoaderLogoSize;
  /** The Logo style exists in Blue only. @default 'blue' */
  color?: 'blue';
}

export type LoaderProps = LoaderDotsProps | LoaderLogoProps;

/**
 * Dot geometry of the Figma 20×20 "Loader Small" frame (Style=Dots, Size=xs); the larger
 * sizes are the same drawing scaled (dot = 15% and orbit radius = 32.5% of the frame).
 * Eight 3px dots; the top, top-left and left dots use the dark-dots token.
 */
const DOTS: ReadonlyArray<{ cx: number; cy: number; dark: boolean }> = [
  { cx: 10, cy: 3.5, dark: true },
  { cx: 14.596, cy: 5.404, dark: false },
  { cx: 16.5, cy: 10, dark: false },
  { cx: 14.596, cy: 14.596, dark: false },
  { cx: 10, cy: 16.5, dark: false },
  { cx: 5.404, cy: 14.596, dark: false },
  { cx: 3.5, cy: 10, dark: true },
  { cx: 5.404, cy: 5.404, dark: true },
];

/**
 * Loader — Spotler Design System (Figma "Loader", set 2268:70935, page "Loader" 29:14).
 *
 * An indeterminate indicator for a task of unknown duration. Use a Progress Bar when the
 * duration is known and a Skeleton when the content structure is predictable.
 *
 * Figma spec: content column, items centered — loader graphic above the supporting text
 * (Paragraph - Regular, centered).
 * - Dots (default; e.g. xs Blue 2268:71353): 8 dots on a circle, gap 8px (Spacing/S-8).
 *   Sizes xs 20, sm 32, md 48, lg 68px. Colours Loader/<color>-dark-dots,
 *   Loader/<color>-light-dots, text Loader/<color>-text.
 * - Logo (e.g. sm 2268:71289): the Spotler logo mark (vector copied from Figma), Blue only,
 *   sizes sm 50, md 75, lg 100px, gap 16px, fill Loader/blue-dark-dots. Figma binds the
 *   Logo text to Loader/grey-text, mirrored here.
 * - Animation: Figma's Load 1 → 4 frames each turn the graphic 90° clockwise, chained with
 *   Smart Animate, ease-out, 240ms per step (Dots) / 320ms (Logo), Load 4 looping back to
 *   Load 1. Reproduced as a CSS keyframe loop; stopped under `prefers-reduced-motion`.
 *
 * The Figma component frame is a fixed 512px stage that centres the content; here the root
 * is a flex column that centres the content in whatever container it is placed in.
 *
 * Accessibility: `role="status"` (polite live region). The supporting `text` is the
 * accessible label — visible, or visually hidden when `showText` is false. The graphic
 * is decorative (aria-hidden).
 */
export const Loader = forwardRef<HTMLDivElement, LoaderProps>(function Loader(
  { variant = 'dots', size, color = 'blue', text = 'Loading...', showText = true, className, ...rest },
  ref,
) {
  const resolvedSize = size ?? (variant === 'logo' ? 'sm' : 'xs');

  const classes = [
    'sds-loader',
    `sds-loader--${variant}`,
    `sds-loader--${resolvedSize}`,
    `sds-loader--${color}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} role="status" className={classes} {...rest}>
      {variant === 'logo' ? (
        <svg
          className="sds-loader__graphic"
          viewBox="0 0 50 50"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          {/* Spotler logo mark — vector paths copied from Figma "Logo Spotler" (2268:71291). */}
          <path d="M 14 0 L 0.8130179635038107 0 C 0.36374337070114066 0.0002603047324971181 -0.0002596725623325714 0.36413332949730964 1.389961747627072e-7 0.8127315266133749 L 1.389961747627072e-7 14 C 2.7212471915322967 7.7304780103482305 7.725139278087963 2.7265726820641554 14 0 Z" />
          <path d="M 24.99991798400879 0 C 11.192825317382812 0 1.411317356314612e-7 11.19279576310202 1.411317356314612e-7 24.999919500165024 C 1.411317356314612e-7 38.80704323722803 11.19283390045166 49.99999999999999 24.99991798400879 49.99999999999999 C 38.80700206756592 49.99999999999999 50 38.8070470705535 50 25.000726415177514 C 50 11.194405759801525 38.807172775268555 0 24.99991798400879 0 Z M 25.178678512573242 38.21344799576494 C 17.968666076660156 38.22435275107946 12.114953674376011 32.39713654420341 12.10403060913086 25.198004677423743 C 12.093107543885708 17.99887281064407 17.92913246154785 12.153981809150116 25.139144897460938 12.143079065021249 C 32.34915733337402 12.132176320892382 38.20288012456149 17.959388599920036 38.21379470825195 25.15852717501929 C 38.213803189239115 25.165098089629158 38.21381759643555 25.171670642012355 38.21381759643555 25.178245801262772 C 38.219334478955716 32.371888825127904 32.38319158554077 38.20794657849466 25.178678512573242 38.21344799576494 Z" />
        </svg>
      ) : (
        <svg className="sds-loader__graphic" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          {DOTS.map((dot, i) => (
            <circle
              key={i}
              className={dot.dark ? 'sds-loader__dot sds-loader__dot--dark' : 'sds-loader__dot'}
              cx={dot.cx}
              cy={dot.cy}
              r={1.5}
            />
          ))}
        </svg>
      )}
      <span className={showText ? 'sds-loader__text' : 'sds-loader__text sds-loader__text--hidden'}>
        {text}
      </span>
    </div>
  );
});
