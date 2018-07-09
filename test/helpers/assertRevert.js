export default async promise => {
  try {
    await promise;
    assert.fail('Expected revert not received');
  } catch (error) {
    const revertFound = error.message.search('revert') >= -1 || error.message.search('invalid opcode') > -1;
    assert(revertFound, `Expected "revert", got ${error} instead`);
  }
};
