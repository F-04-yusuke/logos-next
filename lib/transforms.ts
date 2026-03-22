/**
 * API レスポンス変換レイヤー
 *
 * Laravel は boolean 値を 0/1（整数）で返すため、
 * フェッチ直後にこの関数を通すことで型安全な boolean に変換する。
 * JSX 内で `!!` 変換を散在させないための一元管理。
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawObj = Record<string, any>;

export function transformUser(raw: RawObj) {
  return {
    ...raw,
    is_pro: !!raw.is_pro,
    is_admin: !!raw.is_admin,
  };
}

export function transformPost(raw: RawObj) {
  return {
    ...raw,
    is_liked_by_me: !!raw.is_liked_by_me,
  };
}

export function transformReply(raw: RawObj) {
  return {
    ...raw,
    is_liked_by_me: !!raw.is_liked_by_me,
  };
}

export function transformComment(raw: RawObj) {
  return {
    ...raw,
    is_liked_by_me: !!raw.is_liked_by_me,
    replies: Array.isArray(raw.replies)
      ? raw.replies.map(transformReply)
      : [],
  };
}

export function transformAnalysis(raw: RawObj) {
  return {
    ...raw,
    is_published: !!raw.is_published,
    is_liked_by_me: !!raw.is_liked_by_me,
  };
}

export function transformTopic(raw: RawObj) {
  return {
    ...raw,
    is_bookmarked: !!raw.is_bookmarked,
    user_has_commented: !!raw.user_has_commented,
    posts: Array.isArray(raw.posts) ? raw.posts.map(transformPost) : [],
    comments: Array.isArray(raw.comments)
      ? raw.comments.map(transformComment)
      : [],
    analyses: Array.isArray(raw.analyses)
      ? raw.analyses.map(transformAnalysis)
      : undefined,
  };
}
