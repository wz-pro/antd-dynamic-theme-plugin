const path = require('path');
const lessVars = require('../lib/less-vars').default;

lessVars(path.resolve('./light.less'));
