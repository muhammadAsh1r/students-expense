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

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500 font-medium">Loading...</p>
    );
  if (error)
    return <p className="text-center mt-10 text-red-500 font-medium">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-12 p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-3">
        My Profile
      </h2>

      {currentStudent?.user ? (
        <div className="space-y-8 text-gray-700">
          {/* Account Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-600 mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-600">
                  Username
                </label>
                <p className="text-gray-800 font-medium">
                  {currentStudent.user.username || "-"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-600">
                  Email
                </label>
                <p className="text-gray-800 font-medium">
                  {currentStudent.user.email || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Editable Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-600 mb-4">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-600">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none"
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
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none"
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
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Wallet */}
          <div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Wallet Balance
            </h3>
            <p className="inline-block px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg">
              ${currentStudent.wallet_balance || 0}
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!isChanged}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isChanged
                  ? "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No profile information available.
        </p>
      )}
    </div>
  );
};

export default Profile;
