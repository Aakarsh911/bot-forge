import { NextResponse } from 'next/server';
import User from '@/models/User'; // Adjust the path if necessary
import { connectToDB } from '@/utils/database'; // Utility to connect to the MongoDB database

export async function GET(request, { params }) {
    const { userId } = params;

    try {
        // Connect to the database
        await connectToDB();

        // Fetch the user by ID from the MongoDB database
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get user's credits
        console.log('User:', user);
        const credits = user.credits;
        console.log('User credits:', user.credits);
        return NextResponse.json({  credits });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
