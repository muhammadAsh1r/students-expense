import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchStudentProfile,
  updateStudentProfile,
} from "../features/user/userSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { currentStudent, loading, error } = useSelector((state) => state.user);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  useEffect(() => {
    if (currentStudent?.user) {
      setFirstName(currentStudent.user.first_name || "");
      setLastName(currentStudent.user.last_name || "");
      setDepartment(currentStudent.department || "");
    }
  }, [currentStudent]);

  const handleSave = async () => {
    try {
      const resultAction = await dispatch(
        updateStudentProfile({
          first_name: firstName,
          last_name: lastName,
          department: department,
        })
      );

      if (updateStudentProfile.fulfilled.match(resultAction)) {
        dispatch(fetchStudentProfile());
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile. Try again.");
    }
  };

  // Check if there is any change in profile
  const isChanged =
    firstName !== (currentStudent?.user?.first_name || "") ||
    lastName !== (currentStudent?.user?.last_name || "") ||
    department !== (currentStudent?.department || "");

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-gray-50 rounded-xl shadow-lg">
      <h2 className="text-4xl font-bold mb-8 text-gray-800 border-b pb-3">My Profile</h2>

      {currentStudent?.user ? (
        <div className="space-y-6 text-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">
                Username
              </label>
              <p className="text-gray-800">{currentStudent.user.username || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">
                Email
              </label>
              <p className="text-gray-800">{currentStudent.user.email || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1 text-gray-600">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-600">
              Wallet Balance
            </label>
            <p className="text-gray-800">${currentStudent.wallet_balance || 0}</p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!isChanged} // Disabled if nothing changed
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                isChanged
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">No profile information available.</p>
      )}
    </div>
  );
};

export default Profile;
