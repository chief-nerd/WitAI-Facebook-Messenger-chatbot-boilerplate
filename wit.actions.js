module.exports = {
    say(sessionId, context, message, cb) {
        // Our bot has something to say!
        const recipientId = sessions[sessionId].fbid;
        if (recipientId) {
            // Yay, we found our recipient!
            // Let's forward our bot response to her.
            fbMessage(recipientId, message, (err, data) => {
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

    merge(sessionId, context, entities, message, cb) {

        for (var k in entities) {
            const value = firstEntityValue(entities, k);
            if (value) {
                context[k] = value;
            }
        }

        console.log("Context after merge", context);
        cb(context);
    },
    error(sessionId, context, error) {
        console.log(error.message);
    },

    //Add your own functions HERE
};

// Helper function to get the first message
const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] &&
            Array.isArray(entities[entity]) &&
            entities[entity].length > 0 &&
            entities[entity][0].value
        ;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};