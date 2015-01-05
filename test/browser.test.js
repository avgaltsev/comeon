var expect = chai.expect;

describe("Comeon", function () {
	it("should instantiate", function () {
		var comeon1 = new Comeon(),
			comeon2 = new Comeon("base/test/modules"),
			comeon3 = new Comeon("base/test/modules/"),
			comeon4 = new Comeon("/base/test/modules"),
			comeon5 = new Comeon("./base/test/modules");

		expect(comeon1._path).to.equal("/");
		expect(comeon2._path).to.equal("base/test/modules/");
		expect(comeon3._path).to.equal("base/test/modules/");
		expect(comeon4._path).to.equal("/base/test/modules/");
		expect(comeon5._path).to.equal("./base/test/modules/");
	});

	it("should require relative module script", function (done) {
		var comeon = new Comeon("base/test/modules");

		comeon.require("./module1", function (exports) {
			expect(exports).to.equal("Relative module1 script");
			done();
		});
	});

	it("should require relative module simple package", function (done) {
		var comeon = new Comeon("base/test/modules");

		comeon.require("./module2", function (exports) {
			expect(exports).to.equal("Relative module2 package");
			done();
		});
	});

	// it("should require relative module package", function (done) {
	// 	var comeon = new Comeon("base/test/modules");

	// 	comeon.require("./module3", function (exports) {
	// 		expect(exports).to.equal("Relative module3 package");
	// 		done();
	// 	});
	// });
});
