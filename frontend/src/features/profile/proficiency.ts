/** Map a proficiency label to a 0–100 percentage for progress bars. */
export const proficiencyToPercent = (level?: string | null): number => {
  switch (level?.toLowerCase()) {
    case 'native':
      return 100;
    case 'expert':
      return 95;
    case 'advanced':
      return 80;
    case 'intermediate':
      return 60;
    case 'beginner':
      return 35;
    default:
      return 50;
  }
};
