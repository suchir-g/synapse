import React from "react";
import Dashboard from "./Dashboard";
const Home = ({ isAuth }) => {
  return (
    <div>
      <div>Home</div>
      {/* Renders the dashboard if auth */}
      {isAuth && <Dashboard isAuth={isAuth} />}
    </div>
  );
};

export default Home;
