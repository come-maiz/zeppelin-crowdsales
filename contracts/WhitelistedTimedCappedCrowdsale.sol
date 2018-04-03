pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";

contract WhitelistedTimedCappedCrowdsale is TimedCrowdsale, WhitelistedCrowdsale, CappedCrowdsale {

  event Debug(address _beneficiary, uint256 _tokenAmount);

  function WhitelistedTimedCappedCrowdsale(
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

}
