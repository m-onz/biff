
# biff

Experimental actor system using isolated javascript runtimes

### how it works

You can call a javascript file with biff...

```js

biff example.js

```

You get ```spawn```, ```send``` and ```receive``` methods.
Other libraries available are ```fs``` and ```process```.

Only the file called with biff can use node modules... anything spawned will only communicate
 via send and receive and any actors that are spawned have the same restrictions.

To work with node modules / the filesystem and privileged machine access you will need to do that
work in the main process and use message passing to send it your actors. Actors have limited memory
 to work in and have access to anything other than their ```send```, ```receive``` and  ```spawn``` methods.

### example.js

```js

// spawn a file
biff.spawn('something.js').catch(function (e) {})

// inline spawn
biff.spawn(`
	receive(self).then(function (message) {
		console.log(message)
	})
	send(self, 'turnips')
`)
.then(function (pid) {
	console.log(pid, ' pid')
	biff.send(pid, 'turnips!')
})
.catch(function (e) { throw e; })

```

## actor properties

* self (the actors own process id or PID)

## actor methods

* spawn
* send
* receive

```js

console.log('pid>', self)

send(self, 'hello world')

receive(self).then(function (message) {
	console.log(message)
})

spawn('console.log(11)')

```

## install

* todo - add to NPM

```sh

npm install @m-onz/biff -g

```

## develop

```sh
git clone https://github.com/m-onz/biff
npm install
npm link
npm test
```
