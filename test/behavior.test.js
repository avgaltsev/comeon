var expect = chai.expect;

describe("Comeon", function () {
	it("should require module1", function (done) {
		var comeon = new Comeon("base/test/modules");

		comeon.require("./module1", function (exports) {
			expect(exports).to.equal("Relative module1 script");
			done();
		});
	});

	it("should require module2", function (done) {
		var comeon = new Comeon("base/test/modules");

		comeon.require("./module2", function (exports) {
			expect(exports).to.equal("Relative module2 package");
			done();
		});
	});

	// it("should require module3", function (done) {
	// 	var comeon = new Comeon("base/test/modules");

	// 	comeon.require("./module3", function (exports) {
	// 		expect(exports).to.equal("Relative module3 package");
	// 		done();
	// 	});
	// });

	it("should require module1 in subdirectory", function (done) {
		var comeon = new Comeon("base/test/modules");

		comeon.require("./subdirectory/module1", function (exports) {
			expect(exports).to.equal("Relative module1 script in subdirectory");
			done();
		});
	});

	it("should require module2 in subdirectory", function (done) {
		var comeon = new Comeon("base/test/modules");

		comeon.require("./subdirectory/module2", function (exports) {
			expect(exports).to.equal("Relative module2 package in subdirectory");
			done();
		});
	});

	// it("should require module3 in subdirectory", function (done) {
	// 	var comeon = new Comeon("base/test/modules");

	// 	comeon.require("./subdirectory/module3", function (exports) {
	// 		expect(exports).to.equal("Relative module3 package in subdirectory");
	// 		done();
	// 	});
	// });

	it("should require relative1", function (done) {
		var comeon = new Comeon("base/test/modules");

		comeon.require("./relative1", function (exports) {
			expect(exports.module1).to.equal("Relative module1 script");
			expect(exports.module2).to.equal("Relative module2 package");
			// expect(exports.module3).to.equal("Relative module3 package");
			expect(exports.module1a).to.equal("Relative module1 script in subdirectory");
			expect(exports.module2a).to.equal("Relative module2 package in subdirectory");
			// expect(exports.module3a).to.equal("Relative module3 package in subdirectory");

			done();
		});
	});

	it("should require relative1 in subdirectory", function (done) {
		var comeon = new Comeon("base/test/modules");

		comeon.require("./subdirectory/relative1", function (exports) {
			expect(exports.module1).to.equal("Relative module1 script in subdirectory");
			expect(exports.module2).to.equal("Relative module2 package in subdirectory");
			// expect(exports.module3).to.equal("Relative module3 package in subdirectory");
			expect(exports.module1a).to.equal("Relative module1 script");
			expect(exports.module2a).to.equal("Relative module2 package");
			// expect(exports.module3a).to.equal("Relative module3 package");

			done();
		});
	});

	it("should require relative2", function (done) {
		var comeon = new Comeon("base/test/modules");

		comeon.require("./relative2", function (exports) {
			expect(exports.module1).to.equal("Relative module1 script in subdirectory");
			expect(exports.module2).to.equal("Relative module2 package in subdirectory");
			// expect(exports.module3).to.equal("Relative module3 package in subdirectory");
			expect(exports.module1a).to.equal("Relative module1 script");
			expect(exports.module2a).to.equal("Relative module2 package");
			// expect(exports.module3a).to.equal("Relative module3 package");

			done();
		});
	});

	it("should require relative2 in subdirectory", function (done) {
		var comeon = new Comeon("base/test/modules");

		comeon.require("./subdirectory/relative2", function (exports) {
			expect(exports.module1).to.equal("Relative module1 script");
			expect(exports.module2).to.equal("Relative module2 package");
			// expect(exports.module3).to.equal("Relative module3 package");
			expect(exports.module1a).to.equal("Relative module1 script in subdirectory");
			expect(exports.module2a).to.equal("Relative module2 package in subdirectory");
			// expect(exports.module3a).to.equal("Relative module3 package in subdirectory");

			done();
		});
	});
});
