module.exports = function (config) {
	config.set({
		frameworks: ["mocha"],

		browsers: ["Chrome"],

		files: [
			"node_modules/chai/chai.js",
			"comeon.js",
			"test/unit.test.js",
			//"test/behavior.test.js",
			{
				pattern: "test/modules/**/*.js",
				included: false
			}
		]
	});
};
