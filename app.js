// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});



// All the room in the world for your code
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
  await say({
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "This is your weekly scheduled #dumpling-dates notice!"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "For the uninitiated, every week, I pair random people up in this channel to go out and ~ *_bond_* ~. If you want more information about this app, take a look at the pinned message! If you want to help grow the workspace and develop apps like this, join the #workspace-development channel!"
			},
			"accessory": {
				"type": "image",
				"image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
				"alt_text": "cute cat"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "A direct message group with your new pairing (or trio!) should have already been sent! If you want ideas for what to do this week, or want to submit your dumpling-date for dumpling-points, you can do so in the direct message group!"
			}
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "image",
					"image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
					"alt_text": "cute cat"
				},
				{
					"type": "mrkdwn",
					"text": "*Jerry* has approved this message."
				}
			]
		}
	]
})
});

app.message('welcome message', async({message, say}) => {
  await say({
	"blocks": [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": "Welcome to Dumpling Dates!",
				"emoji": true
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Welcome to CSA's #dumpling-dates, the healthier, 100% CSA developed alternative to the widely used Slack donut app! The purpose of #dumpling-dates is to connect different members of CSA and allow us to meet new friends! If you want to see the code for this project, go to <https://github.com/Fattimo/dumpling-dates/tree/glitch|the link here>"
			}
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "plain_text",
					"text": "To aid in the development of apps like me, join the #workspace-development channel",
					"emoji": true
				}
			]
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Every week, I will pair up two people in this channel randomly by shooting them a direct message. In that direct message, I'll provide a couple of resources: there will be a link to a growing Google doc with a list of sample activities, as well as a button that will ask a random fun question to get the conversation started!"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "To sweeten the deal of dumpling dates even more, I will also be keeping track of the number of completed dumpling dates for everyone in the organization! For every dumpling date you go on, you will recieve a dumpling point, which can be traded in for fantastic prizes (coming soon!)! If you want to see a leaderboard of the people who have gone on the most dumpling dates, just type the command '/leaderboard' in the chat!"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "image",
					"image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
					"alt_text": "cute cat"
				},
				{
					"type": "mrkdwn",
					"text": "*Jerry* says go on a dumpling date."
				}
			]
		}
	]
})
});

app.message('direct message', async({message, say}) => {
  await say({
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Hello @X and @Y! Welcome to your dumpling date! I am here to help you guys get to know each other better! Now that we're here, consider setting a date to meet up!"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "If you need a random conversation starter, click the button to the right!"
			},
			"accessory": {
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": "Click Me",
					"emoji": true
				},
				"value": "click_me_123"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "<https://docs.google.com/document/d/1giWgy7TTf0t7c_65nG0biM22HB_XSuHc16qfHAHAbuc/edit|This is a link> to a Google doc with a list of sample activities! Once you've completed your donut date for the week, just reply in thread to this message with an image of a selfie of your meetup so I can log your dumpling points! If you don't get a response from me right away, I probably broke somewhere, so fill out <google.com|the backup form here.>"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "image",
					"image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
					"alt_text": "cute cat"
				},
				{
					"type": "mrkdwn",
					"text": "*Jerry* says enjoy your date!"
				}
			]
		}
	]
})
});


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
