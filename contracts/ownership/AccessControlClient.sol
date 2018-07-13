pragma solidity ^0.4.21;

import "./AccessControlManager.sol";


contract AccessControlClient {


    AccessControlManager acm;


    function AccessControlClient(AccessControlManager addr){
        acm = AccessControlManager(addr);
    }

    /**
    * @dev add a role to an address
    * ONLY WITH RELEVANT ROLES!!
    * @param addr address
    * @param roleName the name of the role
    */
    function addRole(address addr, string roleName)
    public
    {
        acm.adminAddRole(addr,roleName);
    }


    /**
     * @dev remove a role from an address
     * ONLY WITH RELEVANT ROLES!!
     * @param addr address
     * @param roleName the name of the role
     */
    function removeRole(address addr, string roleName)
    public
    {
        acm.adminRemoveRole(addr,roleName);
    }

    /**
     * @dev add a role to an addresses array
     * ONLY WITH RELEVANT ROLES!!
     * solidity dosen't supports dynamic arrays as arguments so only one role at time.
     * @param addrs addresses
     * @param roleName the name of the role
     */
    function addRoles(address[] addrs, string roleName)
    public
    {
        acm.adminAddRoles(addrs,roleName);

    }


    /**
     * @dev remove a specific role from an addresses array
     * ONLY WITH RELEVANT ROLES!!
     * solidity dosen't supports dynamic arrays as arguments so only one role at time.
     * @param addrs addresses
     * @param roleName the name of the role
     */
    function removeRoles(address[] addrs, string roleName)
    public
    {
        acm.adminRemoveRoles(addrs,roleName);
    }

    /**
     * @dev reverts if addr does not have role
     * @param addr address
     * @param roleName the name of the role
     * // reverts
     */
    function checkRole(address addr, string roleName)
    view
    public
    {
        acm.checkRole(addr, roleName);
    }

    /**
     * @dev determine if addr has role
     * @param addr address
     * @param roleName the name of the role
     * @return bool
     */
    function hasRole(address addr, string roleName)
    view
    public
    returns (bool)
    {
        return acm.hasRole(addr, roleName);
    }


}
