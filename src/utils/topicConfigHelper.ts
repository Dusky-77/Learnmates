/**
 * Topic Configuration Helper
 * Provides a simple interface to add quizzes to topic data
 * 
 * Usage Example:
 * const topic = {
 *   title: 'Cell Structure and Transport',
 *   ...other fields,
 *   quizConfig: [
 *     {
 *       folderPath: '/Questions/igcse/cambridge/biology',
 *       title: 'Practice Questions'
 *     },
 *     {
 *       folderPath: '/Questions/igcse/cambridge/biology-advanced',
 *       title: 'Advanced Questions'
 *     }
 *   ]
 * }
 */

export interface QuizConfig {
  folderPath: string;
  title: string;
}

/**
 * Example quiz configurations for different topics
 * You can copy and modify these as needed
 */
export const exampleQuizConfigs = {
  // Biology IGCSE Cambridge
  biologyIGCSE: [
    {
      folderPath: '/Questions/igcse/cambridge/biology',
      title: 'Practice Questions'
    }
  ],

  // Chemistry IGCSE Cambridge
  chemistryIGCSE: [
    {
      folderPath: '/Questions/igcse/cambridge/chemistry',
      title: 'Practice Questions'
    }
  ],

  // Physics IGCSE Cambridge
  physicsIGCSE: [
    {
      folderPath: '/Questions/igcse/cambridge/physics',
      title: 'Practice Questions'
    }
  ],
};

/**
 * Validates a quiz configuration
 * @param config - The quiz configuration to validate
 * @returns true if valid, false otherwise
 */
export function isValidQuizConfig(config: any): config is QuizConfig {
  return (
    config &&
    typeof config === 'object' &&
    typeof config.folderPath === 'string' &&
    typeof config.title === 'string' &&
    config.folderPath.length > 0 &&
    config.title.length > 0
  );
}

/**
 * Validates an array of quiz configurations
 * @param configs - Array of configurations to validate
 * @returns filtered array of valid configs
 */
export function validateQuizConfigs(configs: any[]): QuizConfig[] {
  if (!Array.isArray(configs)) return [];
  return configs.filter(isValidQuizConfig);
}
