
# biff

Experimental actor system using isolated javascript runtimes [in progress!]

### javascript actors

##### app.js

```js

spawn(`
setTimeout(1000).then(function () {
  receive(function (message) {
    // latest message
    console.log(message)
  })
})
`).then(function (pid) {
  console.log('spawned an actor with process id ... ', pid)
  send(pid, { hello: 'world!' })
})

```

* then run with ```biff ./example.js```


### example

To run the example

```sh

cd /example
biff app.js

```

### install cli

```sh

npm install biff -g

```

### install as a library

```js

var biff = require('@m-onz/biff').client

biff.spawn('console.log(11)').catch((e) => console.log)
biff.send('123', { hello: 'world' }).catch((e) => console.log)
biff.receive('123').then(function (mailbox) {
  console.log(mailbox
  )
}).catch((e) => console.log)

```
