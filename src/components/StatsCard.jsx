"use client";
import React, { useEffect, useState } from "react";

const StatsCard = () => {
  const [stats, setStats] = useState({
    posts: null,
    followers: null,
    reach: null,
  });

  const fetchInstagramData = async () => {
    try {
      const response = await fetch("/api/instagram-stats");
      if (response.ok) {
        const data = await response.json();
        setStats({
          posts: data.media_count,
          followers: data.followers_count,
          reach: data.reach,
        });
      } else {
        console.error("Failed to fetch Instagram data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchInstagramData();
  }, []);

  return (
    <div className="w-64 h-20 z-50 relative  mx-auto font-qimano">
      <div className="flex justify-center items-center gap-20 text-smoke absolute -right-2  -bottom-1">
        <div className="flex flex-col">
          <h2 className="text-3xl text-center">
              {stats.posts !== null ? stats.posts : "N/A"}
            </h2>
          <p className="text-1xl">Posts</p>
        </div>

        <div className="flex flex-col">
          <h2 className="text-3xl text-center">{stats.followers !== null ? stats.followers : "N/A"}</h2>
          <p className="text-1xl">Followers</p>
        </div>

        <div className="flex flex-col">
          <h2 className="text-3xl text-center">{stats.reach !== null ? stats.reach : "N/A"}</h2>
          <p className="text-1xl">Reach</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
