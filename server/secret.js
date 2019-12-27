const secrets = {
  MONGO_LOCAL: "mongodb://127.0.0.1:27017/authlogin",
  MONGO_PROD: "mongodb+srv://glvaldez:Giordano1!@cluster0-u7rzh.mongodb.net/test?retryWrites=true&w=majority"
};

const getSecret = key => secrets[key];

module.exports = getSecret;
