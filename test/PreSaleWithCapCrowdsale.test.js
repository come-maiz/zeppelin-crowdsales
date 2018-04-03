import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';

const SimpleToken = artifacts.require('./SimpleToken.sol');
const PreSaleWithCapCrowdsale = artifacts.require('./PreSaleWithCapCrowdsale.sol');

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('PreSaleWithCapCrowdsale', function ([owner, wallet, investor]) {

    const RATE = new BigNumber(1);
    const CAP = ether(2);
    
    before(async function () {
	// Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
	await advanceBlock();
    });

    beforeEach(async function () {
	this.openingTime = latestTime() + duration.weeks(1);
	this.closingTime = this.openingTime + duration.weeks(1);
	this.afterClosingTime = this.closingTime + duration.seconds(1);

	this.token = await SimpleToken.new({ from: owner });
	this.crowdsale = await PreSaleWithCapCrowdsale.new(
	    RATE, wallet, this.token.address, this.openingTime, this.closingTime, CAP
	);
	const totalSupply = await this.token.totalSupply();
	await this.token.transfer(this.crowdsale.address, totalSupply, { from: owner })
    });

    it('should create crowdsale with correct parameters', async function () {
	this.crowdsale.should.exist;
	this.token.should.exist;

	const rate = await this.crowdsale.rate();
	const walletAddress = await this.crowdsale.wallet();
	const openingTime = await this.crowdsale.openingTime();
	const closingTime = await this.crowdsale.closingTime();
	const cap = await this.crowdsale.cap();

	rate.should.be.bignumber.equal(RATE);
	walletAddress.should.be.equal(wallet);	
	openingTime.should.be.bignumber.equal(this.openingTime);
	closingTime.should.be.bignumber.equal(this.closingTime);
	cap.should.be.bignumber.equal(CAP);
    });

    it('should not accept non-whitelisted payments before start', async function () {
	await this.crowdsale.buyTokens(investor, { from: investor, value: ether(1) }).should.be.rejectedWith(EVMRevert);
    });

    it('should accept whitelisted payments before start', async function () {
	const investmentAmount = ether(1);
	const expectedTokenAmount = RATE.mul(investmentAmount);
	
	await this.crowdsale.addToWhitelist(investor);
	await this.crowdsale.buyTokens(investor, { value: investmentAmount, from: investor }).should.be.fulfilled;

	(await this.token.balanceOf(investor)).should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should not accept whitelisted payments over cap before start', async function () {
	await this.crowdsale.addToWhitelist(investor);	
	await this.crowdsale.buyTokens(investor, { value: CAP, from: investor }).should.be.fulfilled;
	await this.crowdsale.buyTokens(investor, { from: investor, value: ether(1) }).should.be.rejectedWith(EVMRevert);
    });    

    it('should accept non-whitelisted payments during the sale', async function () {
	const investmentAmount = ether(1);
	const expectedTokenAmount = RATE.mul(investmentAmount);

	await increaseTimeTo(this.openingTime);

	await this.crowdsale.buyTokens(investor, { value: investmentAmount, from: investor }).should.be.fulfilled;

	(await this.token.balanceOf(investor)).should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should accept whitelisted payments during the sale', async function () {
	const investmentAmount = ether(1);
	const expectedTokenAmount = RATE.mul(investmentAmount);

	await this.crowdsale.addToWhitelist(investor);
	await increaseTimeTo(this.openingTime);

	await this.crowdsale.buyTokens(investor, { value: investmentAmount, from: investor }).should.be.fulfilled;

	(await this.token.balanceOf(investor)).should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should not accept whitelisted payments over cap during the sale', async function () {
	await this.crowdsale.addToWhitelist(investor);	
	await increaseTimeTo(this.openingTime);
	await this.crowdsale.buyTokens(investor, { value: CAP, from: investor }).should.be.fulfilled;
	await this.crowdsale.buyTokens(investor, { from: investor, value: ether(1) }).should.be.rejectedWith(EVMRevert);
    });

    it('should not accept non-whitelisted payments after end', async function () {
	await increaseTimeTo(this.afterClosingTime);
	await this.crowdsale.buyTokens(investor, { from: investor, value: ether(1) }).should.be.rejectedWith(EVMRevert);
    });

    it('should not accept whitelisted payments after end', async function () {
	await this.crowdsale.addToWhitelist(investor);	
	await increaseTimeTo(this.afterClosingTime);
	await this.crowdsale.buyTokens(investor, { from: investor, value: ether(1) }).should.be.rejectedWith(EVMRevert);
    });

});
