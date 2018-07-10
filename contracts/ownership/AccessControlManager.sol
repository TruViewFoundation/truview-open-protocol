pragma solidity ^0.4.21;


import "./AccessControl.sol";


contract AccessControlManager is AccessControl {

    string public constant ROLE_ADMIN = "superAdmin";
    string public constant PLATFORM_ADMIN = "platformAdmin";

    /**
     * @dev modifier to scope access to admins
     * // reverts
     */
    modifier onlyAdmin()
    {
        checkRole(msg.sender, ROLE_ADMIN);
        _;
    }

    /**
     * @dev modifier to check adding/removing roles
     *
     */
    modifier canUpdateRole(string role){
        if ((keccak256(role) != keccak256(ROLE_ADMIN) && (hasRole(msg.sender, ROLE_ADMIN) || hasRole(msg.sender, PLATFORM_ADMIN))))
        _;
    }

    /**
     * @dev constructor. Sets msg.sender as admin by default
     */
    function AccessControlManager()
    public
    {
        addRole(msg.sender, ROLE_ADMIN);
    }

    /**
     * @dev add admin role to an address
     * @param addr address
     */
    function addAdmin(address addr)
    onlyAdmin
    public
    {
        addRole(addr, ROLE_ADMIN);
    }

    /**
     * @dev remove a role from an address
     * @param addr address
     */
    function removeAdmin(address addr)
    onlyAdmin
    public
    {
        require(msg.sender != addr);
        removeRole(addr, ROLE_ADMIN);
    }

    /**
     * @dev add a role to an address
     * @param addr address
     * @param roleName the name of the role
     */
    function adminAddRole(address addr, string roleName)
    canUpdateRole(roleName)
    public
    {
        addRole(addr, roleName);
    }


    /**
     * @dev remove a role from an address
     * @param addr address
     * @param roleName the name of the role
     */
    function adminRemoveRole(address addr, string roleName)
    canUpdateRole(roleName)
    public
    {
        removeRole(addr, roleName);
    }


}
