const lexer = require('lex');
const util = require('util');
const vm = require('vm');

function _toString(self) {
	switch (typeof(self)) {
		case 'object':
			console.log('typeof', typeof(self));
			if (self.hasOwnProperty('valueOf')) {
				console.log('aa');
				var tmp = self.valueOf();
				return _toString(tmp);
			}
			if (Object.prototype.toString.call(self) == '[object Array]') {
				console.log('bb');
				var ret = '[';
				for (var i = 0; i < self.length; i++) {
					if (i != 0) {
						ret += ',';
					}
					ret += _toString(self[i]);
				}
				ret += ']';
				return ret;
			} else {
				console.log('cc');
				var ret = '{';

				var properties = Object.keys(self);
				var cnt = 0;
				for (var i = 0; i < properties.length; i++) {
					if (cnt != 0) {
						ret += ', ';
					}
					var key = properties[i];
					if (self[key] === null) continue;
					console.log('key', key);
					cnt++;
					ret += "'" + key.replace(/\'/g, "\\'") + "'" + ': ';
					ret += _toString(self[key]);
				}

				ret += '}';
				return ret;
			}
		case 'function':
			return self.toString();
		case 'string':
			return "'" + self.replace(/\'/g, "\\'") + "'";
		case 'number':
			return self;
		case 'boolean':
			return self ? 'true' : 'false';
		default:
			throw new Error('Cannot toString ' + typeof(self));
			break;
	}
}

module.exports = {
	serialize: function(a) {
		return _toString(a);
	},
	serializeArguments: function(argString) {
		var lex = new lexer();
		var tokens = [];

		lex.addRule(
			/\"([^\"]+)\"/,
			(lexeme, match) => {
				tokens.push(match);
			}
		);
		lex.addRule(
			/([^ ]+)/,
			(lexeme) => {
				tokens.push(lexeme);
			}
		);
		lex.addRule(
			/ /,
			(lexeme) => {

			}
		);
		
		lex.setInput(argString);
		try {
			lex.lex();
		} catch (e) {

		}

		if (tokens.length == 0) return '';
		return '"' + tokens.join('", "') + '"';
	},
	unserialize: function(a, context) {
		var script = new vm.Script(
			'var a = ' + a,
			{
				filename: 'input',
				displayErrors: true,
				timeout: 10000
			}
		);
		if (!context) {
			var context = {};
			script.runInNewContext(
				context,
				{
					filename: 'input',
					displayErrors: true,
					timeout: 10000
				}
			);
			return context.a;
		} else {
			script.runInContext(
				context,
				{
					filename: 'input',
					displayErrors: true,
					timeout: 10000
				}
			);
			var tmp = context.a;
			delete context.a;
			return tmp;
		}
	}
}