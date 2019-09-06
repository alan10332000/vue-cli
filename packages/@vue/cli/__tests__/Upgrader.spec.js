const fs = require('fs')
const path = require('path')
const create = require('@vue/cli-test-utils/createTestProject')
const { logs } = require('@vue/cli-shared-utils')

const Upgrader = require('../lib/Upgrader')

jest.setTimeout(300000)

const outsideTestFolder = path.resolve(__dirname, '../../../../../vue-upgrade-tests')

beforeAll(() => {
  if (!fs.existsSync(outsideTestFolder)) {
    fs.mkdirSync(outsideTestFolder)
  }
})

test('upgrade: plugin-babel v3.5', async () => {
  process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN = true
  const project = await create('plugin-babel-legacy', {
    plugins: {
      '@vue/cli-plugin-babel': {
        version: '3.5.3'
      }
    }
  }, outsideTestFolder)

  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.dependencies).not.toHaveProperty('core-js')

  await (new Upgrader(project.dir)).upgrade('@vue/babel', {})

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.dependencies).toHaveProperty('core-js')

  expect(logs.log.some(([msg]) => msg.match('core-js has been upgraded'))).toBe(true)

  // should have updated the version range in package.json
  expect(updatedPkg.devDependencies['@vue/cli-plugin-babel']).not.toMatch('3.5.3')
})

test('upgrade: plugin-babel with core-js 2', async () => {
  process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN = true
  const project = await create('plugin-babel-v3', {
    plugins: {
      '@vue/cli-plugin-babel': {
        version: '3.8.0'
      }
    }
  }, outsideTestFolder)

  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.dependencies['core-js']).toMatch('^2')

  await (new Upgrader(project.dir)).upgrade('@vue/babel', {})

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.dependencies['core-js']).toMatch('^3')
})