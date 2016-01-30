/*
 * inebriated: the original edition
 * code resurrected and originally coded by eta
 */
var dict = {};
var keys = [];
var irc = require('irc');
var fs = require('fs');
var Markov = require('./markov.js');
var moment = require('moment');

console.log('inebriated: starting');
dict = JSON.parse(String(fs.readFileSync('./dict.json')));
keys = JSON.parse(String(fs.readFileSync('./keys.json')));
console.log('loaded ' + keys.length + ' keys and ' + Object.keys(dict).length + ' dict entries from markov db');
var markov = new Markov(keys, dict);
var bot = new irc.Client("[REDACTED]", 'inebriated', {
    userName: 'inebriated',
    sasl: true,
    port: 6667,
    debug: true,
    channels: ['[REDACTED]'],
    password: '[REDACTED]'
});

bot.on('message', function(from, to, message) {
    if (from == 'eeeeeta' && message == '%%save') {
        fs.writeFileSync('./dict.json', JSON.stringify(markov.dict));
        fs.writeFileSync('./keys.json', JSON.stringify(markov.keys));
        bot.say(from, 'saved markov db: ' + markov.keys.length + ' keys and ' + Object.keys(markov.dict).length + ' dict entries');
        return;
    }
    if (from == 'eeeeeta' && message == 'inebriated: save') {
        fs.writeFileSync('./dict.json', JSON.stringify(markov.dict));
        fs.writeFileSync('./keys.json', JSON.stringify(markov.keys));
        bot.say(to, from + ': saved markov db: ' + markov.keys.length + ' keys and ' + Object.keys(markov.dict).length + ' dict entries');
        return;
    }
    if (message.indexOf('inebriated') != -1) {
        console.log('<' + from + '> ' + message);
        markov.inputSentence(message);
        bot.say(to, from + ': ' + markov.makeSentence());
        return;
    }
    if (from == 'eeeeeta' && message == '%%gen') {
        bot.say(from, markov.makeSentence());
        return;
    }
    /* editors' note: this code would unleash havoc by sending a message to another markov chains
       bot, causing an endless feedback loop. */
    if ((from == 'eeeeeta' || from == 'erry') && message == '%%errify!') {
        console.log(from + ' started errification in ' + to);
        bot.say(to, 'errification commencing!');
        bot.say(to, 'errybot: ' + markov.makeSentence());
        return;
    }
    if (message == '%%errify!') {
        console.log(from + ' failed to errify in ' + to);
        bot.say(to, from + ': you do not have the required permissions to unleash havoc');
        return;
    }
/* New Years' 2015 code!
    if (message == '%%hny') {
        bot.say(to, from + ': GMT New Year 2015 ' + moment("01-01-15 00:00 GMT+00:00").fromNow());
        return;
    }
    */
    if (to == 'inebriated') {
        console.log('<' + from + ' [PM]> ' + message);
        markov.inputSentence(message);
        bot.say(from, markov.makeSentence());
        return;
    }
    message = message.split(' ');
    if (message[0].indexOf(':') != -1 || message[0].indexOf(',') != -1) {
        message = message.slice(1, message.length);
    }
    if (message.length < 2) return;
    message = message.join(' ');
    if (!message.match(/[a-z]/gmi)) return;
    markov.inputSentence(message);
});
/* More New Years' stuff
setTimeout(function() {
    bot.say('#freenode-newyears', '\x02Happy new Year to UTC+00:00! \o/');
    bot.say('#freenode-newyears', 'because GMT new year is best new year');
    bot.say('#freenode-newyears', markov.makeSentence()); 
}, new Date("01-01-15 00:00 GMT+00:00").getTime() - new Date().getTime());
bot.on('error', function(err) {
    console.log('error: ' + err);
});
*/
