/** @format */

const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const exists = require('fs').existsSync;
const rm = require('rimraf').sync;
const inquirer = require('inquirer');
const async = require('async');
const crypto = require('crypto');
const render = require('consolidate').handlebars.render;
const metadata = require('../lib/options');
const generate = require('../lib/generate');

const MOCK_TEMPLATE_REPO_PATH = path.resolve(
  './packages/smoker-cli/__tests__/e2e/mock-template-repo'
);

const MOCK_TEMPLATE_BUILD_PATH = path.resolve(
  './packages/smoker-cli/__tests__/e2e/mock-template-build'
);

const MOCK_METADATA_REPO_JS_PATH = path.resolve(
  './packages/smoker-cli/__tests__/e2e/mock-metadata-repo-js'
);

function monkeyPatchInquirer(answers) {
  inquirer.prompt = questions => {
    const key = questions[0].name;
    const _answers = {};
    const validate = questions[0].validate;
    const valid = validate(answers[key]);
    if (valid !== true) {
      return Promise.reject(new Error(valid));
    }
    _answers[key] = answers[key];
    return Promise.resolve(_answers);
  };
}

const answers = {
  name: 'smoker-cli-test',
  author: 'jingli12',
  description: 'vue-cli e2e test',
  spa: true,
  framework: 'vue',
  library: 'library'
};

it('smoker-cli metadata validate', () => {
  const meta = metadata('test-pkg');
  expect(meta).to.be.an('object');
  expect(meta.prompts).to.have.property('description');
});

it('smoker-cli meta helpers validate', done => {
  monkeyPatchInquirer(answers);
  generate(
    {
      name: 'test',
      src: MOCK_METADATA_REPO_JS_PATH,
      dest: MOCK_TEMPLATE_BUILD_PATH
    },
    err => {
      if (err) done(err);
      const contents = fs.readFileSync(
        `${MOCK_TEMPLATE_BUILD_PATH}/readme.md`,
        'utf-8'
      );
      expect(contents).to.equal('1.0.1');
      done();
    }
  );
});

it('smoker-cli adds additional data to meta data', done => {
  const data = generate(
    {
      name: 'test',
      src: MOCK_METADATA_REPO_JS_PATH,
      dest: MOCK_TEMPLATE_BUILD_PATH
    },
    done
  );
  expect(data.destDirName).to.equal('test');
  expect(data.inPlace).to.equal(false);
});

it('sets `inPlace` to true when generating in same directory', done => {
  const currentDir = process.cwd();
  process.chdir(MOCK_TEMPLATE_BUILD_PATH);
  const data = generate(
    {
      name: 'test',
      src: MOCK_METADATA_REPO_JS_PATH,
      dest: MOCK_TEMPLATE_BUILD_PATH
    },
    done
  );
  expect(data.destDirName).to.equal('test');
  expect(data.inPlace).to.equal(true);
  process.chdir(currentDir);
});

it('smoker-cli template generation', done => {
  monkeyPatchInquirer(answers);
  generate(
    {
      name: 'test',
      src: MOCK_TEMPLATE_REPO_PATH,
      dest: MOCK_TEMPLATE_BUILD_PATH
    },
    err => {
      if (err) done(err);
      expect(exists(`${MOCK_TEMPLATE_BUILD_PATH}/src/yes.vue`)).to.equal(true);
      async.eachSeries(
        ['package.json', 'src/yes.vue'],
        function(file, next) {
          const template = fs.readFileSync(
            `${MOCK_TEMPLATE_REPO_PATH}/spa/${file}`,
            'utf8'
          );
          const generated = fs.readFileSync(
            `${MOCK_TEMPLATE_BUILD_PATH}/${file}`,
            'utf8'
          );
          render(template, answers, (err, res) => {
            if (err) return next(err);
            expect(res).to.equal(generated);
            next();
          });
        },
        done
      );
    }
  );
});

it('smoker-cli generate a vaild package.json with escaped author', done => {
  monkeyPatchInquirer(answers);
  generate(
    {
      name: 'test',
      src: MOCK_TEMPLATE_REPO_PATH,
      dest: MOCK_TEMPLATE_BUILD_PATH
    },
    err => {
      if (err) done(err);

      const pkg = fs.readFileSync(
        `${MOCK_TEMPLATE_BUILD_PATH}/package.json`,
        'utf8'
      );
      try {
        var validData = JSON.parse(pkg);
        expect(validData.author).to.equal(answers.author);
        done();
      } catch (err) {
        done(err);
      }
    }
  );
});

it('avoid rendering files that do not have mustaches', done => {
  monkeyPatchInquirer(answers);
  const binFilePath = `${MOCK_TEMPLATE_REPO_PATH}/spa/bin.file`;
  const wstream = fs.createWriteStream(binFilePath);
  wstream.write(crypto.randomBytes(100));
  wstream.end();

  generate(
    {
      name: 'test',
      src: MOCK_TEMPLATE_REPO_PATH,
      dest: MOCK_TEMPLATE_BUILD_PATH
    },
    err => {
      if (err) done(err);

      const handlebarsPackageJsonFile = fs.readFileSync(
        `${MOCK_TEMPLATE_REPO_PATH}/spa/package.json`,
        'utf8'
      );
      const generatedPackageJsonFile = fs.readFileSync(
        `${MOCK_TEMPLATE_BUILD_PATH}/package.json`,
        'utf8'
      );

      render(handlebarsPackageJsonFile, answers, (err, res) => {
        if (err) return done(err);

        expect(res).to.equal(generatedPackageJsonFile);
        expect(exists(binFilePath)).to.equal(true);
        expect(exists(`${MOCK_TEMPLATE_BUILD_PATH}/bin.file`)).to.equal(true);
        rm(binFilePath);

        done();
      });
    }
  );
});
