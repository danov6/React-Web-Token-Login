let aws = require('aws-sdk');
aws.config.update({
    "accessKeyId": "AKIAJZHOELCSKHF75Q6A",
    "secretAccessKey": "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",
    "region": "us-west-2"
});
module.exports = (function () {
    return aws;
})();