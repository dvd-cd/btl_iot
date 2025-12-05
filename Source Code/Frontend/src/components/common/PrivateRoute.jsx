const PrivateRoute = ({ children, roles }) => {
  const token = localStorage.getItem("accessToken");
  const role = (localStorage.getItem("role") || "").toString().toLowerCase(); // normalize role

  if (!token) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(role)) return <Navigate to="/login" replace />;

  return children;
};

export default PrivateRoute;
