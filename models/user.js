import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  email: {
    type: String,
    unique: [true, 'Email already exists!'],
    required: [true, 'Email is required!'],
  },
  username: {
    type: String,
    required: [true, 'Username is required!'],
    match: [/^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/, "Username invalid, it should contain 8-20 alphanumeric letters and be unique!"]
  },
  image: {
    type: String,
  },
  bots: {
    type: [Schema.Types.ObjectId],
    ref: 'Bot',
  },
  credits: {
    type: Number,
    required: [true, 'Credits is required!'],
    default: 10,
  },
  paymentMethodId: { type: String, required: false }, // Stores Stripe PaymentMethod ID
  recurringPrice: { type: Number, required: false },
  stripeCustomerId: { type: String, default: null }
});

const User = models.User || model("User", UserSchema);

export default User;