import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: React.ReactNode;
  description?: React.ReactNode;
  closeButton?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const sideStyles = {
  left: 'left-0',
  right: 'right-0',
  top: 'top-0 left-0 right-0',
  bottom: 'bottom-0 left-0 right-0',
};

const sizeStyles = {
  sm: 'w-64',
  md: 'w-80',
  lg: 'w-96',
  xl: 'w-[32rem]',
  full: 'w-full max-w-full',
};

const Drawer = React.forwardRef(function Drawer(
  {
    open,
    onClose,
    side = 'right',
    size = 'md',
    title,
    description,
    closeButton = true,
    children,
    footer,
    className,
  }: DrawerProps,
  ref: React.Ref<HTMLDivElement>
) {
    const isVertical = side === 'left' || side === 'right';
    const isHorizontal = side === 'top' || side === 'bottom';

    // Render drawer into document.body to avoid being constrained by transformed ancestors
    return createPortal(
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <motion.div
                ref={ref}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={twMerge(
                  clsx(
                    'relative flex flex-col bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl rounded-xl overflow-hidden',
                    sizeStyles[size],
                    'max-h-[90vh] max-w-[90vw]',
                    className
                  )
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'drawer-title' : undefined}
                aria-describedby={description ? 'drawer-description' : undefined}
              >
              {(title || closeButton) && (
                <div className="flex items-start justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-900">
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-3 -mx-3 -mt-3 mb-2 shadow-sm dark:shadow-none">
                    {title && (
                      <h2 id="drawer-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p id="drawer-description" className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {description}
                      </p>
                    )}
                  </div>
                  {closeButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className={twMerge(
                        'p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400'
                      )}
                      aria-label="Close drawer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-4">
                {children}
              </div>
              {footer && (
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 shrink-0">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
          </>
        )}
      </AnimatePresence>,
      document.body
    );
  }
);

Drawer.displayName = 'Drawer';

export default Drawer;