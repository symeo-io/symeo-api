export enum VcsRepositoryRole {
  ADMIN = 'admin',
  MAINTAIN = 'maintain',
  WRITE = 'write',
  TRIAGE = 'triage',
  READ = 'read',
}
export const VCS_REPOSITORY_ROLE_ORDER = [
  VcsRepositoryRole.READ,
  VcsRepositoryRole.TRIAGE,
  VcsRepositoryRole.WRITE,
  VcsRepositoryRole.MAINTAIN,
  VcsRepositoryRole.ADMIN,
];
