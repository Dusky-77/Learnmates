import React from 'react';

/**
 * Detects URLs in text and returns an array of React elements with clickable links
 * @param text - The text to process
 * @returns An array of React elements with URLs converted to clickable links
 */
export const linkifyText = (text: string): (string | React.ReactElement)[] => {
  // URL regex pattern - matches http, https, ftp, and www URLs
  const urlPattern = /(https?:\/\/[^\s"<>]*|www\.[^\s"<>]*)/g;
  
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;

  // Reset regex lastIndex
  const regex = new RegExp(urlPattern.source, urlPattern.flags);
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the URL as a clickable link
    const url = match[0];
    const href = url.startsWith('www.') ? `https://${url}` : url;
    
    parts.push(
      React.createElement(
        'a',
        {
          key: `link-${match.index}`,
          href: href,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'text-blue-600 dark:text-blue-400 hover:underline'
        },
        url
      )
    );

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no URLs were found, return the original text as a single element
  return parts.length > 0 ? parts : [text];
};
