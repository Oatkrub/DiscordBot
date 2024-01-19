import axios from 'axios' ;
import {Client , IntentsBitField} from 'discord.js' 
import * as gemini from './gemini' 
const botId = "<@1196833012269191289>"
const client = new Client ({
    intents : [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent 
    ],
})
const errorMessage = "Your content is insensitive and you should be ashamed to send this kind of content"

client.on('ready' , (c)=> {
    console.log(`${c.user.tag} is online`) ;
})
//function to change image to binary
async function getBinaryImage (url:string) {
    return await axios.get(url, {
        responseType: 'arraybuffer'
    }).then(response =>response.data)

}
client.on('messageCreate' , async (message) => {
    // console.log(message.content) ;
    console.log(message) ;
    console.log("-----------") ;
    
    if (message.content.startsWith(botId)) {
        const msg = message.content.slice(botId.length) ;
        let msgReply = '' ;
        if (message.attachments.size != 0) {
            const urls= message.attachments.map((attach)=>{
                return attach.url ;
            }) ;
            for (let url of urls) {
                const imageBinary = await getBinaryImage(url) ;
                // if (msg == "") {
                //     msgReply += await gemini.multimodal(imageBinary,"จงบรรยายภาพนี้") ;
                // }
                // else {
                //     msgReply += await gemini.multimodal(imageBinary , msg) ;
                // }
                msgReply += await gemini.multimodal(imageBinary , msg ? msg:"จงบรรยายภาพนี้") ;
                try {
                    if (msgReply.length > 2000) {
                        const replyArray = msgReply.match(/[\s\S]{1,2000}/g);
                        replyArray!.forEach(async (msg) => {
                          await message.reply(msg);
                        });
                        return;
                      }
                  
                      await message.reply(msgReply);
                }
                catch(e) {
                    console.error(e) ;
                    await message.reply(errorMessage)
                }
            }
        }
        else {
            try {
                msgReply += await gemini.textOnly(msg) ;
                console.log(msgReply) ;
                if (msgReply.length > 2000) {
                    const replyArray = msgReply.match(/[\s\S]{1,2000}/g);
                    replyArray!.forEach(async (msg) => {
                      await message.reply(msg);
                    });
                    return;
                  }
              
                  await message.reply(msgReply);
            }
            catch (e) {
                console.error(e) ;
                // console.log("sending error message...")
                await message.reply(errorMessage) ;
            }
        }
    }
})
client.login(process.env.DISCORD_API_KEY) ;
