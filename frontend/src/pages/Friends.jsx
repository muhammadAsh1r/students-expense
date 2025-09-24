import React, { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Notification from "../components/Notification";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const api = axios.create({
    baseURL: "https://students-expense.onrender.com/api",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
  });

  // Fetch friends
  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await api.get("/friends/");
      const data = res.data.map((f) => ({
        ...f,
        _uniqueKey: f.id ?? uuidv4(),
      }));
      setFriends(data);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
      setNotification({ type: "warning", message: "⚠️ Failed to load friends!" });
    } finally {
      setLoading(false);
    }
  };

  // Add friend
  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!newFriendUsername.trim()) {
      setNotification({ type: "warning", message: "Please enter a username!" });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/friends/add/", { username: newFriendUsername });
      await fetchFriends();
      setNewFriendUsername("");
      setNotification({
        type: "success",
        message: res.data.detail || "✅ Friend added successfully!",
      });
    } catch (error) {
      console.error("Add friend failed:", error.response?.data || error.message);
      setNotification({ type: "warning", message: "Failed to add friend!" });
    } finally {
      setLoading(false);
    }
  };

  // Remove friend
  const handleRemoveFriend = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/friends/remove/${id}/`);
      setFriends(friends.filter((f) => f.id !== id));
      setNotification({
        type: "success",
        message: "🗑️ Friend removed successfully!",
      });
    } catch (err) {
      console.error("Remove friend failed:", err.response?.data || err);
      setNotification({ type: "warning", message: "Failed to remove friend!" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-600 mb-8 text-center">
        Friends
      </h1>

      {/* Add Friend Form */}
      <form
        onSubmit={handleAddFriend}
        className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl shadow-md mb-6"
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
          className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Add Friend"}
        </button>
      </form>

      {/* Friend List */}
      <div className="bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200">
        {friends.length === 0 && (
          <p className="text-gray-500 text-center py-4">No friends added yet.</p>
        )}
        {friends.map((friend) => (
          <div
            key={friend._uniqueKey}
            className="flex justify-between items-center py-3"
          >
            <span className="text-gray-800 font-medium">
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
