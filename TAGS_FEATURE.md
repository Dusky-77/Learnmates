# Tags Feature Documentation

## Overview
The tags feature allows you to add multiple custom tags to any topic. Each tag displays with a custom color, helping you categorize and highlight important topics at a glance.

## How to Add Tags to a Topic

### Basic Syntax
Add a `tags` array to a topic object:

```typescript
{
  id: 'chemistry-2',
  title: 'Atoms, elements and compounds',
  description: 'Explore the fundamental concepts...',
  subject: 'Chemistry',
  tags: [
    { name: 'Important', color: 'bg-red-500' },
    { name: 'Basics', color: 'bg-blue-500' }
  ]
}
```

### Data Structure
Each tag object requires:
- `name` (string): The display text for the tag (e.g., "Important", "Challenging")
- `color` (string): A Tailwind CSS background color class (e.g., "bg-red-500", "bg-blue-400")

## Available Colors

### Red Variants
- `bg-red-400` - Light red
- `bg-red-500` - Standard red
- `bg-red-600` - Dark red

### Blue Variants
- `bg-blue-400` - Light blue
- `bg-blue-500` - Standard blue
- `bg-blue-600` - Dark blue

### Green Variants
- `bg-green-400` - Light green
- `bg-green-500` - Standard green
- `bg-green-600` - Dark green

### Orange Variants
- `bg-orange-400` - Light orange
- `bg-orange-500` - Standard orange
- `bg-orange-600` - Dark orange

### Purple Variants
- `bg-purple-400` - Light purple
- `bg-purple-500` - Standard purple
- `bg-purple-600` - Dark purple

### Yellow Variants
- `bg-yellow-400` - Light yellow
- `bg-yellow-500` - Standard yellow
- `bg-yellow-600` - Dark yellow

### Pink Variants
- `bg-pink-400` - Light pink
- `bg-pink-500` - Standard pink
- `bg-pink-600` - Dark pink

### Teal Variants
- `bg-teal-400` - Light teal
- `bg-teal-500` - Standard teal
- `bg-teal-600` - Dark teal

### Indigo Variants
- `bg-indigo-400` - Light indigo
- `bg-indigo-500` - Standard indigo
- `bg-indigo-600` - Dark indigo

## Examples

### Example 1: Important Concept
```typescript
{
  id: 'biology-1',
  title: 'Characteristics and Classifications of living organisms',
  description: 'Explore the characteristics and classifications...',
  subject: 'Biology',
  group: 'The Foundations of Life',
  tags: [{ name: 'Important', color: 'bg-red-500' }]
}
```

### Example 2: Multiple Tags
```typescript
{
  id: 'chemistry-2',
  title: 'Atoms, elements and compounds',
  description: 'Explore the fundamental concepts...',
  subject: 'Chemistry',
  tags: [
    { name: 'Important', color: 'bg-red-500' },
    { name: 'Basics', color: 'bg-blue-500' },
    { name: 'Exam Focus', color: 'bg-yellow-500' }
  ]
}
```

### Example 3: Challenging Topic
```typescript
{
  id: 'chemistry-3',
  title: 'Stoichiometry',
  description: 'Learn about stoichiometry...',
  subject: 'Chemistry',
  tags: [{ name: 'Challenging', color: 'bg-orange-500' }]
}
```

## Where Tags Appear

Tags display:
- **Desktop View**: Below the subject badge/group badge and above the title
- **Mobile View**: Below the subject badge/group badge and above the title
- **Color**: Each tag is displayed with its specified background color and white text

## Best Practices

1. **Limit tags per topic**: Use 1-3 tags per topic for clarity
2. **Use consistent naming**: Consider creating a standard set of tag names:
   - "Important" - Critical concepts
   - "Challenging" - Difficult topics
   - "Exam Focus" - High-frequency exam topics
   - "Basics" - Foundational knowledge
   - "Review" - Topics that need reinforcement
   - "Updated" - Recently added content
3. **Choose readable colors**: Avoid very light colors (e.g., `bg-yellow-200`) as they may not have enough contrast with white text
4. **Keep names short**: Tag names should be concise for better layout on mobile

## File Location
Tags are managed in: `src/utils/curriculumData.ts`

## Type Definition
```typescript
export type Tag = {
  name: string;
  color: string;
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  subject: string;
  color?: string;
  group?: string;
  tags?: Tag[];  // Optional tags array
};
```
