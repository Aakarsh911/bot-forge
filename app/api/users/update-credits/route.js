import { getSession } from 'next-auth/react';
import User from '../../../../models/user'; // Adjust the path to your User model
import { connectToDB } from '@/utils/database'; // Ensure the database connection is handled

export const POST = async (req) => {
  try {
    // Parse the JSON request body
    const body = await req.json(); 
    // Get the session to identify the user
   

    // Connect to the database
    await connectToDB();

    // Extract the amount from the request body
    const { amount , userId } = body;
    const updatedCredit = parseInt(amount)/0.03;
    if (!amount || isNaN(amount)) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update the user's credits (for simplicity, we're just adding the amount here)
    user.credits = (user.credits || 0) + updatedCredit; // Convert amount to integer and update credits

    // Save the updated user to the database
    await user.save();

    return new Response(
      JSON.stringify({
        message: 'Credits updated successfully',
        credits: user.credits,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating credits:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
