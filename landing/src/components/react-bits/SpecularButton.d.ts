import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

/** Types for the React Bits SpecularButton (JS + CSS variant), with our local `href` option. */
export interface SpecularButtonProps {
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  idleIntensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  glow?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  type?: "button" | "submit" | "reset";
  /** Renders a link instead of a button. */
  href?: string;
  style?: CSSProperties;
}

declare const SpecularButton: (props: SpecularButtonProps) => JSX.Element;
export default SpecularButton;
