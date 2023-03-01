export enum VcsRepositoryRole {
  ADMIN = 'admin',
  MAINTAIN = 'maintain',
  WRITE = 'write',
  TRIAGE = 'triage',
  READ = 'read',
  NONE = 'none',
}
export const VCS_REPOSITORY_ROLE_ORDER = [
  VcsRepositoryRole.NONE,
  VcsRepositoryRole.READ,
  VcsRepositoryRole.TRIAGE,
  VcsRepositoryRole.WRITE,
  VcsRepositoryRole.MAINTAIN,
  VcsRepositoryRole.ADMIN,
];
