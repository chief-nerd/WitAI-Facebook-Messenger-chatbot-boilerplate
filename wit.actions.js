'use strict';

const async = require('async');
const FB = require("./facebook.action");

module.exports = {
    say(recipientId, context, message, cb) {

        if (recipientId) {
            // Yay, we found our recipient!
            // Let's forward our bot response to her.
            FB.sendText(recipientId, message, (err, data) => {
                if (err) {
                    console.log(
                        'Oops! An error occurred while forwarding the response to',
                        recipientId,
                        ':',
                        err
                    );
                }
                // Let's give the wheel back to our bot
                cb();
            });
        } else {
            console.log('Oops! Couldn\'t find user for session:', sessionId);
            // Giving the wheel back to our bot
            cb();
        }
    },

    merge(recipientId, context, entities, message, cb) {

        async.forEachOf(entities, (entity, key, cb) => {
            const value = firstEntityValue(entity);
            //console.error("Result", key, value);
            if (value != null && (context[key] == null || context[key] != value)) {

                switch (key) {
                    default:
                        cb();
                }
            }
            else
                cb();

        }, (error) => {
            if (error) {
                console.error(error);
            } else {
                console.log("Context after merge:\n", context);
                cb(context);
            }
        });
    },
    error(recipientId, context, error) {
        console.log(error.message);
    },

    /**** Add your own functions HERE ******/
};

// Helper function to get the first message
const firstEntityValue = (entity) => {
    const val = entity && Array.isArray(entity) &&
            entity.length > 0 &&
            entity[0].value
        ;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};
