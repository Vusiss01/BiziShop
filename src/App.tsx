import { Suspense, useEffect, useState } from "react";
import {
  useRoutes,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./home";
import Dashboard from "./features/dashboard/components/dashboard";
import Orders from "./features/orders/components/orders";
import Menu from "./features/menu/components/menu";
import Analytics from "./common/components/analytics";
import Messages from "./features/notifications/components/messages";
import Settings from "./features/settings/components/settings";
import Inventory from "./features/inventory/components/inventory";
import NotificationsPage from "./features/notifications/components/NotificationsPage";
import AddItemsScreen from "./features/inventory/components/AddItemsScreen";
import PaymentMethodScreen from "./components/PaymentMethodScreen";
import OrderConfirmationScreen from "./features/orders/components/OrderConfirmationScreen";
import AuthenticationScreen from "./features/authentication/components/AuthenticationScreen";
import RestaurantList from "./features/menu/components/RestaurantList";

import { hasAccess, UserRole } from "./lib/firebase";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ShopProvider } from "./contexts/ShopContext";
import routes from "tempo-routes";

// AppContent component that uses the Auth context
function AppContent() {
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;
  const { userRole, isLoading } = useAuth();
  const location = useLocation();

  // Protected route component
  const ProtectedRoute = ({
    element,
    path,
  }: {
    element: JSX.Element;
    path: string;
  }) => {
    // If still loading, show loading indicator
    if (isLoading) {
      return <p>Loading...</p>;
    }

    // If no user or role, redirect to auth
    if (!userRole) {
      return <Navigate to="/auth" replace />;
    }

    // Check if user has access to this route
    if (!hasAccess(userRole, path)) {
      // Redirect based on role
      if (userRole === "cashier") {
        return <Navigate to="/orders" replace />;
      } else if (userRole === "manager") {
        return <Navigate to="/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }

    return element;
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div>
        <Routes>
          <Route path="/auth" element={<AuthenticationScreen />} />
          <Route
            path="/"
            element={
              <Navigate to={userRole ? "/dashboard" : "/auth"} replace />
            }
          />
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route
            path="/protected-dashboard"
            element={
              <ProtectedRoute element={<Dashboard />} path="/dashboard" />
            }
          />
          <Route
            path="/orders"
            element={<ProtectedRoute element={<Orders />} path="/orders" />}
          />
          <Route
            path="/menu"
            element={<ProtectedRoute element={<Menu />} path="/menu" />}
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute element={<Analytics />} path="/analytics" />
            }
          />
          <Route
            path="/messages"
            element={<ProtectedRoute element={<Messages />} path="/messages" />}
          />
          <Route
            path="/settings"
            element={<ProtectedRoute element={<Settings />} path="/settings" />}
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute element={<Inventory />} path="/inventory" />
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute
                element={<NotificationsPage />}
                path="/notifications"
              />
            }
          />
          <Route
            path="/add-items"
            element={
              <ProtectedRoute element={<AddItemsScreen />} path="/add-items" />
            }
          />
          <Route
            path="/payment-method"
            element={
              <ProtectedRoute
                element={<PaymentMethodScreen />}
                path="/payment-method"
              />
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <ProtectedRoute
                element={<OrderConfirmationScreen />}
                path="/order-confirmation"
              />
            }
          />
          <Route
            path="/restaurants"
            element={
              <ProtectedRoute
                element={<RestaurantList />}
                path="/restaurants"
              />
            }
          />

        </Routes>
        {tempoRoutes}
      </div>
    </Suspense>
  );
}

// Main App component that provides the contexts
function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <AppContent />
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;
