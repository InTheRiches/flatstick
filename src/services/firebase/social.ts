import {
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  startAt,
  type FirebaseFirestoreTypes,
  type Unsubscribe,
} from "@react-native-firebase/firestore"

import type {
  FeedCommentDoc,
  FeedLikeDoc,
  FeedPostDoc,
  FriendDoc,
  FriendRequestDoc,
  SocialUserSummary,
} from "@/models/social"
import type { UserProfile } from "@/models/user"

function db() {
  return getFirestore()
}

function usersCollection() {
  return collection(db(), "users")
}

function userDoc(userId: string) {
  return doc(db(), "users", userId)
}

function friendsCollection(userId: string) {
  return collection(db(), "users", userId, "friends")
}

function friendDoc(userId: string, friendId: string) {
  return doc(db(), "users", userId, "friends", friendId)
}

function friendRequestsCollection(userId: string) {
  return collection(db(), "users", userId, "friendRequests")
}

function friendRequestDoc(userId: string, requestId: string) {
  return doc(db(), "users", userId, "friendRequests", requestId)
}

function userFeedCollection(userId: string) {
  return collection(db(), "users", userId, "feed")
}

function globalFeedCollection() {
  return collection(db(), "feed")
}

function toIsoNow() {
  return new Date().toISOString()
}

function requestIdForPair(fromUserId: string, toUserId: string) {
  return `${fromUserId}_${toUserId}`
}

function readFriendIds(data: Record<string, unknown> | undefined): string[] {
  if (!data) return []

  const friendIds = data.friendIds
  if (Array.isArray(friendIds)) {
    return friendIds.filter((value): value is string => typeof value === "string")
  }

  // Backward compatibility for profiles that still have the old field.
  const legacyFriends = data.friends
  if (Array.isArray(legacyFriends)) {
    return legacyFriends.filter((value): value is string => typeof value === "string")
  }

  return []
}

function mapUserSummary(
  snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  currentUserId?: string,
): SocialUserSummary | null {
  const data = snapshot.data() as Partial<UserProfile>
  const userId = snapshot.id

  if (currentUserId && userId === currentUserId) return null

  return {
    userId,
    displayName: data.displayName || `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Unknown User",
    username: data.username,
    usernameLower: data.usernameLower,
    avatar: data.avatar || null,
  }
}

function mapFriendDoc(snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot): FriendDoc {
  const data = snapshot.data() as Partial<FriendDoc>

  return {
    friendId: data.friendId || snapshot.id,
    userId: data.userId || snapshot.id,
    displayName: data.displayName || "Unknown User",
    username: data.username,
    usernameLower: data.usernameLower,
    avatar: data.avatar || null,
    createdAt: data.createdAt || toIsoNow(),
    updatedAt: data.updatedAt || toIsoNow(),
  }
}

function mapFriendRequestDoc(
  snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot,
): FriendRequestDoc {
  const data = snapshot.data() as Partial<FriendRequestDoc>

  return {
    requestId: data.requestId || snapshot.id,
    fromUserId: data.fromUserId || "",
    toUserId: data.toUserId || "",
    fromDisplayName: data.fromDisplayName || "Unknown User",
    fromUsername: data.fromUsername,
    fromAvatar: data.fromAvatar || null,
    toDisplayName: data.toDisplayName || "Unknown User",
    toUsername: data.toUsername,
    toAvatar: data.toAvatar || null,
    direction: data.direction || "incoming",
    status: data.status || "pending",
    createdAt: data.createdAt || toIsoNow(),
    updatedAt: data.updatedAt || toIsoNow(),
  }
}

function buildOutgoingRequest(
  fromUser: SocialUserSummary,
  toUser: SocialUserSummary,
  requestId: string,
  now: string,
): FriendRequestDoc {
  return {
    requestId,
    fromUserId: fromUser.userId,
    toUserId: toUser.userId,
    fromDisplayName: fromUser.displayName,
    fromUsername: fromUser.username,
    fromAvatar: fromUser.avatar || null,
    toDisplayName: toUser.displayName,
    toUsername: toUser.username,
    toAvatar: toUser.avatar || null,
    direction: "outgoing",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  }
}

function buildIncomingRequest(
  fromUser: SocialUserSummary,
  toUser: SocialUserSummary,
  requestId: string,
  now: string,
): FriendRequestDoc {
  return {
    requestId,
    fromUserId: fromUser.userId,
    toUserId: toUser.userId,
    fromDisplayName: fromUser.displayName,
    fromUsername: fromUser.username,
    fromAvatar: fromUser.avatar || null,
    toDisplayName: toUser.displayName,
    toUsername: toUser.username,
    toAvatar: toUser.avatar || null,
    direction: "incoming",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  }
}

function friendFromRequest(
  request: FriendRequestDoc,
  currentUserId: string,
  currentUserDisplayName: string,
  currentUserUsername?: string,
  currentUserAvatar?: string | null,
): { meToThem: FriendDoc; themToMe: FriendDoc; otherUserId: string } {
  const now = toIsoNow()

  const incoming = request.toUserId === currentUserId
  const otherUserId = incoming ? request.fromUserId : request.toUserId

  const themToMe: FriendDoc = {
    friendId: otherUserId,
    userId: otherUserId,
    displayName: incoming ? request.fromDisplayName : request.toDisplayName,
    username: incoming ? request.fromUsername : request.toUsername,
    usernameLower: (incoming ? request.fromUsername : request.toUsername)?.toLowerCase(),
    avatar: incoming ? request.fromAvatar : request.toAvatar,
    createdAt: now,
    updatedAt: now,
  }

  const meToThem: FriendDoc = {
    friendId: currentUserId,
    userId: currentUserId,
    displayName: currentUserDisplayName,
    username: currentUserUsername,
    usernameLower: currentUserUsername?.toLowerCase(),
    avatar: currentUserAvatar || null,
    createdAt: now,
    updatedAt: now,
  }

  return { meToThem, themToMe, otherUserId }
}

export function subscribeToFriends(
  userId: string,
  callback: (friends: FriendDoc[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    friendsCollection(userId),
    (snapshot) => {
      const docs = snapshot.docs.map(mapFriendDoc)
      const sorted = docs.sort((a: FriendDoc, b: FriendDoc) =>
        b.createdAt.localeCompare(a.createdAt),
      )
      callback(sorted)
    },
    (error) => onError?.(error as Error),
  )
}

export function subscribeToFriendRequests(
  userId: string,
  callback: (requests: FriendRequestDoc[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    friendRequestsCollection(userId),
    (snapshot) => {
      const docs = snapshot.docs.map(mapFriendRequestDoc)
      const sorted = docs.sort((a: FriendRequestDoc, b: FriendRequestDoc) =>
        b.createdAt.localeCompare(a.createdAt),
      )
      callback(sorted)
    },
    (error) => onError?.(error as Error),
  )
}

export async function searchUsersByNameOrUsername(
  currentUserId: string,
  searchValue: string,
  take: number = 20,
): Promise<SocialUserSummary[]> {
  const term = searchValue.trim().toLowerCase()
  if (term.length < 2) return []

  const maxTake = Math.max(1, Math.min(take, 50))

  const displayNameQuery = query(
    usersCollection(),
    orderBy("displayNameLower"),
    startAt(term),
    endAt(`${term}\uf8ff`),
    limit(maxTake),
  )

  const usernameQuery = query(
    usersCollection(),
    orderBy("usernameLower"),
    startAt(term),
    endAt(`${term}\uf8ff`),
    limit(maxTake),
  )

  const [displayNameSnap, usernameSnap] = await Promise.all([
    getDocs(displayNameQuery),
    getDocs(usernameQuery),
  ])

  const merged = new Map<string, SocialUserSummary>()

  for (const snapshot of displayNameSnap.docs) {
    const mapped = mapUserSummary(snapshot, currentUserId)
    if (!mapped) continue
    merged.set(mapped.userId, mapped)
  }

  for (const snapshot of usernameSnap.docs) {
    const mapped = mapUserSummary(snapshot, currentUserId)
    if (!mapped) continue
    merged.set(mapped.userId, mapped)
  }

  return Array.from(merged.values()).slice(0, maxTake)
}

export async function sendFriendRequest(
  fromUser: SocialUserSummary,
  toUser: SocialUserSummary,
): Promise<void> {
  if (fromUser.userId === toUser.userId) {
    throw new Error("You cannot send a friend request to yourself")
  }

  const now = toIsoNow()
  const requestId = requestIdForPair(fromUser.userId, toUser.userId)
  const reciprocalRequestId = requestIdForPair(toUser.userId, fromUser.userId)

  await runTransaction(db(), async (transaction) => {
    const fromUserSnap = await transaction.get(userDoc(fromUser.userId))
    const toUserSnap = await transaction.get(userDoc(toUser.userId))

    if (!fromUserSnap.exists() || !toUserSnap.exists()) {
      throw new Error("One of the users no longer exists")
    }

    const fromFriendIds = readFriendIds(fromUserSnap.data() as Record<string, unknown>)
    if (fromFriendIds.includes(toUser.userId)) {
      throw new Error("You are already friends with this user")
    }

    const existingOutgoingRef = friendRequestDoc(fromUser.userId, requestId)
    const existingIncomingRef = friendRequestDoc(toUser.userId, requestId)
    const reciprocalRef = friendRequestDoc(fromUser.userId, reciprocalRequestId)

    const [existingOutgoingSnap, existingIncomingSnap, reciprocalSnap] = await Promise.all([
      transaction.get(existingOutgoingRef),
      transaction.get(existingIncomingRef),
      transaction.get(reciprocalRef),
    ])

    if (existingOutgoingSnap.exists() || existingIncomingSnap.exists()) {
      throw new Error("A friend request is already pending")
    }

    if (reciprocalSnap.exists()) {
      const reciprocalData = reciprocalSnap.data() as FriendRequestDoc
      if (reciprocalData.status === "pending" && reciprocalData.direction === "incoming") {
        throw new Error("This user already sent you a friend request")
      }
    }

    transaction.set(existingOutgoingRef, buildOutgoingRequest(fromUser, toUser, requestId, now))
    transaction.set(existingIncomingRef, buildIncomingRequest(fromUser, toUser, requestId, now))

    transaction.update(userDoc(toUser.userId), {
      "flags.hasPendingFriendRequests": true,
      updatedAt: now,
    })

    transaction.update(userDoc(fromUser.userId), {
      updatedAt: now,
    })
  })
}

export async function acceptFriendRequest(
  currentUser: SocialUserSummary,
  request: FriendRequestDoc,
): Promise<void> {
  if (request.status !== "pending") {
    throw new Error("Only pending requests can be accepted")
  }

  const now = toIsoNow()
  const { meToThem, themToMe, otherUserId } = friendFromRequest(
    request,
    currentUser.userId,
    currentUser.displayName,
    currentUser.username,
    currentUser.avatar,
  )

  await runTransaction(db(), async (transaction) => {
    const currentRequestRef = friendRequestDoc(currentUser.userId, request.requestId)
    const mirrorRequestRef = friendRequestDoc(otherUserId, request.requestId)

    const [currentRequestSnap, currentUserSnap, otherUserSnap] = await Promise.all([
      transaction.get(currentRequestRef),
      transaction.get(userDoc(currentUser.userId)),
      transaction.get(userDoc(otherUserId)),
    ])

    if (!currentRequestSnap.exists()) {
      throw new Error("Friend request no longer exists")
    }

    if (!currentUserSnap.exists() || !otherUserSnap.exists()) {
      throw new Error("One of the users no longer exists")
    }

    const requestData = currentRequestSnap.data() as FriendRequestDoc
    if (requestData.status !== "pending") {
      throw new Error("Friend request is no longer pending")
    }

    const myFriendIds = readFriendIds(currentUserSnap.data() as Record<string, unknown>)
    const otherFriendIds = readFriendIds(otherUserSnap.data() as Record<string, unknown>)

    const nextMyFriendIds = myFriendIds.includes(otherUserId)
      ? myFriendIds
      : [...myFriendIds, otherUserId]

    const nextOtherFriendIds = otherFriendIds.includes(currentUser.userId)
      ? otherFriendIds
      : [...otherFriendIds, currentUser.userId]

    transaction.set(friendDoc(currentUser.userId, otherUserId), themToMe)
    transaction.set(friendDoc(otherUserId, currentUser.userId), meToThem)

    transaction.update(userDoc(currentUser.userId), {
      friendIds: nextMyFriendIds,
      updatedAt: now,
    })

    transaction.update(userDoc(otherUserId), {
      friendIds: nextOtherFriendIds,
      updatedAt: now,
    })

    transaction.delete(currentRequestRef)
    transaction.delete(mirrorRequestRef)
  })
}

export async function declineOrCancelFriendRequest(
  currentUserId: string,
  request: FriendRequestDoc,
): Promise<void> {
  const otherUserId =
    request.fromUserId === currentUserId ? request.toUserId : request.fromUserId

  await runTransaction(db(), async (transaction) => {
    const currentRef = friendRequestDoc(currentUserId, request.requestId)
    const mirrorRef = friendRequestDoc(otherUserId, request.requestId)

    transaction.delete(currentRef)
    transaction.delete(mirrorRef)
    transaction.update(userDoc(currentUserId), { updatedAt: toIsoNow() })
  })
}

export async function removeFriend(currentUserId: string, friendId: string): Promise<void> {
  await runTransaction(db(), async (transaction) => {
    const [currentUserSnap, friendUserSnap] = await Promise.all([
      transaction.get(userDoc(currentUserId)),
      transaction.get(userDoc(friendId)),
    ])

    if (!currentUserSnap.exists() || !friendUserSnap.exists()) {
      throw new Error("One of the users no longer exists")
    }

    const myFriendIds = readFriendIds(currentUserSnap.data() as Record<string, unknown>)
    const theirFriendIds = readFriendIds(friendUserSnap.data() as Record<string, unknown>)

    transaction.delete(friendDoc(currentUserId, friendId))
    transaction.delete(friendDoc(friendId, currentUserId))

    transaction.update(userDoc(currentUserId), {
      friendIds: myFriendIds.filter((id) => id !== friendId),
      updatedAt: toIsoNow(),
    })

    transaction.update(userDoc(friendId), {
      friendIds: theirFriendIds.filter((id) => id !== currentUserId),
      updatedAt: toIsoNow(),
    })
  })
}

export async function createLocalFeedPost(
  userId: string,
  input: Omit<FeedPostDoc, "id" | "createdAt" | "userId">,
): Promise<FeedPostDoc> {
  const ref = doc(userFeedCollection(userId))
  const feedPost: FeedPostDoc = {
    id: ref.id,
    userId,
    createdAt: toIsoNow(),
    ...input,
  }

  await setDoc(ref, feedPost)
  return feedPost
}

export async function addFeedLike(postId: string, userId: string): Promise<void> {
  const likeDocRef = doc(globalFeedCollection(), postId, "likes", userId)
  const likeDoc: FeedLikeDoc = {
    createdAt: toIsoNow(),
  }

  await setDoc(likeDocRef, likeDoc)
}

export async function addFeedComment(
  postId: string,
  user: Pick<SocialUserSummary, "userId" | "username" | "avatar">,
  text: string,
): Promise<FeedCommentDoc> {
  const commentsCollectionRef = collection(db(), "feed", postId, "comments")
  const commentRef = doc(commentsCollectionRef)

  const comment: FeedCommentDoc = {
    commentId: commentRef.id,
    userId: user.userId,
    username: user.username,
    avatar: user.avatar,
    text,
    createdAt: toIsoNow(),
  }

  await setDoc(commentRef, comment)

  return comment
}

export async function getSocialUserSummary(userId: string): Promise<SocialUserSummary | null> {
  const snapshot = await getDoc(userDoc(userId))
  if (!snapshot.exists()) return null

  const data = snapshot.data() as Partial<UserProfile>

  return {
    userId,
    displayName: data.displayName || `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Unknown User",
    username: data.username,
    usernameLower: data.usernameLower,
    avatar: data.avatar || null,
  }
}
