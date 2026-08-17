// Shared style tokens for the Topical Pages feature.
// Everything clickable (Load, Export, MCQ/Theory, Paper filter) shares the
// same height (h-9), padding, radius and font-weight so nothing looks
// randomly bigger or smaller than its neighbor.

export const CONTROL_HEIGHT = 'h-9';

export const btnBase =
  `inline-flex items-center justify-center gap-1.5 ${CONTROL_HEIGHT} px-3.5 rounded-lg text-sm font-medium ` +
  'transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

// Main call-to-action (e.g. "Load matching papers")
export const btnPrimary =
  `${btnBase}   bg-blue-500 text-white shadow-sm hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800`;

// Secondary actions that still need some visual weight (e.g. Export)
export const btnSecondary =
  `${btnBase} bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 ` +
  'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700';

// Toggle / segmented-control style buttons (MCQ/Theory, Paper filter chips)
export const btnToggleBase =
  `inline-flex items-center justify-center ${CONTROL_HEIGHT} px-3 text-sm font-medium ` +
  'transition-colors border first:rounded-l-lg last:rounded-r-lg -ml-px first:ml-0';

export const btnToggleActive =
  'bg-blue-500 shadow-sm hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 border-blue-600 text-white z-10';

export const btnToggleInactive =
  'bg-white border-gray-300 text-gray-600 hover:bg-gray-100 ' +
  'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700';

// Small pill badges (match counts, "N topics selected")
export const pillActive =
  'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/30';

export const pillInactive =
  'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-700/30 text-gray-300 border border-gray-600/40';

// Bordered button used as a standalone dropdown / select trigger
export const btnSelect =
  `${btnBase} border bg-white text-gray-700 hover:bg-gray-50 ` +
  'dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700';

// Dropdown menu shell shared by the export menu, the filter dropdowns and the
// level/board/subject picker
export const dropdownPanel =
  'absolute z-50 mt-2 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800';

export const dropdownItem =
  'w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2';

// Checkbox style matching the TopicPickerPanel - border-only box with inner dot
export const checkboxBase =
  'w-5 h-5 appearance-none border-2 border-gray-400 dark:border-gray-500 rounded focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 ' +
  'dark:focus:ring-offset-gray-900 transition-colors cursor-pointer hover:border-blue-500 bg-transparent ' +
  'relative ' +
  'checked:border-blue-500 ' +
  'checked:after:content-[""] checked:after:absolute checked:after:inset-0 checked:after:m-auto checked:after:w-2.5 checked:after:h-2.5 checked:after:bg-blue-600 checked:after:rounded-[2px] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

// Checkbox with label wrapper - same height as other controls (h-9)
export const checkboxWithLabel =
  'inline-flex items-center gap-2 h-9 px-3 rounded-lg cursor-pointer ' +
  'bg-white text-gray-700 border border-gray-300 ' +
  'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 ' +
  'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
