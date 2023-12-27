export interface GitHubAvatarProps {
  name: string;
  avatarUrl: string;
  profileUrl: string;
  /**
   * The avatar size, possible values: `md` (24px), `lg` (32px)
   * @default "md"
   */
  size?: 'md' | 'lg';
}
