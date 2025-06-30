import React from 'react';

const BoltBadge: React.FC = () => {
  return (
    <a href="https://bolt.new" target="_blank" rel="noopener noreferrer">
      <img 
        src="https://github.com/kickiniteasy/bolt-hackathon-badge/raw/main/src/public/bolt-badge/white_circle_360x360/white_circle_360x360.png"
        alt="Built with Bolt"
        className="bolt-badge bolt-badge-bottom-left"
      />
    </a>
  );
};

export default BoltBadge; 