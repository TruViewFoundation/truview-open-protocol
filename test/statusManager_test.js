/**
 * statusManager_test
 * Created by Dafna-Truview
 * on 7/1/18
 */

import assertRevert from "./helpers/assertRevert";
import {inLogs} from './helpers/expectEvent';
import { save } from "../node_modules/babel-register/lib/cache";
import {increaseTimeTo, duration} from "./helpers/increaseTime";


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


contract('TruView Status Manager Contracts', function ([super_admin,pa, p1, p2, p3,tv]) {

    var ADMIN_ROLE = "superAdmin";
    var PLATFORM_ADMIN = "platformAdmin";
    var PLATFORM_ROLE = "platform";
    var _decimals = 18;
   
    beforeEach(async function () {
        acm = await accessControlContract.new({from: super_admin});
        token = await tokenContract.new(acm.address);
        status_mgr = await statusManagerContract.new(token.address,acm.address,{pa});

        const result = await acm.adminAddRole(super_admin,ADMIN_ROLE, {from: super_admin} )
        const result1 = await acm.adminAddRole(pa, PLATFORM_ADMIN, {from: super_admin});
        const result2 = await acm.adminAddRole(status_mgr.address, PLATFORM_ADMIN, {from: super_admin});
        
    })

    let token;
    let acm;
    let status_mgr;

    describe('Paltform Management', function () {
        describe('Add New Platform', function () {
        
            describe('When Platform admin role', function () {
            const from = pa;
             
            it('add new platform', async function () {
                const {logs} = await status_mgr.addPlatform(p1, 'Platform1', {from});

                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'AddPlatform');
                assert.equal(logs[0].args.platform, p1);
                assert.equal(logs[0].args.admin, pa);
                assert.equal(logs[0].args.platformName, 'Platform1');
            });
            
        });

            describe('When not Platform admin role', function () {
              const from = tv;
             it('reverts', async function () {
                 await assertRevert(status_mgr.addPlatform(p3, 'Platform3', {from}));
              });
            });
       
         });

         describe('Remove a  Platform', function () {
        
            describe('When Platform admin role', function () {
                beforeEach(async function () {
                 const result = await status_mgr.addPlatform(p1, 'Platform1', {from});//Add p1 as a new platform
                })
            const from = pa;
            it('remove a platform', async function () {
               
                const {logs} = await status_mgr.removePlatform(p1, {from});
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'RemovePlatform');
                assert.equal(logs[0].args.platform, p1);
                assert.equal(logs[0].args.admin, pa);
            });
            
        });
            describe('When not Platform admin role', function () {
              const from = tv;
             it('reverts', async function () {
                await assertRevert(status_mgr.removePlatform(p1, {from}));
              });
            });
       
         }); 
    });

    describe('Token life cycle', function () {
        beforeEach(async function () {
            const from = pa;
            const result = await status_mgr.addPlatform(p1, 'Platform1', {from});//Add p1 as a new platform
            const result1 = await status_mgr.addPlatform(p2, 'Platform2', {from});//Add p1 as a new platform
           })
        describe('Gennerate new Token', function () {
            const from = p1;
            var amount = 200 * 10 ** _decimals;
            var url = 'https://truview.org';
          
            describe('When platform role', function () {  
               
                it('generate tokens for a url', async function () {
                
                    const {logs} = await status_mgr.generateToken(amount, url, {from});
                   
                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'GenerateNewTokens');
                    assert.equal(logs[0].args.mintedBy, from);
                    assert.equal(logs[0].args.amount, amount);
                    assert.equal(logs[0].args.url, url);
                   
                //TODO - check the values of the struct - do we need to add a new internal to get the struct details based on the txnid?
                  //TODO - Do we need to check the emit Mint? 
                 });  
        });
        describe('When not Platform  role', function () {
            const from = tv;
           it('reverts', async function () {
               const from = p1;
                var url = 'https://truview.org';
                var amount = 200 * 10 ** _decimals;
                const {logs} = await status_mgr.generateToken(amount, url, {from:p1}); // generate new tokens
                const claimerBalance = await token.balanceOf(p1);
                const txId = logs[0].args.txId
                const a = await status_mgr.getRequestData(p1, txId);
                const claimedAmount = a[0];
                const time = a[1];
                assert(!time.eq(0));
                assert(amount == claimedAmount);
                let afterDispute = parseInt(time) + duration.days(30) + 1;
                await increaseTimeTo(afterDispute);
                await status_mgr.claimToken(txId, {from:p1});
                const claimerBalance2 = await token.balanceOf(p1);
                assert(claimerBalance2.eq(claimedAmount));
              await assertRevert(status_mgr.generateToken(amount, url, {from}));
            });
          });
       
         });

         describe('Dispute Token', function () {
               describe('When platform role', function () {  
                it('dispute tokens', async function () {
                    var amount = 200 * 10 ** _decimals;
                    var url = 'https://truview.org';
                    const {logs} = await status_mgr.generateToken(amount, url, {from:p1}); // generate new tokens
                    const txId = logs[0].args.txId
                    const balanceBeforeDispute =  await token.balanceOf(status_mgr.address);
                    const a = await status_mgr.getRequestData(p1, txId);
                    const amountToDispute = a[0];
                    const time = a[1];
                    assert(!time.eq(0));
                    assert(amountToDispute <= balanceBeforeDispute);
                    await status_mgr.disputeTokenGeneration(p1,txId, {from:p2}); // dispute token by a platform.
                    const amountAfterDispute = await token.balanceOf(p1);
                    assert(balanceBeforeDispute-amountToDispute==amountAfterDispute);
            }); 
            it('reverts - dispute claimed tokens', async function () {
                var url = 'https://truview.org';
                var amount = 200 * 10 ** _decimals;
                const {logs} = await status_mgr.generateToken(amount, url, {from:p1}); // generate new tokens
                const txId = logs[0].args.txId
                const a = await status_mgr.getRequestData(p1, txId);
                const time = a[1];
                let afterDispute = parseInt(time) + duration.days(30) + 1;
                await increaseTimeTo(afterDispute);
                await status_mgr.claimToken(txId, {from:p1});
                assertRevert( status_mgr.disputeTokenGeneration(p1,txId, {from:p2}));
            });
            it('revert -  dispute tokens after dispute time passed', async function () {
                var amount = 200 * 10 ** _decimals;
                var url = 'https://truview.org';
                const {logs} = await status_mgr.generateToken(amount, url, {from:p1}); // generate new tokens
                const txId = logs[0].args.txId
                const a = await status_mgr.getRequestData(p1, txId);
                const claimedAmount = a[0];
                const time = a[1];
                let afterDispute = parseInt(time) + duration.days(30) + 1;
                await increaseTimeTo(afterDispute);
                await assertRevert(status_mgr.disputeTokenGeneration(p1,txId, {from:p2})); // dispute token by a platform.       
        }); 

            }); 
            describe('When not platform role', function () {  
                const from = tv;
                it('reverts', async function () {
                    var amount = 200 * 10 ** _decimals;
                    var url = 'https://truview.org';
                    const {logs} = await status_mgr.generateToken(amount, url, {from:p1}); // generate new tokens
                    const txId = logs[0].args.txId
                    assertRevert( status_mgr.disputeTokenGeneration(p1,txId, {from}));
                });
            });  
    }); 

    describe('Claim Token', function () {
        describe('When platform role', function () {  
            it('claim tokens', async function () {
                var url = 'https://truview.org';
                var amount = 200 * 10 ** _decimals;
                const {logs} = await status_mgr.generateToken(amount, url, {from:p1}); // generate new tokens
                const claimerBalance = await token.balanceOf(p1);
                const txId = logs[0].args.txId
                const a = await status_mgr.getRequestData(p1, txId);
                const claimedAmount = a[0];
                const time = a[1];
                assert(!time.eq(0));
                assert(amount == claimedAmount);
                let afterDispute = parseInt(time) + duration.days(30) + 1;
                await increaseTimeTo(afterDispute);
                await status_mgr.claimToken(txId, {from:p1});
                const claimerBalance2 = await token.balanceOf(p1);
                assert(claimerBalance2.eq(claimedAmount));
              });
              it('reverts- claiming disputed tokens', async function () {
                var amount = 200 * 10 ** _decimals;
                var url = 'https://truview.org';
                const {logs} = await status_mgr.generateToken(amount, url, {from:p1}); // generate new tokens
                const txId = logs[0].args.txId
                await status_mgr.disputeTokenGeneration(p1,txId, {from:p2}); // dispute token by a platform.
                await assertRevert( status_mgr.claimToken(txId, {from:p1}));
            });
            it('reverts- claiming before claiming time passed', async function () {
                var url = 'https://truview.org';
                var amount = 200 * 10 ** _decimals;
                const {logs} = await status_mgr.generateToken(amount, url, {from:p1}); // generate new tokens
                //const claimerBalance = await token.balanceOf(p1);
                const txId = logs[0].args.txId
                await assertRevert(status_mgr.claimToken(txId, {from:p1}));
              });
               
            });
     describe('When not platform role', function () {  
        const from = tv;
        it('reverts', async function () {
            var url = 'https://truview.org';
            var amount = 200 * 10 ** _decimals;
            const {logs} = await status_mgr.generateToken(amount, url, {from:p1}); // generate new tokens
            const txId = logs[0].args.txId
            const a = await status_mgr.getRequestData(p1, txId);
            const time = a[1];
            let afterDispute = parseInt(time) + duration.days(30) + 1;
            await increaseTimeTo(afterDispute);
            await assertRevert( status_mgr.claimToken(txId, {from}));
        });
    });
}); 
}); 
});