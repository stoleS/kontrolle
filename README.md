# Overview

![Coverage](./coverage.svg)

This module works by defining a set of roles, permissions and features single user has and checking to see if a said user possesses a certain capability, either by checking if specific role exists or feature is available. This allows you to determine whether a user should have access to a given resource or operation. Features can be extended with specific variations (like alpha or beta) that can be further checked at evaluation. The module is written in Typescript and compiles to commonjs.


## Table of Contents

- [Installation](#installation)
- [Test](#test)
- [Build](#build)
- [Document](#document)
- [Usage](#usage)
	- [Initialization](#initialization)
	- [Evaluation](#evaluation)
		- [Permissions](#permissions)
			- [can](#can)
			- [canAny](#canany)
			- [canAll](#canall)
			- [canAnyAction](#cananyaction)
			- [canAllActions](#canallactions)
		- [Roles](#roles)
			- [hasRole](#hasrole)
			- [hasAnyRole](#hasanyrole)
			- [hasAllRoles](#hasallroles)
		- [Extras](#extras)

## Instalation

This module is distributed via [npm](https://www.npmjs.com/) which is bundled with [node](https://nodejs.org/en/) and should be installed as one of your project's `dependencies`:
```
npm install --save kontrolle
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
import * as kontrolle from 'kontrolle';

const roles = ['userAdmin', 'agencyAdmin'];
const permissions = {
	agencies: {
		basic: {
			action: ['view', 'update']
		},
	},
	users: {
		manage: {
			action: ['create', 'read', 'update']
		}
	}
}
const features = {
	"agencyAdmin": {
	   "agencies": [
	      "basic"
	   ]
	},
	"usersAdmin": {
	   "users": [
	      "manage"
	   ]
	 }
}

kontrolle.init({
	roles,
	permissions,
	features
})
```

### Evaluation
Here are few examples on basic role and permission checks.

### Permissions

#### can

Evaluate if user can do an action over specified feature.

```
import * as kontrolle from 'kontrolle';

const roles = ...
const permissions = {
	users: {
		manage: {
			action: ['create', 'read', 'update']
		}
	}
}
const features = ...

kontrolle.init({ roles, permissions, features })

const res = kontrolle.can('users', 'manage', 'create')
// true

const res = kontrolle.can('users', 'manage', 'delete')
//false
```
&nbsp;
#### canAny

Evaluate if user can do any of the provided evaluations.

```
import * as kontrolle from 'kontrolle';

const roles = ...
const permissions = {
	users: {
		manage: {
			action: ['create', 'read', 'update']
		},
		licence: {
			action: ['view']
		}
	}
}
const features = ...

kontrolle.init({ roles, permissions, features })

const res = kontrolle.canAny(['users', 'manage', 'read'], ['users', 'licence', 'view'])
// true

const res = kontrolle.canAny(['users', 'manage', '*'], ['users', 'licence', 'view'])
// true

const res = kontrolle.canAny(['users', 'manage', '*'], ['users', 'licence', 'update'])
// false
```
&nbsp;
#### canAll

Evaluate if user can do all of the provided evaluations.

```
import * as kontrolle from 'kontrolle';

const roles = ...
const permissions = {
	users: {
		manage: {
			action: ['create', 'read', 'update']
		},
		licence: {
			action: ['view']
		}
	}
}
const features = ...

kontrolle.init({ roles, permissions, features })

const res = kontrolle.canAny(['users', 'manage', 'read'], ['users', 'licence', 'view'])
// true

const res = kontrolle.canAny(['users', 'manage', '*'], ['users', 'licence', 'view'])
// false
```
&nbsp;
#### canAnyAction

Evalute if user can do any of the provided actions over the feature

```
import * as kontrolle from 'kontrolle';

const roles = ...
const permissions = {
	users: {
		manage: {
			action: ['create', 'read', 'update']
		},
		licence: {
			action: ['view']
		}
	}
}
const features = ...

kontrolle.init({ roles, permissions, features })

const res = kontrolle.canAnyAction('users', 'manage', ['create', 'read'])
// true

const res = kontrolle.canAnyAction('users', 'manage', ['delete', 'read'])
// true

const res = kontrolle.canAnyAction('users', 'manage', ['delete', 'assign'])
// false
```
&nbsp;
#### canAllActions

Evalute if user can do all of the provided actions over the feature

```
import * as kontrolle from 'kontrolle';

const roles = ...
const permissions = {
	users: {
		manage: {
			action: ['create', 'read', 'update']
		},
		licence: {
			action: ['view']
		}
	}
}
const features = ...

kontrolle.init({ roles, permissions, features })

const res = kontrolle.canAllActions('users', 'manage', ['create', 'read'])
// true

const res = kontrolle.canAllActions('users', 'manage', ['delete', 'read'])
// false
```

### Roles

#### hasRole

Check if user has a provided role

```
import * as kontrolle from 'kontrolle';

const roles = ['userAdmin', 'agencyAdmin'];
const permissions = ...
const features = ...

kontrolle.init({ roles, permissions, features })

const res = kontrolle.hasRole('userAdmin')
// role object { name: 'userAdmin' }

const res = kontrolle.hasRole('superadmin')
// false
```
&nbsp;
#### hasAnyRole

Check if user has any of the provided roles

```
import * as kontrolle from 'kontrolle';

const roles = ['userAdmin', 'agencyAdmin'];
const permissions = ...
const features = ...

kontrolle.init({ roles, permissions, features })

const res = kontrolle.hasAnyRole(['userAdmin', 'superadmin'])
// true

const res = kontrolle.hasAnyRole(['marketing', 'qa']);
// false
```
&nbsp;
#### hasAllRoles

Check if user has all of the provided roles

```
import * as kontrolle from 'kontrolle';

const roles = ['userAdmin', 'agencyAdmin'];
const permissions = ...
const features = ...

kontrolle.init({ roles, permissions, features })

const res = kontrolle.hasAllRoles(['userAdmin', 'agencyAdmin'])
// true

const res = kontrolle.hasAnyRole(['userAdmin', 'superadmin']);
// false
```

### Extras