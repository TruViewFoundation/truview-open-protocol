/**
 * statusManager_test
 * Created by Dafna-Truview
 * on 7/1/18
 */

import assertRevert from "./helpers/assertRevert";
import {inLogs} from './helpers/expectEvent';


const BigNumber = web3.BigNumber;
require('babel-register');
require('babel-polyfill');


require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

var tokenContract = artifacts.require("./token/TruViewToken.sol");
var accessControlContract = artifacts.require("./ownership/AccessControlManager.sol");
var statusManagerContract = artifacts.require("./protocol/StatusMAnager.sol");


contract('TruView Status Manager Contracts', function ([super_admin,pa,p1, p2, p3,tv]) {

    var ADMIN_ROLE = "superAdmin"
    var PLATFORM_ADMIN = "platformAdmin";
    var PLATFORM_ROLE = "platform";
   
    beforeEach(async function () {
        acm = await accessControlContract.new({from: super_admin});
        token = await tokenContract.new(acm.address);
        status_mgr = await statusManagerContract.new(token.address,{super_admin});

        const result1 = await acm.adminAddRole(pa, PLATFORM_ADMIN, {from: super_admin});
       // const result2 = await acm.adminAddRole(p1, PLATFORM_ROLE, {from: pa});
       // const result3 = await acm.adminAddRole(p2, PLATFORM_ROLE, {from: pa});
       // const result4 = await acm.adminAddRole(p3, PLATFORM_ROLE, {from: pa});
    })

    let token;
    let acm;
    let status_mgr;

    describe('Paltform Management', function () {
        describe('Add New Platform', function () {
        
            describe('When Platform admin role', function () {
            const from = pa;
            it('add new platform', async function () {
                await status_mgr.addPlatform(p1, "Platform1", {from});
                let has = await acm.hasRole(p1, PLATFORM_ROLE);
                assert(has)
            });

            it('emits an add new platform event', async function () {
                const {logs} = await tatus_mgr.addPlatform(p1, "Platform1", {from});

                assert.equal(logs.length, 2);
                assert.equal(logs[0].event, 'AddPlatform');
                assert.equal(logs[0].args.platform, p1);
                assert.equal(logs[0].args.admin, pa);
                assert.equal(logs[0].args.platformName, "Platform1");
            }); 
            
        });

            describe('When not Platform admin role', function () {
              const from = tv;
             it('reverts', async function () {
                 await assertRevert(status_mgr.addPlatform(p2, "Platform2", {from}));
              });
            });
       
         });
    });
});