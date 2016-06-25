/**
 * Created by jakob on 25/06/16.
 */

var fetch = require('node-fetch');
var config = require('./config');
var FB = require('./facebook.action');

console.log("+++ Setting up Welcome Message +++");

const endpoint = "https://graph.facebook.com/v2.6/";
const params = "/thread_settings?access_token=";

var postcontent = generatePostContent();

const finalurl = endpoint + config.FB_PAGE_ID + params + config.FB_PAGE_TOKEN;

fetch(finalurl, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(postcontent)
    }
).then(function (res) {
    return res.json();
}).then(function (json) {
    if (json.result)
        console.log("\n" + json.result);
    if (json.error)
        console.error(json);
});

function generatePostContent() {

    /* Text only
     return {
     "setting_type": "call_to_actions",
     "thread_state": "new_thread",
     "call_to_actions": [
     {
     "message": {
     "text": "Welcome to my Bot!"
     }
     }
     ]
     };
     */

    return {
        "setting_type": "call_to_actions",
        "thread_state": "new_thread",
        "call_to_actions": [
            {
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [
                                FB.generatePayloadElement(
                                    "Welcome to my Bot",
                                    null,
                                    null,
                                    null,
                                    FB.generateActionButton("Say something funny", "CTA_SAY_FUNNY")
                                )
                            ]
                        }
                    }
                }
            }
        ]
    }
}