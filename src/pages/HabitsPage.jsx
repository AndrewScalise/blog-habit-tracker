// Page for habit tracking feature
import React from "react";
import Layout from "../components/layout/Layout";
import HabitTracker from "../components/habits/HabitTracker";

const HabitsPage = () => {
  return (
    <Layout>
      <HabitTracker />
    </Layout>
  );
};

export default HabitsPage;
