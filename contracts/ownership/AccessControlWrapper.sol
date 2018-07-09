pragma solidity ^0.4.21;

import "./AccessControlManager.sol";


contract AccessControlWrapper {


    AccessControlManager acm;


    function AccessControlWrapper(AccessControlManager addr){
        acm = AccessControlManager(addr);
    }

    /**
    * @dev add a role to an address
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
     * @param addr address
     * @param roleName the name of the role
     */
    function removeRole(address addr, string roleName)
    public
    {
        acm.adminRemoveRole(addr,roleName);
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
