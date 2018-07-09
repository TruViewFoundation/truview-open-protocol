pragma solidity 0.4.24;


import "./MintableToken.sol";
import "./BurnableToken.sol";
import "./StandardToken.sol";
import "./DetailedERC20.sol";
import "../ownership/Ownable.sol";
import "../ownership/AccessControlWrapper.sol";


contract TruViewToken is MintableToken, BurnableToken, DetailedERC20, AccessControlWrapper {


    string public constant ROLE_ADMIN = "admin";
    string public constant PLATFORM_ADMIN = "platformAdmin";

    //Token Spec
    string public constant NAME = "TruView";
    string public constant SYMBOL = "TRU";
    uint8 public constant DECIMALS = 18;



    /**
      * @dev Throws if called by any account other than the minters(ACM) or if the minting period finished.
      */
    modifier canMint() {
        require(!mintingFinished && _isMinter(msg.sender));
        _;
    }

    /**
      * @dev Throws if locked or any other transfer logic .need to be implemented with Dafna
      */
    modifier canTransfer() {
        //TODO: locking and logic implementation
        _;
    }


    constructor (AccessControlManager acm)
    AccessControlWrapper(acm)
    DetailedERC20(NAME,SYMBOL,DECIMALS) public{}



    function _isMinter(address addr) internal returns (bool) {
        return hasRole(addr,PLATFORM_ADMIN) || hasRole(addr,ROLE_ADMIN);
    }

    function transfer(address _to, uint256 _value) canTransfer public returns (bool) {
        super.transfer(_to,_value);
    }

    function transferFrom(address _from, address _to, uint256 _value) canTransfer public returns (bool) {
        super.transferFrom(_from, _to, _value);
    }

}
