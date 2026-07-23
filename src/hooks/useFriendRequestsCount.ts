import { useCallback } from "react";
import axiosClient from "../utils/axiosClient";
import friendRequestsStore from "../zustand/friendRequestsStore";

// Count-only fetch for badge indicators (tab icon, editFriends row) --
// unlike useGetFriendRequests this skips resolving each requester's profile
// image, since callers here only need the number.
const useFriendRequestsCount = () => {
  const { setPendingCount } = friendRequestsStore();

  const refreshFriendRequestsCount = useCallback(async () => {
    try {
      const res = await axiosClient.get("/users/friendrequests");
      setPendingCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch (error) {
      // Silent -- this only drives a badge, not critical UI
    }
  }, [setPendingCount]);

  return { refreshFriendRequestsCount };
};

export default useFriendRequestsCount;
