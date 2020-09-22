import { config } from 'dotenv'

export default {
    slackSigningSecret: process.env.SLACK_SIGNING_SECRET,
    slackBotToken: process.env.SLACK_BOT_TOKEN,
    port: process.env.PORT || 3000,
    endpoints: {
        events: "/slack/events",
        submit: "/slack/dumpling-submit",
        pair: "/slack/dumpling-pair",
        welcome: "/slack/dumpling-welcome",
        points: "slack/dumpling-points"
    }
}