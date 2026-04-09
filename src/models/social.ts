import type { ISODateString, UUID } from "@/models/common"

export type RoundVisibility = "private" | "friends" | "public"

export type FriendRequestStatus = "pending" | "accepted" | "declined" | "cancelled"
export type FriendRequestDirection = "incoming" | "outgoing"

export interface SocialUserSummary {
  userId: UUID
  displayName: string
  username?: string
  usernameLower?: string
  avatar?: string | null
}

export interface FriendDoc extends SocialUserSummary {
  friendId: UUID
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface FriendRequestDoc {
  requestId: string
  fromUserId: UUID
  toUserId: UUID

  fromDisplayName: string
  fromUsername?: string
  fromAvatar?: string | null

  toDisplayName: string
  toUsername?: string
  toAvatar?: string | null

  direction: FriendRequestDirection
  status: FriendRequestStatus

  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface FeedPostDoc {
  id: string
  userId: UUID
  username?: string
  avatar?: string | null
  visibility: RoundVisibility
  roundRef: string
  createdAt: ISODateString
}

export interface FeedLikeDoc {
  createdAt: ISODateString
}

export interface FeedCommentDoc {
  commentId: string
  userId: UUID
  username?: string
  avatar?: string | null
  text: string
  createdAt: ISODateString
}
