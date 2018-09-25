
# biff

Experimental actor system using isolated javascript runtimes [in progress!]

### javascript actors

##### app.js

```js

spawn('console.log(11)').then(function (pid) {
  console.log('spawned an actor with process id ... ', pid)
  send(pid, { hello: 'world!' })
  receive(function (message) {
    // latest message
    console.log(message)
  })
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
You will need to specify the entire file path including the .js file extension.

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
