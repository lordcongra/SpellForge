import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { clampNumber, stepNumber } from './numberSpinnerUtils';
import './NumberSpinner.css';

export interface NumberSpinnerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export const NumberSpinner: React.FC<NumberSpinnerProps> = ({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  unit,
  disabled = false,
  label,
  className = '',
  id,
  'aria-label': ariaLabel,
}) => {
  const [prevValue, setPrevValue] = useState<number>(value);
  const [inputValue, setInputValue] = useState<string>(String(value ?? 0));

  if (prevValue !== value) {
    setPrevValue(value);
    setInputValue(String(value ?? 0));
  }

  const handleDecrement = () => {
    if (disabled) return;
    const next = stepNumber(value, -step, min, max);
    onChange(next);
  };

  const handleIncrement = () => {
    if (disabled) return;
    const next = stepNumber(value, step, min, max);
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      onChange(clampNumber(parsed, min, max));
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      setInputValue(String(value));
    } else {
      const clamped = clampNumber(parsed, min, max);
      setInputValue(String(clamped));
      onChange(clamped);
    }
  };

  const isMin = min !== undefined && value <= min;
  const isMax = max !== undefined && value >= max;

  return (
    <div className={`sf-number-spinner-container ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="sf-number-spinner__label">
          {label}
        </label>
      )}
      <div className={`sf-number-spinner ${disabled ? 'sf-number-spinner--disabled' : ''}`}>
        <button
          type="button"
          className="sf-number-spinner__btn sf-number-spinner__btn--decrement"
          onClick={handleDecrement}
          disabled={disabled || isMin}
          aria-label={label ? `Decrease ${label}` : 'Decrement value'}
          title="Decrease"
        >
          <Minus size={13} />
        </button>

        <div className="sf-number-spinner__input-wrap">
          <input
            id={id}
            type="number"
            className="sf-number-spinner__input"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            min={min === -Infinity ? undefined : min}
            max={max === Infinity ? undefined : max}
            step={step}
            disabled={disabled}
            aria-label={ariaLabel ?? label ?? 'Numeric value'}
            aria-valuenow={value}
            aria-valuemin={min === -Infinity ? undefined : min}
            aria-valuemax={max === Infinity ? undefined : max}
          />
          {unit && <span className="sf-number-spinner__unit">{unit}</span>}
        </div>

        <button
          type="button"
          className="sf-number-spinner__btn sf-number-spinner__btn--increment"
          onClick={handleIncrement}
          disabled={disabled || isMax}
          aria-label={label ? `Increase ${label}` : 'Increment value'}
          title="Increase"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
};
