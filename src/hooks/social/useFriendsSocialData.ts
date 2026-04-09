import { useEffect, useMemo, useState } from "react"

import { useUser } from "@/context"
import type { FriendDoc, FriendRequestDoc } from "@/models/social"
import {
  subscribeToFriendRequests,
  subscribeToFriends,
} from "@/services/firebase/social"

interface UseFriendsSocialDataOptions {
  includeRequests?: boolean
}

interface UseFriendsSocialDataResult {
  friends: FriendDoc[]
  incomingRequests: FriendRequestDoc[]
  outgoingRequests: FriendRequestDoc[]
  loading: boolean
  error: string | null
}

export function useFriendsSocialData(
  options: UseFriendsSocialDataOptions = {},
): UseFriendsSocialDataResult {
  const { includeRequests = false } = options
  const { authUser } = useUser()

  const [friends, setFriends] = useState<FriendDoc[]>([])
  const [requests, setRequests] = useState<FriendRequestDoc[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const userId = authUser?.uid

  useEffect(() => {
    if (!userId) {
      setFriends([])
      setRequests([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    let friendsLoaded = false
    let requestsLoaded = !includeRequests

    const maybeDone = () => {
      if (friendsLoaded && requestsLoaded) {
        setLoading(false)
      }
    }

    const unsubscribeFriends = subscribeToFriends(
      userId,
      (nextFriends) => {
        setFriends(nextFriends)
        friendsLoaded = true
        maybeDone()
      },
      (nextError) => {
        setError(nextError.message)
        friendsLoaded = true
        maybeDone()
      },
    )

    const unsubscribeRequests = includeRequests
      ? subscribeToFriendRequests(
          userId,
          (nextRequests) => {
            setRequests(nextRequests)
            requestsLoaded = true
            maybeDone()
          },
          (nextError) => {
            setError(nextError.message)
            requestsLoaded = true
            maybeDone()
          },
        )
      : undefined

    return () => {
      unsubscribeFriends()
      unsubscribeRequests?.()
    }
  }, [includeRequests, userId])

  const incomingRequests = useMemo(() => {
    return requests.filter(
      (request) => request.direction === "incoming" && request.status === "pending",
    )
  }, [requests])

  const outgoingRequests = useMemo(() => {
    return requests.filter(
      (request) => request.direction === "outgoing" && request.status === "pending",
    )
  }, [requests])

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    loading,
    error,
  }
}
