const A = artifacts.require("A");
const B = artifacts.require("B");
const C = artifacts.require("C");
const D = artifacts.require("D");
const invertedD = artifacts.require("invertedD");

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('C3Linearization', function () {
    it('should linearize the inheritance graph', async function () {
        let contractA = await A.new();
	let contractB = await B.new();
	let contractC = await C.new();
	let contractD = await D.new();

	let logs = null;
	({ logs } = await contractD.f());
	logs.length.should.be.equal(4);
	logs[0].event.should.be.eq('somethingD');
	logs[1].event.should.be.eq('somethingC');
	logs[2].event.should.be.eq('somethingB');
        logs[3].event.should.be.eq('somethingA');

	let contractInvertedD = await invertedD.new();
	({ logs } = await contractInvertedD.f());
	logs.length.should.be.equal(4);
	logs[0].event.should.be.eq('somethingD');
	logs[1].event.should.be.eq('somethingB');
	logs[2].event.should.be.eq('somethingC');
        logs[3].event.should.be.eq('somethingA');
    });
});
