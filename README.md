## Installation

Install yarn.

https://yarnpkg.com/en/docs/install

- Run `yarn` or `yarn install` to install dependencies.

- To build site, run

```bash
yarn run build
```

*a note, if you ever happen to run `yarn clean`, remove `.yarnclean` and then do `yarn install` again. `yarn clean` (https://yarnpkg.com/lang/en/docs/cli/clean/) seems to remove some dist directories from `node_modules`, which we depend on.
*

## Build SiteMaps

#### One time library install

```python
pip install requests
```

#### Build SiteMaps

move to the sitemap directory and run the following command

```python
python generate_sitemap.py
```

output sitemap files will be in the sitemap/outPutFiles folder

## Tests

### Setup

Install required global packages. May require root privilages in some setups.

```bash
npm install -g protractor karma-cli
```

Add you user details in file test/utils/e2e/userDetails.js

The file should have the format
```javscript
module.exports = {
    email: 'youremail',
    password: 'yourpassword',
};
```

### Run Unit Tests

```bash
npm run test
```

### Run E2E tests

```bash
webdriver-manager start
```

And in another tab

```bash
protractor conf.js
```

# Setting node on RHEL
From nodejs site.

As root user.
`curl --silent --location https://rpm.nodesource.com/setup_7.x | bash -`
`yum -y install nodejs`
