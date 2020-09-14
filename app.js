// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});



// All the room in the world for your code
import messages from "./assets/messages.json"

app.event('app_home_opened', async ({ event, context }) => {
  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    const result = await app.client.views.publish({

      /* retrieves your xoxb token from context */
      token: context.botToken,

      /* the user that opened your app's app home */
      user_id: event.user,

      /* the view object that appears in the app home*/
      view: {
        type: 'home',
        callback_id: 'home_view',

        /* body of the view */
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Welcome to your _App's Home_* :tada:"
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "This button won't do much for now but you can set up a listener for it using the `actions()` method and passing its unique `action_id`. See an example in the `examples` folder within your Bolt app."
            }
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "Click me!"
                }
              }
            ]
          }
        ]
      }
    });
  }
  catch (error) {
    console.error(error);
  }
});

app.message('make pairings', async({message, say}) => {
  const channelInfo = await app.client.conversations.members({
    token: process.env.SLACK_BOT_TOKEN, 
    channel: 'C019G0H312A', 
  })
  const members = channelInfo["members"]
  const dumpling = await app.client.auth.test({token: process.env.SLACK_BOT_TOKEN})
  const dumplingID = dumpling["user_id"]
  
  members.splice(members.indexOf(dumplingID), 1)
  for (let i = members.length - 1; i > 0; i--) {
	const j = Math.floor(Math.random() * (i + 1));
	[members[i], members[j]] = [members[j], members[i]];
  }
  if (members.length > 1) {
    let a = 0
    let b = 2
    if (members.length % 2 == 1) {
      b = 3
      const pairing = await app.client.conversations.open({
        token: process.env.SLACK_BOT_TOKEN,
        users: [...members.slice(a, b)].join(),
      })
      console.log(pairing)
      await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: pairing["channel"]["id"],
        text: "ay yo"
      })
      a = 3
      b += 2
    }
    while (b <= members.length) {
      const pairing = await app.client.conversations.open({
        token: process.env.SLACK_BOT_TOKEN,
        users: [...members.slice(a, b)].join(),
      })
      console.log(pairing)
      await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: pairing["channel"]["id"],
        text: "ay yo"
      })
      a+=2
      b+=2
    }
  }
  await say("dump")
});

app.message('weekly message', async({message, say}) => {
  await say(messages.weeklyMessage)
});

app.message('welcome message', async({message, say}) => {
  await say(messages.welcomeMessage)
});

app.message('pairing message', async({message, say}) => {
  await say(messages.pairingMessage)
});


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
