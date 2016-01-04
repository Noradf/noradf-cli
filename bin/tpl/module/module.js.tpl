'use strict';

module.exports = function ({% for module in modules %}{{module}}{% if loop.last %}{% else %},{% endif %}{% endfor %}) {% raw %}{

}{% endraw %};