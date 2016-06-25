/**
 * Created by jakob on 25/06/16.
 */

var fetch = require('node-fetch');
var config = require('./config');
var FB = require('./facebook.action');

console.log("+++ Setting up Welcome Message +++");

const endpoint = "https://graph.facebook.com/v2.6/";
const params = "/thread_settings?access_token=";

const postcontent = (generatePostContent());
console.log(postcontent);

fetch(endpoint + config.FB_PAGE_ID + params + config.FB_PAGE_TOKEN, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(postcontent)
    }
).then(function (res) {
    return res.json();
}).then(function (json) {
    console.log(json);
});

function generatePostContent() {

    return {
        "setting_type": "call_to_actions",
        "thread_state": "new_thread",
        "call_to_actions": [
            {
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": FB.generatePayloadElement("Welcome", null, null, null, [
                            FB.generateActionButton("Say something funny", "CTA_SAY_FUNNY"),
                        ])
                    }
                }
            }
        ]
    }
}