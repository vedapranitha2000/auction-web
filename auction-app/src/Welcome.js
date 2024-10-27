import React from 'react';
import './Welcome.css';

const Welcome = ({ onStart }) => {
    return (
        <div className="welcome-container">
            <h1>Your Gateway to Extraordinary Finds</h1>
            <button className="get-started" onClick={onStart}>Get Started {'>'}</button>
        </div>
    );
};

export default Welcome;
