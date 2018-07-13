pragma solidity ^0.4.24;

import "../ownership/AccessControlClient.sol";

contract StatusManager is AccessControlClient {

    string public constant PLATFORM_ADMIN = "platformAdmin";
    string public constant ROLE_PLATFORM = "platform";

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
     *  @dev Add Platform - allows adding a platform to the eco system , this platform will be authorised to Mint TRU tokens 
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
     *  @dev Remove Platform - allows removing a platform from the eco system , this platform will no longer be authorised to Mint TRU tokens 
     *  @param addr address of the platform to add
     *  @return True if the operation was successful.
     */
    function removePlatform(address addr)
    onlyPlatformAdmin
    public
    returns (bool)
    {
        // Check that the addr is a platform admin and exists as a platform
        removeRole(addr, ROLE_PLATFORM);
        emit RemovePlatform(addr, msg.sender);
        return true;
    }

}