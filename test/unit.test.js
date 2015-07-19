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

	describe("_fetchFile", function () {
		var comeon = new Comeon("base/test/modules");

		it("", function (done) {
			comeon._fetchFile("qwe1").then(function () {
				done();
			}, function () {
				throw "Fail";
				done();
			});
		});
	});
});
