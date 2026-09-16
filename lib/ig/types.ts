export interface IgPostConfig {
  id: string;
  mediaId: string | null;
  postLink: string;
  triggerWords: string[];
  link: string;
  messageOverride: string;
  active: boolean;
}

export interface IgSettings {
  fallbackWord: string;
  publicReplyEnabled: boolean;
}

export interface IgConfigs extends IgSettings {
  posts: IgPostConfig[];
}

export interface IgCommentState {
  commentId: string;
  status: string | null;
  dmFailed: boolean;
  username: string | null;
  mediaId: string | null;
  configId: string | null;
  igsid: string | null;
  clickedGetLink: boolean;
  wasFollowingInitially: boolean | null;
  becameFollower: boolean;
  linkClickedAt: string | null;
  lastCheckedAt: string | null;
}
