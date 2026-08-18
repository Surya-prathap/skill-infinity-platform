export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  users: (page: number, size: number) => [...adminKeys.all, 'users', page, size] as const,
  user: (userId: string) => [...adminKeys.all, 'user', userId] as const,
  mentors: (page: number, size: number) => [...adminKeys.all, 'mentors', page, size] as const,
  mentorApprovals: () => [...adminKeys.all, 'mentor-approvals'] as const,
  settings: () => [...adminKeys.all, 'settings'] as const,
} as const;
