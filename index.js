require('dotenv').config();
const { Client } = require('discord.js');
const client = new Client();

client.login(process.env.BOT_TOKEN);

client.on('ready', () => console.log(`${client.user.tag} has logged in.`));

const usersMap = new Map();

const LIMIT = 10;
const TIME = 10000;
const DIFF = 2000;

/*
'id' => {
    msgCount: 0,
    lastMessage:'message',
    timer: fn()
}
*/

client.on('message', message => {
    if (message.author.bot) return;

    if (usersMap.has(message.author.id)) {
        const userData = usersMap.get(message.author.id);
        const { lastMessage, timer } = userData;
        const difference = message.createdTimestamp - lastMessage.createdTimestamp;
        let msgCount = userData.msgCount;
        console.log(difference);
        if (difference > DIFF) {
            clearTimeout(timer);
            console.log('Cleared timeout');
            userData.msgCount = 1;
            userData.lastMessage = message;
            userData.timer = setTimeout(() => {
                usersMap.delete(message.author.id);
                console.log('Removed from RESET.');
            }, TIME);
            usersMap.set(message.author.id, userData);
        }
        else {
            ++msgCount;
            if (parseInt(msgCount) === LIMIT) {
                const role = message.guild.roles.cache.get('825553281601634314'); // change this id to your muted role id
                message.member.roles.add(role);
                message.channel.send('You have been muted for spamming.');
                setTimeout(() => {
                    message.member.roles.remove(role);
                    console.log('User has been unmuted')
                }, TIME);
            } else {
                userData.msgCount = msgCount;
                usersMap.set(message.author.id, userData);
            }
        }
    }
    else {
        let fn = setTimeout(() => {
            usersMap.delete(message.author.id);
            console.log('Removed from map');
        }, TIME);
        usersMap.set(message.author.id, {
            msgCount: 1,
            lastMessage: message,
            timer: fn
        });
    }

});