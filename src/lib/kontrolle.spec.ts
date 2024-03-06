import test from 'ava';

import { defineKontrolle, defineRules, Kontrolle } from './kontrolle';

const user: UserType = {
  id: 1,
  permissions: ['update', 'delete'],
  isAdmin: false,
};

const certificate: CertificateType = {
  id: 1,
  ownerId: 1,
};

type CertificateType = {
  readonly id: number;
  readonly ownerId: number;
};

type UserType = {
  readonly id: number;
  readonly permissions: readonly string[];
  readonly isAdmin: boolean;
};

test('defineACL', (t) => {
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

  const res = Kontrolle.can(['delete-certificate'], certificate);

  t.is(res, true);
});
