import React from 'react';
import { motion } from 'framer-motion';

type CheckboxShape = 'square' | 'circle';
type CheckboxSize = 'sm' | 'md';

interface TopicalCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: () => void;
  disabled?: boolean;
  shape?: CheckboxShape;
  size?: CheckboxSize;
  className?: string;
  'aria-label'?: string;
}

const sizeStyles: Record<
  CheckboxSize,
  { box: string; fill: string; indeterminate: string; border: string; circleFill: string }
> = {
  md: {
    box: 'size-5',
    fill: 'size-2.5',
    indeterminate: 'h-0.5 w-2.5',
    border: 'border-2',
    circleFill: 'size-3',
  },
  sm: {
    box: 'size-4',
    fill: 'size-2',
    indeterminate: 'h-0.5 w-2',
    border: 'border',
    circleFill: 'size-2.5',
  },
};

// Visual checkbox used across topic selection and filter controls.
// Outer box uses inline-flex centering with box-border so borders never
// throw off alignment; inner fills are always separate centered children.
const TopicalCheckbox: React.FC<TopicalCheckboxProps> = ({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  shape = 'square',
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
}) => {
  const styles = sizeStyles[size];
  const isActive = checked || indeterminate;
  const rounded = shape === 'circle' ? 'rounded-full' : 'rounded';
  const fillRounded = shape === 'circle' ? 'rounded-full' : 'rounded-[2px]';

  return (
    <>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={() => onChange?.()}
        aria-label={ariaLabel}
      />
      <span
        aria-hidden="true"
        className={`box-border inline-flex shrink-0 items-center justify-center ${styles.box} ${styles.border} ${rounded} transition-colors cursor-pointer border-gray-400 bg-transparent hover:border-blue-500 group-hover:border-blue-400 dark:border-gray-500 ${
          isActive ? 'border-blue-500' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {shape === 'circle' ? (
          <motion.span
            className={`${styles.circleFill} ${fillRounded} bg-blue-600 dark:bg-blue-500 border border-blue-400 dark:border-blue-300`}
            initial={false}
            animate={{
              scale: checked ? 1 : indeterminate ? 0.55 : 0,
              opacity: isActive ? 1 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          />
        ) : checked ? (
          <span className={`${styles.fill} ${fillRounded} bg-blue-600 dark:bg-blue-500`} />
        ) : indeterminate ? (
          <span className={`${styles.indeterminate} ${fillRounded} bg-blue-600 dark:bg-blue-500`} />
        ) : null}
      </span>
    </>
  );
};

export default TopicalCheckbox;
