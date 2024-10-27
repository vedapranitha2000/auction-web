const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const db = new sqlite3.Database(':memory:');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize DB
db.serialize(() => {
    db.run("CREATE TABLE auction_items (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, starting_bid REAL, current_bid REAL, image TEXT)");
});


// Place a bid
app.post('/api/auction-items/:id/bid', (req, res) => {
    const itemId = req.params.id;
    const { bidderName, bidAmount } = req.body;

    db.get("SELECT * FROM auction_items WHERE id = ?", [itemId], (err, item) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!item) return res.status(404).json({ error: "Item not found." });

        if (parseFloat(bidAmount) > item.current_bid) {
            db.run("UPDATE auction_items SET current_bid = ?, last_bidder = ? WHERE id = ?", [bidAmount, bidderName, itemId], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(200).json({ message: "Bid placed successfully." });
            });
        } else {
            res.status(400).json({ error: "Bid must be greater than the current bid." });
        }
    });
});

// Get all auction items
app.get('/api/auction-items', (req, res) => {
    db.all("SELECT * FROM auction_items", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
