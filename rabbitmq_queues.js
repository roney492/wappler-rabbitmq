// JavaScript Document
// Ken Truesdale - ken@uniqueideas.com

const { toSystemPath } = require('../../../lib/core/path');
const amqp = require('amqplib');
const rabbitmqReady = true

var responseMessages = {};
responseMessages['norabbitmq'] = { "response": 'Queue NOT created -- No rabbitmq connection.' };
responseMessages['noqueue'] = { "response": 'Queue does not exist.' };

async function connect(hostname) {
    try {
        connection = await amqp.connect('amqp://'+hostname);
    } catch (error) {
        console.log("Error connecting to the server:", error);
        throw error;
    }
}
let connection;
async function createChannel(connection) {
    try {
        const channel = await connection.createChannel();
        return channel;
    } catch (error) {
        console.log("Error creating channel:", error);
        throw error;
    }
}

exports.add_job = async function (options) {
    if (rabbitmqReady) {
        let delay_ms = parseInt(this.parseOptional(options.delay_ms, '*', 0));
        let hostname = this.parse(options.hostname);
        console.log(hostname)
        var jobData = this.parse(options.bindings) || {}
        await connect(hostname);
        const channel = await createChannel(connection);
        let queueName = this.parseRequired(options.queue_name, 'string', 'Queue name is required');
        try {
            await channel.assertQueue(queueName);
            await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(jobData)), { 
                properties: {
                    contentType: 'application/json',
                    headers: {
                        'x-delay': delay_ms,
                      },
                }});
        } catch (error) {
            console.log("Error sending message to queue:", error);
            throw error;
        }
};
};