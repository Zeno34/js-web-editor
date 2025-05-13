const express = require('express');
const { simpleGit } = require('simple-git');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize git
const git = simpleGit();

// Clone repository on server start
async function initializeGit() {
    try {
        await git.clone('https://git.company.com/persrm/code-sandbox', '.');
        console.log('Repository cloned successfully');
    } catch (error) {
        console.error('Error cloning repository:', error.message);
    }
}

// Git endpoints
app.post('/api/git/pull', async (req, res) => {
    try {
        const result = await git.pull();
        res.json({ success: true, message: 'Pull successful', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/git/commit', async (req, res) => {
    try {
        const { files } = req.body;
        if (!files || !Array.isArray(files)) {
            return res.status(400).json({ success: false, message: 'No files provided' });
        }

        // Add files to staging
        await git.add(files);
        
        // Commit with a fixed message
        const result = await git.commit('Update files via code editor');
        
        res.json({ success: true, message: 'Commit successful', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/git/push', async (req, res) => {
    try {
        const result = await git.push();
        res.json({ success: true, message: 'Push successful', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    initializeGit();
}); 