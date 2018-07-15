pragma solidity ^0.4.24;  

import "../ownership/AccessControlClient.sol";
import "../token/MintableToken.sol";

contract StatusManager is AccessControlClient {

    string public constant PLATFORM_ADMIN = "platformAdmin";
    string public constant ROLE_PLATFORM = "platform";

    // Enum for new tokens state :
    // Pending - Token generated - within creation lock time period and not disputed / claimed
    // Claimed - Token was gnenerated and claimed by the platform - valid token
    // Disputed - Token was generated but was disputed by the concensus model  
    enum State { Pending, Claimed, Disputed } 

    struct NewTokens { // Struct
        State  state; // Pending, Claimed, Disputed
        string url; // platofrm that created the Token
        uint amount; // Number of token to create
        uint createdDateTime; // created time 
    }

    mapping(address => NewTokens) public newTokenData;

    event AddPlatform(address platform , address admin , string platformName);
    event RemovePlatform(address platform , address admin);

    /**
     * @dev modifier to scope access to platforms
     * // reverts
     */
    modifier onlyPlatform()
    {
        checkRole(msg.sender, ROLE_PLATFORM);
        _;
    }
    /** 
    * @dev modifier to scope access to platforms admins
     * // reverts
     */
    modifier onlyPlatformAdmin()
    {
        checkRole(msg.sender, PLATFORM_ADMIN);
        _;
    }

    /** 
     *  @dev addPlatform - allows adding a platform to the eco system , this platform will be authorised to generate TRU tokens 
     *  @param addr address of the platform to add
     *  @param name name of the platform to add
     *  @return True if the operation was successful.
     */
    function addPlatform(address addr,string name)
    onlyPlatformAdmin
    public
    returns (bool)
    {
        addRole(addr, ROLE_PLATFORM);
        emit AddPlatform(addr, msg.sender,name);
        return true;
    }

    /** 
     *  @dev removePlatform - allows removing a platform from the eco system , this platform will no longer be authorised to genrate TRU tokens 
     *  @param addr address of the platform to add
     *  @return True if the operation was successful.
     */
    function removePlatform(address addr)
    onlyPlatformAdmin
    public
    returns (bool)
    {
        removeRole(addr, ROLE_PLATFORM);
        emit RemovePlatform(addr, msg.sender);
        return true;
    }

     /** 
     *  @dev generateToken - generate amount of tokens for the supplied url
     *  @param amount amount of tokens to generate
     *  @param url the url which the tokens are being claimed for
     *  @return returnCode to specify the status of the operation
     */
    function generateToken (uint amount, string url )
    onlyPlatform
    public
    returns (bool)
    {   
        MintableToken mintNewToken;
        require(mintNewToken.mint(msg.sender, amount));
        NewTokens storage newToken;
        newToken.state = State.Pending; // first state of a token is Pending
        newToken.url = url; // url that generated the engagemments for the tokens being genenrated 
        newToken.amount = amount; // amount of Tokens to generate
        newToken.createdDateTime = now;  // generating time 
        newTokenData[msg.sender] = newToken;
        return true;
         
    }
    /** 
     *  @dev disputeGeneration - cancel the generation of a token 
     *  @param amount amount of tokens to cancel
     *  @param url the url which the tokens are being cancelled for
     *  @return returnCode to specify the status of the operation
     */




    /** 
     *  @dev claimToken - generated tokens which were not disputed with in the block period can be claimed
     *  @param amount amount of tokens to claim
     *  @param url the url which the tokens are being claimed for
     *  @return returnCode to specify the status of the operation
     */

}