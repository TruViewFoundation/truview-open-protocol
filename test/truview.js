/**
 * truview
 * Created by ordemri
 * on 7/1/18
 */
import assertRevert from "./helpers/assertRevert";
import expectThrow from './helpers/expectThrow';
import ether from './helpers/ether'
import latestTime from "./helpers/latestTime";
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


contract('TruView Contracts', function ([admin, admin2, p1, p2, p3, tv]) {
    var ROLE_ADMIN = "admin";
    var PLATFORM_ADMIN = "platformAdmin";
    let token;
    let acm;


    beforeEach(async function () {
            acm = await accessControlContract.new({from: admin});
            token = await tokenContract.new(acm.address);

            const result = await acm.adminAddRole(p1, PLATFORM_ADMIN, {from: admin});
            const result1 = await acm.addAdmin(admin2, {from: admin});
            const result2 = await acm.adminAddRole(p2, PLATFORM_ADMIN, {from: admin});
            const result3 = await acm.adminAddRole(p3, PLATFORM_ADMIN, {from: admin});

        }
    )

    describe('Access Control Manager', function () {

        it('constructor admin role addition', async function () {
            let has = await acm.hasRole(admin, ROLE_ADMIN);
            assert(has);
        });


        it('admin role addition', async function () {
            let has = await acm.hasRole(admin2, ROLE_ADMIN);
            assert(has);
        });

        it('when admin role not exists!', async function () {
            let has = await acm.hasRole(p1, ROLE_ADMIN);
            assert(!has);
        });

        it('platform role addition', async function () {
            let has = await acm.hasRole(p1, PLATFORM_ADMIN);
            assert(has);
        });
        it('platform role addition', async function () {
            let has = await acm.hasRole(p2, PLATFORM_ADMIN);
            assert(has);
        });

        it('platform role addition', async function () {
            let has = await acm.hasRole(p3, PLATFORM_ADMIN);
            assert(has);
        });

    });


});

