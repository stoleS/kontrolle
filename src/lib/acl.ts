import type { ACLRules, ACLState, Fn, RuleArgs, User } from '../types';

import { _error } from './log';

/**
 * @namespace ACL
 */

/**
 * Represents internal state used for storing
 * user data used for evaluation and mapped rules
 * @typedef {object} ACLState
 * @memberOf ACL
 * @property {User} user - user provided in the initialization step
 * @property {ACLRules} rulesMap - flattened list of all rules with corresponding eval method
 */
const _ACL: ACLState = {
  user: null,
  rulesMap: {},
};

/**
 * Evaluates that all provided rules are satisfied.
 *
 * @memberOf ACL
 * @param {string | string[]} rules - List of rules for evaluation.
 * @param {unknown[]} args - Arguments used for multiple property evaluation.
 * @returns {boolean} Are all rules satisfied.
 */
function canRuleChecker(rules: string | string[], ...args: readonly unknown[]) {
  const res = ruleChecker(rules, ...args);
  if (!res) return false;
  return res[0] === res[1];
}

/**
 * Evaluates that some of the provided rules are satisfied.
 *
 * @memberOf ACL
 * @param {string | string[]} rules - List of rules for evaluation.
 * @param {unknown[]} args - Arguments used for multiple property evaluation.
 * @returns {boolean} Is any rule satisfied.
 */
function canAnyRuleChecker(
  rules: string | string[],
  ...args: readonly unknown[]
) {
  const res = ruleChecker(rules, ...args);
  if (!res) return false;
  return res[1];
}

/**
 * Evaluates that all of the provided rules are not satisfied.
 *
 * @memberOf ACL
 * @param {string | string[]} rules - List of rules for evaluation.
 * @param {unknown[]} args - Arguments used for multiple property evaluation.
 * @returns {boolean} All rules not satisfied.
 */
function notRuleChecker(rules: string | string[], ...args: readonly unknown[]) {
  const res = ruleChecker(rules, ...args);
  if (!res) return false;
  return res[1] === 0;
}

/**
 * Evaluates that some of the provided rules are not satisfied.
 *
 * @memberOf ACL
 * @param {string | string[]} rules - List of rules for evaluation.
 * @param {unknown[]} args - Arguments used for multiple property evaluation.
 * @returns {boolean} Some rules not satisfied.
 */
function notAnyRuleChecker(
  rules: string | string[],
  ...args: readonly unknown[]
) {
  const res = ruleChecker(rules, ...args);
  if (!res) return false;
  return res[1] < res[0];
}

/**
 * Evaluates rule/s.
 *
 * @memberOf ACL
 * @param {string | string[]} rules - List of rules for evaluation.
 * @param {unknown[]} args - Arguments used for multiple property evaluation.
 * @returns {[number, number], false} Number of rules tested and rules passed
 */
function ruleChecker(
  rules: string | readonly string[],
  ...args: readonly unknown[]
): [number, number] | false {
  if (typeof rules === 'string') {
    if (!(rules in _ACL.rulesMap)) {
      _error(
        `Rule *${rules}* doesn't exist. Please define it in the config file.`
      );
      return false;
    }
    const callback = _ACL.rulesMap[rules];
    return evaluateRuleCallback(callback, ...args);
  }

  if (Array.isArray(rules)) {
    let counter = 0;
    let valid = 0;

    rules.forEach((rule) => {
      if (!(rule in _ACL.rulesMap)) {
        _error(
          `Rule *${rules}* doesn't exist. Please define it in the config file.`
        );
        return;
      }
      const callback = _ACL.rulesMap[rule];
      const res = evaluateRuleCallback(callback, ...args);

      if (res) valid++;
      counter++;
    });

    return [counter, valid];
  }

  return false;
}

/**
 * Evaluates that provided callbacks satisfy defined rules.
 *
 * @memberOf ACL
 * @param {Fn} callback - callback function used for evaluation.
 * @param {unknown[]} args - Arguments used for multiple property evaluation.
 * @returns {[number, number] | boolean} Result of evaluation.
 */
function evaluateRuleCallback(
  callback: Fn,
  ...args: RuleArgs
): [number, number] | false {
  try {
    if (typeof callback !== 'function') {
      _error('Requirement for the rule has to be a function type.');
      return false;
    }

    if (!args) {
      return callback(_ACL.user);
    }

    if (Array.isArray(args)) {
      return callback(_ACL.user, ...args);
    }

    return callback(_ACL.user, args);
  } catch (error) {
    _error(
      'Some of defined ACL rules require additional argument(s) that are missing from the evaluation check.'
    );
    _error(error);
    return false;
  }
}

/**
 * Parse single rule and add it to the rules map
 *
 * @memberOf ACL
 * @param {string} rule - Rule to add to the rules map.
 * @param {Fn} requirement - Evaluation callback.
 * @returns {void}
 */
function applyRule(rule: string, requirement: Fn) {
  if (_ACL.rulesMap[rule]) _error(`Rule ${rule} already exists.`);
  else _ACL.rulesMap[rule] = requirement;
}

/**
 * Parse multiple rules and add them to the rules map
 *
 * @memberOf ACL
 * @param {string} rule - Add new rule to the rules map.
 * @param {Fn} requirement - Evaluation callback.
 * @returns {void}
 */
function applyRules(rules: string | readonly string[], requirement: Fn) {
  if (Array.isArray(rules)) {
    rules.forEach((rule) => applyRule(rule, requirement));
  }
  if (typeof rules === 'string') {
    applyRule(rules, requirement);
  }
}

/**
 * Parse rules provided in the ACL initialization.
 *
 * @memberOf ACL
 * @param {ACLRules} rules - List of rules provided by user.
 * @returns {void}
 */
function parseRules(rules: ACLRules): void {
  const { permissions, roles = null } = rules;

  permissions.forEach((permission) =>
    applyRules(permission.rules, permission.requirement)
  );

  if (roles) roles.forEach((role) => applyRules(role.rules, role.requirement));
}

/**
 * Wrapper rules
 *
 * @memberOf ACL
 * @param {ACLRules} rules - List of rules provided by user.
 * @returns {ACLRules} List of rules provided by user.
 */
export function defineRules(rules: ACLRules): ACLRules {
  return rules;
}

/**
 * Initialization function
 *
 * @memberOf ACL
 * @param {User} user - User object.
 * @param {ACLRules} rules - List of rules provided by user.
 * @returns {void}
 */
export function defineACL(user: User, rules: ACLRules): void {
  _ACL.user = user;
  parseRules(rules);
}

export const ACL = {
  can: canRuleChecker,
  canAll: canRuleChecker,
  canAny: canAnyRuleChecker,
  canNot: notRuleChecker,
  canNotAll: notRuleChecker,
  canNotAny: notAnyRuleChecker,
};
