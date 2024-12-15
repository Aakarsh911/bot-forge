import { NextResponse } from 'next/server';
import User from '../../../../models/user'; // Adjust the path if necessary
import { connectToDB } from '@/utils/database'; // Utility to connect to the MongoDB database

export async function POST(request, { params }) {
    const { userId, modelType } = params;

    try {
        // Connect to the database
        await connectToDB();

        // Fetch the user by ID from the MongoDB database
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Determine the amount of credits to reduce based on the modelType
        const creditsToReduce = modelType === 'image' ? 2 : 1;

        // Reduce the user's credits
        user.credits -= creditsToReduce;

        // Save the updated user back to the database
        await user.save();

        // Return the updated credits
        console.log(user.credits);
        return NextResponse.json({ credits: user.credits });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
