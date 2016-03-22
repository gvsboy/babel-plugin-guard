import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { transformFileSync } from 'babel-core';

const rootDir = path.dirname(fs.realpathSync(__filename));
const fixturesDir = path.join(rootDir, 'fixtures');
const expectedDir = path.join(rootDir, 'expected');
const plugin = path.join(rootDir, '../src');

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

describe('babel-plugin-guard', () => {

  describe('transformations', () => {
    fs.readdirSync(fixturesDir).forEach((fixture) => {
      it(`correctly matches ${fixture} to it's expected source`, () => {
        let transformed = transform(fixture);
        let expected = getExpected(fixture);
        expect(transformed.trim()).to.equal(expected.trim());
      });
    });
  });

});
