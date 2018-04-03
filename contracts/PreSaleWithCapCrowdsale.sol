pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";

contract PreSaleWithCapCrowdsale is TimedCrowdsale, WhitelistedCrowdsale, CappedCrowdsale {

  function PreSaleWithCapCrowdsale(
    uint256 _rate,
    address _wallet,
    ERC20 _token,
    uint256 _openingTime,
    uint256 _closingTime,
    uint256 _cap
  )
    public
    Crowdsale(_rate, _wallet, _token)
    TimedCrowdsale(_openingTime, _closingTime)	
    CappedCrowdsale(_cap)
  {
  }

  function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {
    require(_beneficiary != address(0));
    require(_weiAmount != 0);
    require(block.timestamp >= openingTime || whitelist[_beneficiary]);
    require(block.timestamp <= closingTime);
    require(weiRaised.add(_weiAmount) <= cap);
  }

}
