# Overview

This module works by defining a set of roles, permissions and features single user has and checking to see if a said user possesses a certain capability, either by checking if specific role exists or feature is available. This allows you to determine whether a user should have access to a given resource or operation. Features can be extended with specific variations (like alpha or beta) that can be further checked at evaluation. The module is written in Typescript and compiles to commonjs.


## Table of Contents

- [Installation](#installation)
- [Test](#test)
- [Build](#build)
- [Document](#document)
- [Usage](#usage)
	- [Initialization](#initialization)
	- [Evaluation](#evaluation)

## Instalation

This module is distributed via [npm](https://www.npmjs.com/) which is bundled with [node](https://nodejs.org/en/) and should be installed as one of your project's `dependencies`:
```
npm install --save rbac
```

## Test
```
npm run test
```

## Build
```
npm run build
```

## Document
```
npm run doc
```

## Usage

### Initialization

Here's a simple example of library initialization:
```
import * as RBAC from 'rbac';

const roles = ['userAdmin', 'agencyAdmin'];
const permissions = {
	agencies: {
		basic: {
			action: ['view', 'update']
		},
	},
	users: {
		basic: {
			action: ['create', 'read', 'update']
		}
	}
}
const features = {
	"agencyAdmin":{
	   "agencies":[
	      "basic"
	   ]
	},
	"usersAdmin":{
	   "users":[
	      "basic"
	   ]
	 }
}

RBAC.init({
	roles,
	permissions,
	features
})
```
