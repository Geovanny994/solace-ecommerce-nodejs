# Solace Node.js E-commerce

Simple Node.js application that demonstrates a Publisher and Consumer using Solace PubSub+ Guaranteed Messaging.

## Architecture

```
Publisher
Topic: ecommerce/v1/orders/created
Queue: Q.NODE.ORDERS.CREATED
Consumer
```

## Technologies

- Node.js
- JavaScript
- Solace PubSub+
- dotenv

## Project Structure

```
src/
    config/
    consumer/
    models/
    publisher/
```

## Configuration

Create a `.env` file with:

```env
SOLACE_HOST=
SOLACE_VPN=
SOLACE_USERNAME=
SOLACE_PASSWORD=

TOPIC_NAME=ecommerce/v1/orders/created
QUEUE_NAME=Q.NODE.ORDERS.CREATED
```

## Installation

```bash
npm install
```

## Run Publisher

```bash
npm run publisher
```

## Run Consumer

```bash
npm run consumer
```

## Features

- Publish persistent messages to a Solace topic.
- Consume messages from a durable queue.
- JSON payload representing an e-commerce order.
- Guaranteed messaging using Solace PubSub+.