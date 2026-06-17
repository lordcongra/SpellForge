import "./Button.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isFullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  isFullWidth = false,
  className = "",
  ...rest
}: ButtonProps) {
  const baseClass = "custom-button";
  const variantClass = `${baseClass}--${variant}`;
  const widthClass = isFullWidth ? `${baseClass}--full-width` : "";

  return (
    <button className={`${baseClass} ${variantClass} ${widthClass} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
