import { connectToDB } from '@/utils/database';
import User from '../../../../models/user';

// Named export for the GET method
export async function GET(req, { params }) {
    const { userId } = params;

    try {
        // Connect to the database
        await connectToDB();

        // Fetch the user from the database
        const user = await User.findById(userId);

        if (!user) {
            // If user not found, return 404
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        // Get the recurringPrice field; default to 0 if it does not exist
        const recurringPrice = user.recurringPrice || 0;

        // Return the recurring price
        return new Response(JSON.stringify({ recurringPrice }), { status: 200 });
    } catch (error) {
        console.error('Error fetching recurring price:', error);
        // Return a 500 status if something goes wrong
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
