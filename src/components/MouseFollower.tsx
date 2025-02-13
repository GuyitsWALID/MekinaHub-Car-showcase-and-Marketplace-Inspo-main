import React, { useEffect, useState } from 'react';

export default function MouseFollower() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trails, setTrails] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: { clientX: any; clientY: any; }) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Add a new trail
      setTrails((prevTrails) => [
        ...prevTrails,
        { x: e.clientX, y: e.clientY, id: Math.random() },
      ]);

      // Remove old trails
      setTimeout(() => {
        setTrails((prevTrails) => prevTrails.slice(1));
      }, 100);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Main Cursor Follower */}
      <div
        className="mouse-follower"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />

      {/* Cursor Trail Effect */}
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="follower-trail"
          style={{ left: `${trail.x}px`, top: `${trail.y}px` }}
        />
      ))}
    </>
  );
}
