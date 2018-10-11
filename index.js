/*
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Copyright © 2018 Lucas van Beek
*/
const Discord = require('discord.js');
const client = new Discord.Client();
const pinger = require('minecraft-pinger');
const config = require('./config.json');
const ownerID = "265189540652777474";

function onlineSpelers() {
    pinger.ping('play.craftville.nl', 25565, (error, result) => {
        if (error) return console.error(error)
        client.user.setActivity(`${result.players.online} spelers`, {
            type: "WATCHING"
        });
        console.log(`ping done, ${result.players.online} spelers online`)
    })
}
setInterval(onlineSpelers, 300 * 1000);

function random() {
    var rand = ['Ja', 'Nee', 'Wat denk je zelf?', 'Ehh nee duhhuh', 'Misschien', 'Nooit', 'Natuurlijk', 'Ik heb geen flauw idee!', 'Ehh misschien weet de staff het? 😅'];
    return rand[Math.floor(Math.random() * rand.length)]
}

function clean(text) {
    if (typeof(text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else return text
}

client.on("ready", () => {
    console.log("Bot is opgestart!");
    onlineSpelers()
});

client.on("guildMemberAdd", async member => {
    const channel = member.guild.channels.get("463368756773781541");
    channel.send(`Welkom ${member}, leuk dat je ons Discord platform bent gejoind.🎉 Ben je ook al verhuisd naar Craftville?🏙`)
});

client.on("guildMemberRemove", async member => {
    const channel = member.guild.channels.get("463368756773781541");
    channel.send(`Jammer dat je weg bent gegaan **${member.user.tag}**, we hopen je in de toekomst weer te zien!👋🏼`)
});

client.on("message", async message => {
    if (message.channel.id == '448549939262390292' || message.channel.id == '463422456519065610') {
        console.log(`Nieuw idee door ${message.author.tag} | Channel: ${message.channel.name} | Idee: ${message.content}`);
        await message.react('👍');
        await message.react('👎')
    }
    if (message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (command === "server") {
        pinger.ping('play.craftville.nl', 25872, (error, result) => {
            if (error) return console.error(error)
            onlineSpelers();
            const embed = new Discord.RichEmbed().addField('IP', 'play.craftville.nl', !0).addField('Versie', '1.9 t/m 1.12.2', !0).addField('Online spelers', `${result.players.online} spelers`, !0).setTitle('Craftville Server').setColor(0x6fa5fc).setFooter('Copyright © 2018 Lucas van Beek').setTimestamp();
            message.channel.send({
                embed: embed
            });
        })
    }
    if (command === "vraagvanvandaag") {
        if (!args[0]) return message.reply('Ik zie geen vraag! 👀');
        message.channel.send(random());
    }
    if (command === "verzoekidee") {
        const user = message.guild.members.get(ownerID);
        if (!args[0]) return message.author.send('Je moet wel een idee achterlaten!')
        message.delete();
        const idee = args.join(" ");
        const embed = new Discord.RichEmbed().addField('Idee', `${idee}`).addField('Bedenker', `<@${message.author.id}>`);
        user.send({
            embed: embed
        });
        const embed2 = new Discord.RichEmbed().setTitle('Idee').addField('Je ingestuurde idee', `${idee}`).addField('Heb je vragen of opmerkingen?', 'Contacteer ClassicGamerNL#2018 (<@265189540652777474>)').setFooter('Copyright © ClassicGamerNL').setTimestamp();
        message.author.send({
            embed: embed2
        });
        console.log(`${message.author.tag} heeft het idee "${idee}" ingezonden!`)
    }
});

client.on("message", message => {
    const args = message.content.split(" ").slice(1);
    if (message.content.startsWith(config.prefix + "eval")) {
        if (message.author.id !== ownerID) return;
        try {
            const code = args.join(" ");
            let evaled = eval(code);
            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);
            message.channel.send(clean(evaled), {
                code: "xl"
            })
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
        }
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(`Uncaught error in`, promise)
});
client.login(config.token)
