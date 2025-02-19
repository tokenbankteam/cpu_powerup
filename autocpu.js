const {Api, JsonRpc, RpcError} = require("eosjs");
const {JsSignatureProvider} = require("eosjs/dist/eosjs-jssig"); // development only
const fetch = require("node-fetch"); // node only; not needed in browsers
const {TextEncoder, TextDecoder} = require("util"); // node only; native TextEncoder/Decoder
// const { TextEncoder, TextDecoder } = require('text-encoding');  // React Native, IE11, and Edge Browsers only

const defaultPrivateKey = "********your account name PrivateKey***********";
const accountName = 'your account name';
const receiverAccountName = 'your receiver account name';

const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
const rpc = new JsonRpc("https://eos.newdex.one", {fetch});

const _ = require("lodash");
const moment = require("moment");

global.sleep = async (timeout) => {
    return new Promise((res, rej) =>
        setTimeout(() => {
            return res();
        }, timeout)
    );
};

class Runner {
    async run() {
        const api = new Api({
            rpc,
            signatureProvider,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });

        let ret = await rpc.get_account(receiverAccountName)
        let cpu_available = ret.cpu_limit.available;
        console.log(`cpu_available :  ` + cpu_available)
        if (cpu_available < 68888) {
            const result = await api.transact(
                {
                    actions: [
                        {
                            account: "eosio",
                            name: "powerup",
                            authorization: [{actor: accountName, permission: "active",}],
                            data: {
                                "payer": accountName,
                                "receiver": receiverAccountName,
                                "days": 1,
                                "net_frac": 0,
                                "cpu_frac": 2000000000,
                                "max_payment": "0.0800 EOS"
                            },
                        },
                    ],
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 30,
                }
            );
            console.log("powerup :  " + JSON.stringify(result));
        }
    }

    async start() {
        while (true) {
            try {
                console.log(`\n[${moment().format("YYYY-MM-DD HH:mm:ss")}]` + JSON.stringify(rpc));
                await this.run();
            } catch (e) {
                console.error(e.message);
            }
            await sleep(2000);
        }
    }
}

new Runner().start();



  



