# truview-open-protocol
The repo contains the functionality for:
  - Defining the ownership structure - create and manage roles.
  - Managing the eco system participants - add/remove platforms.
  - New generation of TRU tokens - Generate / Dispute / Claim.

# Ownership Strucuture
Each participant / member within the eco system holds a role , the role defines the operations allowed to that participant.
There is no heirarchy which allows keeping the eco system decentrelised.

# Managing Participants
Some roles are entitled to manage the eco system participants 
  - Add / Remove participants which will manage Platform Admins.
  - Add / Remove Participants which will manage Platforms.

# New Tokens Generation

The TruView Tokens are genenrated by platofrms (limited by role), generate tokens are locked for 30 days in which the tokens genenration
can be disputed . Oncethe locking period is completed , the generating platfomr canclaim the token and transfer them.
This mechanism allows identifying problematic / fraudual activity before the tokens ar eactually created and transfer to other participants.

### Installation
Pre-requirements:

- node v8.4.0 or later  
- npm 5.6.0 or later

**Install ganache-cli**
```sh
$ npm install -g ganache-cli 
```

**Install the repo**
```ssh
$ git clone https://github.com/TruViewFoundation/truview-open-protocol.git && cd truview-open-protocol

```
**Run ganache**
```ssh
$ ganache-cli 
```

**Run the tests**
```ssh
$ truffle test 
```
