# platziverse-mqtt

## `agent/connected`

```javascript
{
  agent: {
    uuid, // auto generated
    username, // define by cofiguration
    name, // define by configuration
    hostname, // get from OS
    pid // get from process
  }
}
```

## `agent/disconnected`

```javascript
{
  agent: {
    uuid,
  }
}
```

## `agent/message`

```javascript
{
  agent,
  metrics: [
    {
      type,
      value
    }
  ],
  timestamp // generated when the message is created
}
```

# Commands

## NPM

```bash
npm init
npm i --save-dev standard nodemon
npm i --save debug aedes aedes-persistence-redis mqemitter-redis redis chalk
```
