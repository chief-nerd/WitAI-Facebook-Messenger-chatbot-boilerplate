'use strict';

const config = require('./config');
const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const Wit = require('node-wit').Wit;

// Webserver parameter
const PORT = process.env.PORT || 3000;

// Messenger API parameters
if (!config.FB_PAGE_ID) {
    throw new Error('missing FB_PAGE_ID');
}
if (!config.FB_PAGE_TOKEN) {
    throw new Error('missing FB_PAGE_TOKEN');
}

// Messenger API specific code

// See the Send API reference
// https://developers.facebook.com/docs/messenger-platform/send-api-reference
const fbReq = request.defaults({
    uri: 'https://graph.facebook.com/me/messages',
    method: 'POST',
    json: true,
    qs: {access_token: config.FB_PAGE_TOKEN},
    headers: {'Content-Type': 'application/json'},
});

const fbMessage = (recipientId, msg, cb) => {
    const opts = {
        form: {
            recipient: {
                id: recipientId,
            },
            message: {
                text: msg,
            },
        },
    };
    fbReq(opts, (err, resp, data) => {
        if (cb) {
            cb(err || data.error && data.error.message, data);
        }
    });
};

// See the Webhook reference
// https://developers.facebook.com/docs/messenger-platform/webhook-reference
const getFirstMessagingEntry = (body) => {
    const val = body.object == 'page' &&
            body.entry &&
            Array.isArray(body.entry) &&
            body.entry.length > 0 &&
            body.entry[0] &&
            body.entry[0].id == config.FB_PAGE_ID &&
            body.entry[0].messaging &&
            Array.isArray(body.entry[0].messaging) &&
            body.entry[0].messaging.length > 0 &&
            body.entry[0].messaging[0]
        ;
    return val || null;
};

// Wit.ai bot specific code

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};

const findOrCreateSession = (fbid) => {
    if (!fbid in sessions) {
        sessions[fbid] = {context: {}};
    }
    return fbid;
};

// Import our bot actions and setting everything up
const actions = require('./wit.actions');
const wit = new Wit(config.WIT_TOKEN, actions);

// Starting our webserver and putting it all together
const app = express();
app.set('port', PORT);
app.listen(app.get('port'));
app.use(bodyParser.json());

// Webhook setup
app.get('/', (req, res) => {
    if (!config.FB_VERIFY_TOKEN) {
        throw new Error('missing FB_VERIFY_TOKEN');
    }
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.sendStatus(400);
    }
});

// Message handler
app.post('/', (req, res) => {
    // Parsing the Messenger API response
    const messaging = getFirstMessagingEntry(req.body);
    if (messaging && messaging.message && messaging.recipient.id === config.FB_PAGE_ID) {
        // Yay! We got a new message!

        // We retrieve the Facebook user ID of the sender
        const sender = messaging.sender.id;

        // We retrieve the user's current session, or create one if it doesn't exist
        // This is needed for our bot to figure out the conversation history
        const sessionId = findOrCreateSession(sender);

        // We retrieve the message content
        const msg = messaging.message.text;
        const atts = messaging.message.attachments;

        if (atts) {
            // We received an attachment

            // Let's reply with an automatic message
            fbMessage(
                sender,
                'Sorry I can only process text messages for now.'
            );
        } else if (msg) {
            // We received a text message

            // Let's forward the message to the Wit.ai Bot Engine
            // This will run all actions until our bot has nothing left to do
            wit.runActions(
                sessionId, // the user's current session
                msg, // the user's message
                sessions[sessionId].context, // the user's current session state
                (error, context) => {
                    if (error) {
                        console.log('Oops! Got an error from Wit:', error);
                    } else {
                        // Our bot did everything it has to do.
                        // Now it's waiting for further messages to proceed.
                        console.log('Waiting for futher messages.');

                        // Based on the session state, you might want to reset the session.
                        // This depends heavily on the business logic of your bot.
                        // Example:
                        // if (context['done']) {
                        //   delete sessions[sessionId];
                        // }

                        // Updating the user's current session state
                        sessions[sessionId].context = context;
                    }
                }
            );
        }
    }
    res.sendStatus(200);
});