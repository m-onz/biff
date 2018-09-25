
# biff - readme OlD

Experimental actor system using isolated javascript runtimes [in progress!]

### javascript actors

##### app.js

```js

spawn(`
  receive(function (message) {
    console.log(message)
  })
`).then(function (pid) {
  console.log('spawned an actor with process id ... ', pid)
  send(pid, { hello: 'world!' })
})

```

* then run with ```biff ./app.js```

### methods

* spawn (actor)
* send (pid, message)
* receive ()


### install

```sh

npm install biff -g

```
