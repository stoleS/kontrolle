# Kontrolle - TypeScript Access Control Library

## Overview

Kontrolle is a super lightweight TypeScript library designed to handle access control in your applications. It provides a flexible and easy-to-use API for managing user permissions and enforcing access rules. This allows you to determine whether a user should have access to a given resource or operation. The module is written in Typescript and compiles to commonjs.

Check the [documentation](#) for extended information about methods and usage.

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
import { defineKontrolle, defineRules, Kontrolle } from './kontrolle';

const user: UserType = {
  id: 1,
  permissions: ['update', 'delete'],
  isAdmin: false,
};

const rules = defineRules({
    permissions: [
      {
        rules: ['update-user', 'delete-user'],
        requirement: (user: UserType) => user.isAdmin,
      },
      {
        rules: ['create-role'],
        requirement: (user: UserType) => user.isAdmin,
      },
      {
        rules: ['delete-certificate'],
        requirement: (user: UserType, certificate: CertificateType) =>
          user.id === certificate.ownerId,
      },
      {
        rules: ['update', 'delete'],
        requirement: (user: UserType) => user.isAdmin,
      },
    ],
    roles: [{ rules: 'admin', requirement: (user: UserType) => user.isAdmin }],
});

defineKontrolle(user, rules);
```

### Evaluation

Here are few examples on basic role and permission checks.

```
import { Kontrolle } from './kontrolle';

const certificate: CertificateType = {
  id: 1,
  ownerId: 1,
};

Kontrolle.can(['delete-certificate'], certificate); //true
```
