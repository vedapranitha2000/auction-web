import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Welcome from './Welcome';
import UserName from './UserName';
import items from './items';//static items

function App() {
    const [auctionItems, setAuctionItems] = useState(items); 
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startingBid, setStartingBid] = useState('');
    const [error, setError] = useState('');
    const [bids, setBids] = useState({});
    const [currentStep, setCurrentStep] = useState('welcome');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auction-items');
            setAuctionItems(prevItems => [...prevItems, ...response.data]);
        } catch (error) {
            console.error('Error fetching auction items:', error);
        }
    };

    const createItem = async () => {
        setError('');
        if (parseFloat(startingBid) <= 0) {
            setError('Starting bid must be a positive number.');
            return;
        }

        const itemData = {
            title,
            description,
            starting_bid: startingBid,
        };

        try {
            const response = await axios.post('http://localhost:5000/api/auction-items', itemData);
            setAuctionItems([...auctionItems, response.data]);
            setTitle('');
            setDescription('');
            setStartingBid('');
        } catch (error) {
            console.error('Error creating auction item:', error);
            setError('Failed to create auction item. Please try again.');
        }
    };

    const handleBidChange = (itemId, field, value) => {
        setBids(prevBids => ({
            ...prevBids,
            [itemId]: {
                ...prevBids[itemId],
                [field]: value,
            },
        }));
    };

    const placeBid = async (itemId) => {
        const { bidderName, bidAmount } = bids[itemId] || {};
        if (!bidderName || !bidAmount) {
            setError('Please enter your name and bid amount.');
            return;
        }

        const bidValue = parseFloat(bidAmount);
        const startingBidValue = parseFloat(auctionItems.find(item => item.id === itemId)?.starting_bid || 0);
        if (bidValue <= startingBidValue) {
            setError('Bid must be greater than the starting bid.');
            return;
        }

        setAuctionItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, current_bid: bidValue, last_bidder: bidderName } : item
            )
        );

        console.log(`Bid placed by ${bidderName} for item ${itemId}: $${bidAmount}`);
        setBids(prevBids => ({
            ...prevBids,
            [itemId]: { bidderName: '', bidAmount: '' },
        }));
    };

    const handleStart = () => {
        setCurrentStep('username');
    };

    const handleNameSubmit = (name) => {
        setUserName(name);
        setCurrentStep('auction');
    };

    return (
        <div>
            {currentStep === 'welcome' && <Welcome onStart={handleStart} />}
            {currentStep === 'username' && <UserName onSubmit={handleNameSubmit} />}
            {currentStep === 'auction' && (
                <div>
                    <h1>
                        Hello <span className="username">{userName}</span>,
                    </h1>
                    <h2>Welcome to our auction page, you can add new items or browse through existing bids</h2>
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    <form onSubmit={e => { e.preventDefault(); createItem(); }}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Starting Bid"
                            value={startingBid}
                            onChange={e => setStartingBid(e.target.value)}
                            required
                        />
                        <button type="submit">Create Auction Item</button>
                    </form>
                    <div className="grid-container">
                        {auctionItems.map(item => (
                            <div className="grid-item" key={item.id}>
                                <h2>{item.title}</h2>
                                <p>{item.description}</p>
                                <p>Minimum Bid: ${item.starting_bid}</p>
                                <p>Current Bid: ${item.current_bid || 0}</p>
                                <p>Last Bidder: {item.last_bidder || 'No bids yet'}</p>
                                
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={bids[item.id]?.bidderName || ''}
                                    onChange={e => handleBidChange(item.id, 'bidderName', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Bid Amount"
                                    value={bids[item.id]?.bidAmount || ''}
                                    onChange={e => handleBidChange(item.id, 'bidAmount', e.target.value)}
                                />
                                <button onClick={() => placeBid(item.id)}>Place Bid</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
