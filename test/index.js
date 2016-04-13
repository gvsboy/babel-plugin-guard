import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { transformFileSync } from 'babel-core';

const rootDir = path.dirname(fs.realpathSync(__filename));
const fixturesDir = path.join(rootDir, 'fixtures');
const expectedDir = path.join(rootDir, 'expected');
const plugin = path.join(rootDir, '../src');

// To test only one fixture, set a 'fixture' environment variable
// when invocating the test runner.
// E.g. fixture=single-in-object npm test
const envFixture = process.env.fixture ? `${process.env.fixture}.js` : null;

function transform(fixture) {
  const file = path.join(fixturesDir, fixture);
  return transformFileSync(file, {
    babelrc: false,
    plugins: [ plugin ]
  }).code;
}

function getExpected(fixture) {
  const file = path.join(expectedDir, fixture);
  return fs.readFileSync(file, {
    encoding: 'utf8'
  });
}

function runTest(fixture) {
  it(`correctly matches ${fixture} to it's expected source`, () => {
    let transformed = transform(fixture);
    let expected = getExpected(fixture);
    expect(transformed.trim()).to.equal(expected.trim());
  });
}

describe('babel-plugin-guard', () => {

  describe('transformations', () => {

    // Collect all the fixtures found in the file system.
    let fixtures = fs.readdirSync(fixturesDir);

    // If an environment variable exists for fixture, try locating it and running the test.
    if (envFixture) {
      let fixture = fixtures.find(f => f === envFixture);
      if (fixture) {
        runTest(fixture);
      }
      else {
        console.error('Could not find fixture:', envFixture);
      }
    }

    // Otherwise, run all the tests per usual.
    else {
      fixtures.forEach(runTest);
    }
  });

});
