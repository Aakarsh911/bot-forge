// /pages/api/users/update-credits.js

import { getSession } from 'next-auth/react';
import User from '@/models/User'; // Adjust the path to your User model
import { connectToDB } from '@/utils/database'; // Ensure the database connection is handled

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Get the session to identify the user
        const session = await getSession({ req });

        if (!session) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Connect to the database
        await connectToDB();

        // Extract the amount from the request body
        const { amount } = req.body;

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Find the user by their email from the session
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the user's credits (for simplicity, we're just adding the amount here)
        user.credits = (user.credits || 0) + parseInt(amount, 10); // Convert amount to integer and update credits

        // Save the updated user to the database
        await user.save();

        return res.status(200).json({ message: 'Credits updated successfully', credits: user.credits });
    } catch (error) {
        console.error('Error updating credits:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
