import React from "react";
import Dashboard from "./Dashboard";
const Home = ({ isAuth }) => {
  return (
    <div>
      {/* renders the dashboard if auth */}
      <div className="text-3xl font-bold underline">ddd</div>
      {isAuth && <Dashboard isAuth={isAuth} />}
    </div>
  );
};

export default Home;
