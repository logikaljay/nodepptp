# nodepptp
Manage users, sessions and settings of pptpd on linux.

This library is not designed to help you get a working pptpd setup and running, it assumes you have already done this - see the many many guides related to setting up pptpd on the interwebs - [I like this one](https://www.digitalocean.com/community/tutorials/how-to-setup-your-own-vpn-with-pptp)

Tested on:
- Centos 6.4
- Centos 6.5
- Centos 7

## Usage
### Load pptp library
`var pptp = require('./nodepptp');`

### PPTPD Settings

```js
/**
 * Display the PPTPD settings from the file set in config.json
 * @param  Array settings array
 */
pptp.settings.pptpd.load(function (settings) {
    console.log(settings); // output of all settings
});

/**
 * Save PPTPD settings to file specified in config.json
 * @param  Array settings to save
 * @param  Boolean result of method
 */
pptp.settings.pptpd.save(['setting 1', 'setting 2', 'setting 3'], function (result) {
    console.log(result); // true or false if file was written
});
```

### PPTPD Options

```js
/**
 * Load the options from the file specified in the config.json
 * @param  Array options array returned from the file
 */
pptp.settings.options.load(function (options) {
    console.log(options); // output of all options
});

/**
 * Save the options to the file specified in the config.json
 * @param  Array options to write to the file
 * @param  Boolean result of write action
 */
pptp.settings.options.save(['option 1', 'option 2', 'option 3'], function (result) {
    console.log(result); // true if file was written
});
```

### Sessions
**List active sessions**

```js
/**
 * List the active sessions
 * @param  Array list of active sessions
 */
pptp.sessions.active(function (sessions) {
    console.log(sessions); // list the active sessions
});
```

**Output:**

```
[
  {
    user: 'bob',
    interface: {
        device: 'ppp0',
        localip: '10.1.1.51',
        assignedip: '10.1.1.100',
        rx: { packets: '34', bytes: '2164' },
        tx: { packets: '7', bytes: '94' }
    },
    clientip: '10.1.1.53',
    connected: Sat Sep 20 2014 15:40:14 GMT+1200 (NZST),
    disconnected: null
  }
]
```

**List inactive sessions:**

```js
/**
 List the inactive sessions
 @param  Array list of inactive sessions
*/
pptp.sessions.inactive(function (sessions) {
  console.log(sessions); // list the inactive sessions
});

/**
 * output
[
  {
    user: 'bob',
    interface: { device: 'ppp0' },
    clientip: '10.1.1.53',
    connected: Sat Sep 20 2014 15:40:14 GMT+1200 (NZST),
    disconnected: Sat Sep 20 2014 15:57:33 GMT+1200 (NZST)
  }
]
*/
```

**Kill a session**

```js
/**
 * Kill a user's session
 * @param  String assigned ip address of the session to kill
 * @param  Boolean result of kill action
 */
pptp.sessions.kill('10.1.1.100', function (result) {
    console.log(result); // true if user's session was terminated
});
```

### Users
**Add a user:**

```js
/**
 * Add a user
 * @param  String name of the user
 * @param  String server name
 * @param  String password for the user
 * @param  String allowed IP Address
 */
pptp.users.add('jim', '*', 'password', '*', function (result) {
    console.log(result); // true if user was added
});
```

**Remove a user:**

```js
/**
 * Remove a user
 * @param  String name of the user
 */
pptp.users.remove('jim', function (result) {
    console.log(result); // true if user was removed
});
```

**List all users:**

```js
/**
 * List all users in the users file specified in config.json
 * @param  Array of users
 */
pptp.users.all(function (users) {
    console.log(users);
});
```

## Troubleshooting
- Verify the paths in `config.json` are correct - they should be for a default environment, however if your's is weird, these will need to change.
- Verify that you have `last` and your `pptpd.conf` has the flag `logwtemp`
- If you don't get any interfaces for connected sessions, you may need to modify `lib/ifconfig.js` it just uses regex to match `ifconfig` and pull data relating to the ppp interfaces.

## TODO/Future
- Implement user accounts and track session start/ends and RX/TX.
- Ability to assign monthly/weekly/hourly usage limits on account setup
