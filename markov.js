/* jslint node: true, esnext: true */
"use strict";

var Markov;
var Chance = require('chance');

function chunk(arr, chunkSize) {
    var R = [];
    for (var i=0; i<arr.length; i+=chunkSize)
        R.push(arr.slice(i,i+chunkSize));
    return R;
}

/**
 * Make a new markov-based chatbot.
 *
 * @param {object=} keys - a set of keys
 * @param {object=} dict - a markov dictionary
 */
Markov = function(keys, dict) {
    this.keys = keys || [];
    this.dict = dict || {};
    this.chance = new Chance();
};
/**
 * Input a complete sentence, and understand the relation
 * between the words in it. Also, add the beginning to
 * the key list.
 * 
 * @param {string} text
 */
Markov.prototype.inputSentence = function(text) {
    let self = this;
    text = text.split(' ');
    text = chunk(text, 2);
    text.forEach(function(bit, idx) {
        bit = bit.join(' ');
        if (idx === 0 && text[idx + 1]) self.keys.push(bit);
        if (!text[idx + 1]) return;
        if (!self.dict[bit]) {
            self.dict[bit] = [text[idx + 1].join(' ')];
        }
        else {
            if (self.dict[bit].indexOf(text[idx + 1].join(' ')) != -1) return;
            self.dict[bit].push(text[idx + 1].join(' '));
        }
    });
};
/**
 * Input a list of related words, and understand the relation between them.
 *
 * @param {string} words.
 */
Markov.prototype.inputWords = function(text) {
    let self = this;
    text = text.split(' ');
    text = chunk(text, 2);
    text.forEach(function(bit, idx) {
        bit = bit.join(' ');
        if (!text[idx + 1]) return;
        if (!self.dict[bit]) {
            self.dict[bit] = [text[idx + 1].join(' ')];
        }
        else {
            if (self.dict[bit].indexOf(text[idx + 1].join(' ')) != -1) return;
            self.dict[bit].push(text[idx + 1].join(' '));
        }
    });
};
/**
 * Make a sentence from the markov dictionary.
 *
 */
Markov.prototype.makeSentence = function() {
    let sentence = '';
    let self = this;
    let weights = [];
    self.keys.forEach(function(key) {
        let score = 0;
        if (!self.dict[key]) {
            return weights.push(1e-100);
        }
        for(;;) {
            key = self.dict[key];
            if (!key) break;
            score = score + (key.length - 1.2);
            key = self.chance.pick(key);
        }
        if (score < 0.1) score = 1e-50;
        weights.push(score);
    });
    let segm = self.chance.weighted(self.keys, weights);
    let array = self.dict[segm];
    sentence += segm;
    for(;;) {
        if (!array) {
            break;
        }
        sentence += ' ';
        segm = self.chance.pick(array);
        sentence += segm;
        array = self.dict[segm];
    }
    return sentence;
};
module.exports = Markov;
