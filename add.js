// authenticates you with the API standard library
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const event = context.params.event;
const member = event.member
const nickname = event.member.nick ?? context.params.event.author.username; // get nickname, if no nickname get username

let validMessage = `${process.env.V_MESSAGE_ID}`; // 'MESSAGE_ID'

if(event.emoji.name != process.env.V_EMOJI){ return } // if not the desired emoji, return

let validRole = `${process.env.V_ROLE_ID}`;
if (nickname == null) {nickname = member.user.username}

const regex = /^[A-Z][a-z]*+(([']?|[ ]?|[-]?)[A-z])*[ ][A-Z]([-][A-Z])?$/
let found = null // default to null
let message_content = ""

// match nickname to regex
try {found = nickname.match(regex)} // try to match the nickname to the regex
catch (e) {found = null} // if there was an error, say it didn't match it

// determine message content
if(found == null){ // if didn't match
  message_content = "Verification was unsuccessful. Please follow the instructions and try again. Contact the President if you believe this to be a mistake."
} else { // if did match
  message_content = "Verification was successful. Welcome to the club!"
}

if (context.params.event.message_id === validMessage && validRole) { // if is a valid message and role
  
  if(found != null){ // if matched regex
  
    await lib.discord.guilds['@0.1.0'].members.roles.update({ // verify user
      role_id: `${process.env.V_ROLE_ID}`,
      user_id: `${context.params.event.user_id}`,
      guild_id: `${context.params.event.guild_id}`
    });
  
  } // end of if found is null
  
  try{ // try to dm user
    await lib.discord.users['@0.1.3'].dms.create({ // message user
    recipient_id: context.params.event.member.user.id,
    content: message_content, // use message that was decided earlier
    });
  } catch (e) { // if can't, send error message
    await lib.discord.channels['@0.3.1'].messages.create({
      channel_id: process.env.BOT_CHANNEL_ID,
      content: `ERROR: Could not DM user.`
    });
  }
}
