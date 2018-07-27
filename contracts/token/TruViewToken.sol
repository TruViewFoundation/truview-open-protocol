pragma solidity 0.4.24;


import "./DetailedERC20.sol";
import "./BurnableToken.sol";
import "./MintableToken.sol";
import "../ownership/AccessControlClient.sol";


contract TruViewToken is MintableToken, BurnableToken, DetailedERC20, AccessControlClient {


    string public constant ROLE_ADMIN = "superAdmin";
    string public constant PLATFORM_ADMIN = "platformAdmin";

    //Token Spec
    string public constant NAME = "TruView";
    string public constant SYMBOL = "TRU";
    uint8 public constant DECIMALS = 18;



    /**
      * @dev Throws if called by any account other than the minters(ACM) or if the minting period finished.
      */
    modifier canMint() {
        require(_isMinter(msg.sender));
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
    AccessControlClient(acm)
    DetailedERC20(NAME,SYMBOL,DECIMALS) public{}



    function _isMinter(address addr) internal view returns (bool) {
        return hasRole(addr,PLATFORM_ADMIN);
    }

    function transfer(address _to, uint256 _value) canTransfer public returns (bool) {
         return super.transfer(_to,_value);
    }

    function transferFrom(address _from, address _to, uint256 _value) canTransfer public returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

}
