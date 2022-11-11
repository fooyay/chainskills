const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config()

module.exports = {
     // See <http://truffleframework.com/docs/advanced/configuration>
     // to customize your Truffle configuration!
     networks: {
          ganache: {
               host: "localhost",
               port: 7545,
               network_id: "*", // Match any network id
               gas: 47000000
          },
          chainskills: {
            host: "localhost",
            port: 8545,
            network_id: "4224",
            gas: 4700000
          },
          goerli: {
            provider: function() {
              return new HDWalletProvider(process.env.MNEMONIC,
                "https://goerli.infura.io/v3/" + process.env.INFURA_API_KEY);
            },
            network_id: 5,
            gas: 4500000,
            gasPrice: 100000000
          }
     },
     compilers: {
      solc: {
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
     }
};
