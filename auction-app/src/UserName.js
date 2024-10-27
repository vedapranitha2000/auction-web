import React, { useState } from 'react';
import './UserName.css'; 

const UserName = ({ onSubmit }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(name);
    };

    return (
        <div className="username-container">
            <h2>Please enter your name:</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default UserName;
