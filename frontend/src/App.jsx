import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux"; // or your auth context
import Header from "./components/Header";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Expenses from "./pages/Expenses";
import Friends from "./pages/Friends";
import ShareExpense from "./pages/ShareExpenses";
import ShareExpenses from "./pages/ShareExpenses";

function AppContent() {
  const location = useLocation();

  // Get login state from redux (adjust if you're using context)
  const { isLoggedIn } = useSelector((state) => state.auth);

  // Hide header on login/signup pages
  const hideHeaderRoutes = ["/login", "/signup"];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideHeader && <Header />}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Root route → show Home if logged in, otherwise Login */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <PrivateRoute>
              <Expenses />
            </PrivateRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <PrivateRoute>
              <Friends />
            </PrivateRoute>
          }
        />
        <Route
          path="/shared-expense"
          element={
            <PrivateRoute>
              <ShareExpenses />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
