import { Schema, model, models } from 'mongoose';

// Define the schema for parameters within API_URLs
const ParameterSchema = new Schema({
    key: { type: String },
    value: { type: String }
});

// Define the schema for API_URLs
const APISchema = new Schema({
    id: { type: String, required: true }, // Changed to String, as IDs are typically strings in databases
    when: { type: String, required: true },
    apiEndpoint: { type: String, required: true },
    parameters: [ParameterSchema]
});

// Define the main BotSchema
const BotSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required!'],
    },
    widgetColor: {
        type: String,
        required: [true, 'Widget Color is required!'],
    },
    widgetLogo: {
        type: String,
        required: [true, 'Widget Logo is required!'],
    },
    prompt: {
        type: String,
    },
    visiblePrompt: {
        type: String,
        required: [true, 'Visible Prompt is required!'],
    },
    predefinedPrompts: {
        type: Map,
        of: String,
    },
    botBubbleColor: {
        type: String,
        required: [true, 'Bot Response Color is required!'],
    },
    botTextColor: {
        type: String,
        required: [true, 'Bot Text Color is required!'],
    },
    userBubbleColor: {
        type: String,
        required: [true, 'User Response Color is required!'],
    },
    userTextColor: {
        type: String,
        required: [true, 'User Text Color is required!'],
    },
    botTypingColor: {
        type: String,
        required: [true, 'Bot Typing Color is required!'],
    },
    chatBackgroundColor: {
        type: String,
        required: [true, 'Chat Background Color is required!'],
    },
    botTypingTextColor: {
        type: String,
        required: [true, 'Bot Typing Text Color is required!'],
    },
    botHeaderBackgroundColor: {
        type: String,
        required: [true, 'Bot Header Background Color is required!'],
    },
    botHeaderTextColor: {
        type: String,
        required: [true, 'Bot Header Text Color is required!'],
    },
    API_URLs: [APISchema], // Update here to use the new API Schema
    botPosition: {
        type: String,
        required: [true, 'Bot Position is required!'],
    },
    modelType: {
        type: String,
        required: [true, 'Type is required!'],
    },
    closeButtonColor: {
        type: String,
        required: [true, 'Close Button Color is required!'],
    },
    endMessageRating: {
        type: [Number],
    }
});

const Bot = models.Bot || model("Bot", BotSchema);

export default Bot;
