import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import axios from "axios";
import "./EarnRewards.css";
import { FaGift, FaCreditCard } from "react-icons/fa";
import { RiCoinsFill } from "react-icons/ri";

const EarnRewards = () => {
  const [points, setPoints] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [claimedWays, setClaimedWays] = useState([]);

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00']
    });
  }, []);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/earnRewards/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
      setClaimedWays(res.data.filter(t => t.completed).map(t => t.name));
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Fetch total points
  const fetchPoints = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/earnRewards/points", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPoints(res.data.totalPoints || 0);
    } catch (err) {
      console.error("Error fetching points:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchPoints();
  }, []);

  // Complete a task
  const handleEarnPoints = async (task) => {
    if (claimedWays.includes(task.name)) {
      alert("You already claimed this reward!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/earnRewards/complete-task/${task.task_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPoints(prev => prev + task.points);
      setClaimedWays(prev => [...prev, task.name]);
      triggerConfetti();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error completing task");
    }
  };

  const rewards = [
    { id: 1, name: "Event Discount", icon: <FaGift size={32} />, cost: 100 },
    { id: 2, name: "VIP Pass", icon: <FaCreditCard size={32} />, cost: 200 },
  ];

  return (
    <div className="earnrewards-page">
      <h1 className="page-title">Earn Rewards</h1>

      {/* Points Card */}
      <div className="points-card">
        <div className="points-header">
          <RiCoinsFill className="points-icon" />
          <span>Your Points Balance</span>
        </div>
        <div className="points-display">{points}<span className="points-label">pts</span></div>
      </div>

      {/* Tasks to earn points */}
      <h2 className="section-title">Ways to Earn Points</h2>
      <div className="earn-options">
        {tasks.map(task => (
          <div
            key={task.task_id}
            className={`earn-option ${claimedWays.includes(task.name) ? "claimed" : ""}`}
            onClick={() => handleEarnPoints(task)}
          >
            <h3>{task.name}</h3>
            <p>{task.description}</p>
            <p className="points">+{task.points} pts</p>
            {claimedWays.includes(task.name) && <span className="claimed-badge">Claimed</span>}
          </div>
        ))}
      </div>

      {/* Available Rewards */}
      <h2 className="section-title">Available Rewards</h2>
      <div className="redeem-options">
        {rewards.map(reward => (
          <div className="reward-card" key={reward.id}>
            <div className="reward-icon">{reward.icon}</div>
            <h3>{reward.name}</h3>
            <p className="cost">{reward.cost} points</p>
            <button
              className={`redeem-btn ${points < reward.cost ? 'disabled' : ''}`}
              onClick={() => points >= reward.cost ? alert(`Redeemed ${reward.name}`) : null}
            >
              Redeem Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarnRewards;
