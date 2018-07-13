/**
 * truview
 * Created by ordemri
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


contract('TruView Contracts', function ([admin, admin2, p1, p2, p3, tv,o1,o2,o3,o4]) {
    var ROLE_ADMIN = "superAdmin";
    var PLATFORM_ADMIN = "platformAdmin";
    var PLATFORM_ROLE = "platformAdmin";
    var _name = 'TruView';
    var _decimals = 18;
    var _symbol = 'TRU'

    let token;
    let acm;


    beforeEach(async function () {
            acm = await accessControlContract.new({from: admin});
            token = await tokenContract.new(acm.address);

            const result = await acm.adminAddRole(p1, PLATFORM_ADMIN, {from: admin});
            const result1 = await acm.addAdmin(admin2, {from: admin});
            const result2 = await acm.adminAddRole(p2, PLATFORM_ADMIN, {from: admin});
            const result3 = await acm.adminAddRole(p3, PLATFORM_ADMIN, {from: admin});

        })

    describe('TruView Token', function () {
        it('has a name', async function () {
            const name = await token.name();
            name.should.be.equal(_name);
        });

        it('has a symbol', async function () {
            const symbol = await token.symbol();
            symbol.should.be.equal(_symbol);
        });

        it('has an amount of decimals', async function () {
            const decimals = await token.decimals();
            decimals.should.be.bignumber.equal(_decimals);
        });


        describe('Minting Tokens', function () {

            const amount = 200 * 10 ** _decimals;

            describe('when the sender is the token owner', function () {
                const from = p1;

                describe('When Platform admin role', function () {
                    it('mints the requested amount', async function () {
                        await token.mint(p2, amount, {from});

                        const balance = await token.balanceOf(p2);
                        assert.equal(balance, amount);
                    });

                    it('emits a mint finished event', async function () {
                        const {logs} = await token.mint(p3, amount, {from});

                        assert.equal(logs.length, 2);
                        assert.equal(logs[0].event, 'Mint');
                        assert.equal(logs[0].args.to, p3);
                        assert.equal(logs[0].args.amount, amount);
                        assert.equal(logs[1].event, 'Transfer');
                    });
                });

            });

            describe('when the sender is not platform admin', function () {
                const from = tv;
                it('reverts', async function () {
                    await assertRevert(token.mint(admin, amount, {from}));
                });

                describe('when the minter is superAdmin', function () {
                    it('reverts', async function () {
                        await assertRevert(token.mint(admin, amount, {from}));
                    });
                });
            });
        });


        describe('Burning Tokens', function () {
            var start = 500 * (10 ** _decimals);
            var amount = 20 * (10 ** _decimals);

            beforeEach(async function () {
                const {logs} = await token.mint(tv, start, {from: p1});
            });

            it('burns the requested amount', async function () {

                let {logs} = await token.burn(amount, {from: tv});

                const balance = await token.balanceOf(tv);
                balance.should.be.bignumber.equal(start - amount);
            });

            it('emits a burn event', async function () {
                let {logs} = await token.burn(amount, {from: tv});
                const event = await inLogs(logs, 'Burn');
                event.args.burner.should.eq(tv);
                event.args.value.should.be.bignumber.equal(amount);
            });

            it('emits a transfer event', async function () {
                let {logs} = await token.burn(amount, {from: tv});
                const event = await inLogs(logs, 'Transfer');
                event.args.from.should.eq(tv);
                event.args.to.should.eq('0x0000000000000000000000000000000000000000');
                event.args.value.should.be.bignumber.equal(amount);
            });

            it('reverts', async function () {
                await assertRevert(token.burn(start + 1, {from: tv}));
            });

        });
    });

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

        it('no admin role revert', async function () {
            assertRevert(acm.checkRole(p3, ROLE_ADMIN));
        });

        it('no role for admin addition', async function () {
            assertRevert(acm.addAdmin(admin2, {from: p1}));
        });

        it('cant add superAdmin role from regular adminAddRole - platform admin', async function () {
            assertRevert(acm.adminAddRole(p2, ROLE_ADMIN, {from: p1}));
        });

        it('cant add superAdmin role from regular adminAddRole - super admin', async function () {
            assertRevert(acm.adminAddRole(p2, ROLE_ADMIN, {from: admin}));
        });

        it('cant add superAdmin role from regular adminAddRoles - unauthorized account', async function () {
            assertRevert(acm.adminAddRole(o1, ROLE_ADMIN, {from: o4}));
        });

        it('adding new platform by admin', async function () {
            const result2 = await acm.adminAddRole(p2, PLATFORM_ROLE, {from: admin});
            let has = await acm.hasRole(p2, PLATFORM_ROLE);
            assert(has);
        });

        it('adding new platform by platform admin', async function () {
            const result2 = await acm.adminAddRole(p3, PLATFORM_ROLE, {from: p1});
            let has = await acm.hasRole(p3, PLATFORM_ROLE);
            assert(has);
        });

    });

});

