// Require the Bolt package (github.com/slackapi/bolt)
import { App } from "@slack/bolt";
import config from "util/config";
import loadCommands from "util/commands";

const app = new App({
  token: config.slackBotToken,
  signingSecret: config.slackSigningSecret,
  endpoints: config.endpoints
});

// All the room in the world for your code
const messages = require("./assets/messages.json");

app.event("app_home_opened", async ({ event, context }) => {
  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    const result = await app.client.views.publish({
      /* retrieves your xoxb token from context */
      token: context.botToken,

      /* the user that opened your app's app home */
      user_id: event.user,

      /* the view object that appears in the app home*/
      view: {
        type: "home",
        callback_id: "home_view",

        /* body of the view */
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Welcome to your _App's Home_* :tada:"
            }
          },
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                "This button won't do much for now but you can set up a listener for it using the `actions()` method and passing its unique `action_id`. See an example in the `examples` folder within your Bolt app."
            }
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Click me!"
                }
              }
            ]
          }
        ]
      }
    });
  } catch (error) {
    console.error(error);
  }
});

app.command("/dumpling-pair", async ({ command, ack, say }) => {
  await ack();
  console.log(process.env.PAIRING_PASSWORD);
  if (command.text == process.env.PAIRING_PASSWORD) {
    const channelInfo = await app.client.conversations.members({
      token: process.env.SLACK_BOT_TOKEN,
      channel: "C019G0H312A"
    });
    const members = channelInfo["members"];
    const dumpling = await app.client.auth.test({
      token: process.env.SLACK_BOT_TOKEN
    });
    const dumplingID = dumpling["user_id"];

    members.splice(members.indexOf(dumplingID), 1);
    for (let i = members.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [members[i], members[j]] = [members[j], members[i]];
    }
    if (members.length > 1) {
      let a = 0;
      let b = 2;
      if (members.length % 2 == 1) {
        b = 3;
        const pairing = await app.client.conversations.open({
          token: process.env.SLACK_BOT_TOKEN,
          users: [...members.slice(a, b)].join()
        });
        //console.log(pairing);
        await app.client.chat.postMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: pairing["channel"]["id"],
          text: "ay yo"
        });
        a = 3;
        b += 2;
      }
      while (b <= members.length) {
        const pairing = await app.client.conversations.open({
          token: process.env.SLACK_BOT_TOKEN,
          users: [...members.slice(a, b)].join()
        });
        //console.log(pairing);
        await app.client.chat.postMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: pairing["channel"]["id"],
          blocks: messages.pairingMessage.blocks
        });
        a += 2;
        b += 2;
      }
    }
    await say(messages.weeklyMessage);
  }
});

app.message("weekly message", async ({ message, say }) => {
  console.log("weekly message");
  await say(messages.weeklyMessage);
});

app.message("welcome message", async ({ message, say }) => {
  await say(messages.welcomeMessage);
});

app.message("pairing message", async ({ message, say }) => {
  await say(messages.pairingMessage);
});

app.command("/dumpling-submit", async ({ command, ack, respond }) => {
  // Acknowledge command request
  await ack();
  //console.log(command);
  await respond({
    blocks: messages.submitWarning.blocks,
    response_type: "ephemeral"
  });
});

app.action("send_submit", async ({ body, ack, say, respond }) => {
  await ack();
  await say({
    blocks: [
      ...messages.submitMessage.blocks,
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            text: `<@${body.user.name}> clicked the button`,
            emoji: true
          }
        ]
      }
    ]
  });
  await respond({
    delete_original: true
  });
});

app.action("submit_points", async ({ body, ack, respond }) => {
  // Acknowledge the action
  await ack();
  //console.log(body)
  if (body.message.thread_ts != undefined) {
    const replies = await getReplies(body.channel.id, body.message.thread_ts);
    let attachedFiles = [];
    let hasNoFile = true;
    for (let i = 0; i < replies.messages.length; i++) {
      if (replies.messages[i].files != undefined) {
        attachedFiles = [
          ...attachedFiles,
          ...replies.messages[i].files.map(file => ({
            url: file.url_private,
            text:
              replies.messages[i].text === ""
                ? "No Text"
                : replies.messages[i].text
          }))
        ];
        hasNoFile = false;
      }
    }
    if (hasNoFile) {
      await replyMessage(
        body.channel.id,
        body.message.thread_ts,
        "Please reply with a file attachment!"
      );
    } else {
      const target = await app.client.conversations.members({
        token: process.env.SLACK_BOT_TOKEN,
        channel: body.actions[0].selected_conversation
      });
      let names = [];
      for (let i = 0; i < target.members.length; i++) {
        let member = await app.client.users.info({
          token: process.env.SLACK_BOT_TOKEN,
          user: target.members[i]
        });
        names.push(member.user.real_name);
      }
      await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: "G01B073BKC4",
        blocks: pointsFormat(names, attachedFiles)
      });
      await replyMessage(body.channel.id, body.message.thread_ts, "Submitted!");
    }
  } else {
    await replyMessage(
      body.channel.id,
      body.message.ts,
      "Please reply in thread!"
    );
  }
});

const pointsFormat = (members, files) => {
  console.log(members);
  let blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: members.toString()
      }
    }
  ];
  blocks = [
    ...blocks,
    ...files.map(file => ({
      type: "section",
      text: {
        type: "mrkdwn",
        text: file.text + ": " + "<" + file.url + "|Link>"
      }
    }))
  ];
  return blocks;
};

app.action("delete_message", async ({ body, ack, respond }) => {
  await ack();
  console.log(body);
  await respond({
    delete_original: true
  });
});

app.action("select_convo", async ({ body, ack, respond }) => {
  await ack();
  console.log(body);
});

async function replyMessage(id, ts, text) {
  try {
    const result = await app.client.chat.postMessage({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN,
      channel: id,
      thread_ts: ts,
      text: text
    });
  } catch (error) {
    console.error(error);
  }
}

async function getReplies(id, ts) {
  try {
    // Call the chat.postMessage method using the built-in WebClient
    const result = await app.client.conversations.replies({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN,
      channel: id,
      ts: ts
      // You could also use a blocks[] array to send richer content
    });
    return result;
    // Print result
    //console.log(result);
  } catch (error) {
    console.error(error);
  }
}

async function sendMessage(id, text) {
  try {
    // Call the chat.postMessage method using the built-in WebClient
    const result = await app.client.chat.postMessage({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN,
      channel: id,
      text: text,
      blocks: text.blocks
    });

    // Print result
    //console.log(result);
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
