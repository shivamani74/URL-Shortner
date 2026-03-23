const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function encode(num) {

    let base = characters.length; // 62
    let shortCode = "";

    while (num > 0) {
        shortCode = characters[num % base] + shortCode;
        num = Math.floor(num / base);
    }

    return shortCode;
}

module.exports = encode;