const prefix = '### ACL ### - ';

function _error(message: string | unknown) {
  console.error(prefix + message);
}

export { _error };
