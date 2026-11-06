import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isFullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  icon,
  className = '',
  disabled,
  ...rest
}) => {
  const classes = [
    'sf-btn',
    `sf-btn--${variant}`,
    `sf-btn--${size}`,
    isFullWidth ? 'sf-btn--full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled} {...rest}>
      {icon && <span className="sf-btn__icon" style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </button>
  );
};

