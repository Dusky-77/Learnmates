import React from 'react';
import { BookOpen, FlaskConical, Dna, Rocket, Sigma, Infinity as InfinityIcon, PieChart, Gauge } from 'lucide-react';

export const getSubjectIcon = (subject: string, className = 'w-5 h-5') => {
  const icons: Record<string, React.ReactNode> = {
    Chemistry: <FlaskConical className={className} />,
    Biology: <Dna className={className} />,
    Physics: <Rocket className={className} />,
    Maths: <Sigma className={className} />,
    Mathematics: <Sigma className={className} />,
    'Pure Mathematics': <InfinityIcon className={className} />,
    Statistics: <PieChart className={className} />,
    Mechanics: <Gauge className={className} />,
  };
  return icons[subject] || <BookOpen className={className} />;
};
