pragma solidity ^0.4.24;  

import "../ownership/AccessControlClient.sol";
import "../token/TruViewToken.sol";


contract StatusManager is AccessControlClient {

    string public constant PLATFORM_ADMIN = "platformAdmin";
    string public constant ROLE_PLATFORM = "platform";
    uint public constant TIME_TO_CLAIM = 30 days;
    TruViewToken token; 

    // Enum for new tokens state :
    // Pending - Token generated - within creation lock time period and not disputed / claimed
    // Claimed - Token was gnenerated and claimed by the platform - valid token
    // Disputed - Token was generated but was disputed by the concensus model  
    enum State { Pending, Claimed, Disputed } 
    uint transactionId = 0; //unique indentifier for a platform transaction request

    struct TokenRequest { // Struct
        State  state; // Pending, Claimed, Disputed
        string url; // platofrm that created the Token
        uint amount; // Number of token to create
        uint createdDateTime; // created time 
    }

    mapping(address => mapping (uint =>TokenRequest)) public platformTokenData;

    event AddPlatform(address platform , address admin , string platformName);
    event RemovePlatform(address platform , address admin);
    event GenerateNewTokens(address platform , uint txId,uint amount,string url);
    event Dispute(address disputedPlatform ,uint txId, address auditor,string reason);
    event Claim(address toPlatform,uint txId,address from,string reason);

    /**
     * @dev modifier to scope access to platforms
     * // reverts
     */
    modifier onlyPlatform(){
        checkRole(msg.sender, ROLE_PLATFORM);
        _;
    }
    /** 
    * @dev modifier to scope access to platforms admins
     * // reverts
     */
    modifier onlyPlatformAdmin(){
        checkRole(msg.sender, PLATFORM_ADMIN);
        _;
    }

    /** 
    * @dev modifier to validate State Changes
    * // reverts
    */
    modifier isValidState(address platform,uint txId,State nextState){
            State currState = platformTokenData[platform][txId].state;
            if(checkState(currState,nextState)){_;}
    }

    /** 
    * @dev modifier to validate whether a dipsute is allowed 
     * // reverts
     */
    modifier canDispute(address platform,uint txId){
        if(msg.sender != platform){
            uint createdTime = platformTokenData[platform][txId].createdDateTime;
            // If TIME_TO_CLAIM days have not passed since the token generation , the transaction cn be disputed.
            if(now - createdTime < TIME_TO_CLAIM){_;}
        }
    }
     /** 
    * @dev modifier to validate whether a dipsute is allowed 
     * // reverts
     */
    modifier canClaim(uint txId){
        uint createdTime = platformTokenData[msg.sender][txId].createdDateTime;
        if(now - createdTime >= TIME_TO_CLAIM){_;}   //TO DO CHANGE THE IF AND CHECK > 0
    }

    constructor (TruViewToken addr) public { token = TruViewToken(addr);}
    

    /** 
     *  @dev checkState - checks if a State change is allowed
     *  @return bool True is the State change is allowed.
     */
    function checkState(State currState,State nextState)
    internal
    pure
    returns(bool)
    {
        //To dispute / claim a transaction , previous state has to be pending
        return currState == State.Pending && nextState != State.Pending;
        
    }
     /** 
     *  @dev getNextTransactionIdVal - get next value for the transaction counter id.
     *  @return uint representing the next transaction id.
     */
    function getNextTransactionIdVal()
    internal
    returns(uint) {
        return ++transactionId;
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
    returns (bool){
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
        token.mint(address(this), amount);// the conrtact mints the tokens. later on the platform can claim it.
        TokenRequest storage newToken;
        newToken.state = State.Pending; // first state of a token is Pending
        newToken.url = url; // url that generated the engagemments for the tokens being genenrated 
        newToken.amount = amount; // amount of Tokens to generate
        newToken.createdDateTime = now;  // generating time 
        uint txId = getNextTransactionIdVal();
        platformTokenData[msg.sender][txId] = newToken;
        emit GenerateNewTokens(msg.sender, txId, amount, url);
        return true;
         
    }
    /** 
     *  @dev disputeGeneration - cancel the generation of a token 
     *  @param platform -  the platoform which the tokens are being cancelled for
     *  @param txId -  the transaction which the tokens are being cancelled for
     */
    function disputeGeneration (address platform,uint txId)
    onlyPlatform
    isValidState(platform,txId,State.Disputed)
    canDispute(platform,txId)
    public
    {
        uint amount = platformTokenData[platform][txId].amount; //amount of token generated for this transaction.
        token.burn(amount);
        //Change transcation status to Disputed
        platformTokenData[platform][txId].state = State.Disputed;
        emit Dispute(platform,txId,msg.sender,"disputed");
    }

    /** 
     *  @dev claimToken - generated tokens which were not disputed with in the block period can be claimed
     *  @param txId the transaction which the tokens are being claimed for 
     */
    function claimToken (uint txId)
    onlyPlatform
    isValidState(msg.sender,txId,State.Claimed)
    canClaim(txId)
    public
    {
        
        //transfer funds
        uint amount = platformTokenData[msg.sender][txId].amount;// amount to be claimed
        require(token.transfer(msg.sender,amount));
       //Change transcation status to Claimed
        platformTokenData[msg.sender][txId].state = State.Claimed;
        emit Claim(msg.sender,txId,address(this),"claimed");
    }


}