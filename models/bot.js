import { Schema, model, models } from 'mongoose';

const BotSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required!'],
    },
    widgetColor: {
        type: String,
        required: [true, 'Widget Color is required!'],
    },
    widgetLogo : {
        type: String,
        required: [true, 'Widget Logo is required!'],
    },
    prompt: {
        type: String,
        required: [true, 'Prompt is required!'],
    },
    visiblePrompt: {
        type: String,
        required: [true, 'Visible Prompt is required!'],
    },
    predefinedPrompts: {
        type: Map,
        of: String,
    },
    botResponseColor: {
        type: String,
        required: [true, 'Bot Response Color is required!'],
    },
    userResponseColor: {
        type: String,
        required: [true, 'User Response Color is required!'],
    },
    botTypingColor: {
        type: String,
        required: [true, 'Bot Typing Color is required!'],
    },
    API_URLs: {
        type: [[String]],
    },
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
    },
});

const Bot = models.Bot || model("Bot", BotSchema);

export default Bot;