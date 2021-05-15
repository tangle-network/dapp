const Web3 = require('web3');
const ganacheCli = require('ganache-cli');
const path = require('path');
const fs = require('fs');
const server = ganacheCli.server();
const poolSize = '1000000000000000000';

const contractsPackage = path.join(process.cwd(), 'packages', 'contracts');
function saveContractAddresses(data) {
  const addressesPath = path.join(contractsPackage, 'src', 'addreses.json');
  fs.writeFileSync(addressesPath, JSON.stringify(data, null, 2));
}

async function deploy(contractName, contractsPath, web3, arguments = []) {
  const contractPath = path.join(contractsPath, contractName);
  const data = fs.readFileSync(contractPath).toString();
  const contractData = JSON.parse(data);
  const contract = new web3.eth.Contract(contractData.abi);
  const contractTx = contract.deploy({
    data: contractData.bytecode,
    arguments,
  });

  const createdContract = await contractTx.send({
    gas: -1,
    from: web3.eth.defaultAccount,
  });
  return createdContract.options.address;
}

async function main() {
  const contracts = {};
  // const provider = Web3.providers.HttpProvider(uri);
  const web3 = new Web3(ganacheCli.provider());
  const accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = accounts[0];
  const contractsPath = path.join(contractsPackage, 'src');
  const contractFileNames = fs.readdirSync(contractsPath);
  const contractsToDeploy = ['Hasher.json', 'Verifier.json'];

  // for (const contractName of contractsToDeploy) {
  //   try {
  //     const address = await deploy(contractName, contractsPath, web3);
  //     contracts[contractName.replace('.json', '')] = address;
  //   } catch (e) {
  //     console.log(e);
  //     console.log(contractName);
  //   }
  // }

  const anchorContractAddress = await deploy('Hasher.json', contractsPath, web3);

  contracts['Anchor'] = anchorContractAddress;
  saveContractAddresses(contracts);
}

server.listen(9932, (err, bc) => {
  main();
});
