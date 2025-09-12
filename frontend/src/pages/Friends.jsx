import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid"; // <-- import uuid
import {
  fetchFriends,
  addFriend,
  removeFriend,
} from "../features/friends/friendsSlice";
import Notification from "../components/Notification";

const Friends = () => {
  const dispatch = useDispatch();
  const {
    list: friends,
    loading,
    error,
  } = useSelector((state) => state.friends);

  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  // Add a unique uuid to each friend for rendering
  const friendsWithUniqueKey = friends.map((f) => ({
    ...f,
    _uniqueKey: f.id ?? f.user?.id ?? uuidv4(),
  }));

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!newFriendUsername.trim()) {
      setNotification({ type: "warning", message: "Please enter a username!" });
      return;
    }
    try {
      await dispatch(addFriend(newFriendUsername)).unwrap();
      dispatch(fetchFriends());
      setNewFriendUsername("");
      setNotification({
        type: "success",
        message: "Friend added successfully!",
      });
    } catch (err) {
      console.error("Add friend failed:", err);
      setNotification({ type: "warning", message: "Failed to add friend!" });
    }
  };

  const handleRemoveFriend = async (id) => {
    try {
      await dispatch(removeFriend(id)).unwrap();
      setNotification({
        type: "success",
        message: "Friend removed successfully!",
      });
    } catch (err) {
      console.error("Remove friend failed:", err);
      setNotification({ type: "warning", message: "Failed to remove friend!" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Friends</h1>

      {/* Add Friend Form */}
      <form
        onSubmit={handleAddFriend}
        className="flex items-center gap-3 border-b border-gray-300 pb-4 mb-6"
      >
        <input
          type="text"
          placeholder="Enter friend's username"
          value={newFriendUsername}
          onChange={(e) => setNewFriendUsername(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Add"}
        </button>
      </form>

      {/* Friend List */}
      <div className="space-y-3">
        {friendsWithUniqueKey.length === 0 && (
          <p className="text-gray-500">No friends added yet.</p>
        )}
        {friendsWithUniqueKey.map((friend) => (
          <div
            key={friend._uniqueKey} // <- guaranteed unique key
            className="flex justify-between items-center border-b border-gray-200 pb-2"
          >
            <span className="text-gray-800">
              {friend.user?.username || friend.username || "Unknown"}
            </span>
            <button
              onClick={() => handleRemoveFriend(friend.id)}
              disabled={loading}
              className="text-red-500 hover:text-red-600 text-sm font-medium disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={4000}
        />
      )}
    </div>
  );
};

export default Friends;
