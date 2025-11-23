const NodeEnvironment = require('jest-environment-node').TestEnvironment;
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

class MongoTestEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    this.mongod = new MongoMemoryServer();
  }

  async setup() {
    await super.setup();
    
    const uri = await this.mongod.getUri();
    
    this.global.__MONGO_URI__ = uri;
    this.global.__MONGO_DB_NAME__ = 'test';
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  async teardown() {
    await mongoose.disconnect();
    await this.mongod.stop();
    await super.teardown();
  }
}

module.exports = MongoTestEnvironment;