import { connectToDB } from '@/utils/database';
import User from '../../../../../models/user';

// Named export for the DELETE method
export async function DELETE(req, { params }) {
    const { userId } = params;

    try {
        // Connect to the database
        await connectToDB();

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            // If user not found, return 404
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        // Update the recurringPrice field to 0
        user.recurringPrice = 0;
        await user.save();

        // Return success response
        return new Response(JSON.stringify({ message: 'Subscription cancelled successfully.' }), { status: 200 });
    } catch (error) {
        console.error('Error cancelling subscription:', error);

        // Return error response
        return new Response(
            JSON.stringify({ error: 'Failed to cancel subscription. Please try again later.' }),
            { status: 500 }
        );
    }
}
